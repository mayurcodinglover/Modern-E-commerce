"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useRazorpay } from "@/hooks/use-razorpay";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Smartphone,
  Banknote,
  Shield,
  Loader2,
} from "lucide-react";

export function RazorpayPayment({order,onPaymentSuccess,onPaymentFail}) {
    const user=useSelector((state)=>state.auth.user);
    const isRazorpayLoaded=useRazorpay();
    const [isInitiating,setIsInitiating]=useState(false);
    const [selectedMethod,setSelectedMethod]=useState("upi");

    const paymentMethods=[
         {
      id: "upi",
      label: "UPI",
      icon: Smartphone,
      desc: "Pay via any UPI app",
    },
     {
      id: "card",
      label: "Credit / Debit card",
      icon: CreditCard,
      desc: "Visa, Mastercard, Rupay",
    },
      {
      id: "netbanking",
      label: "Net banking",
      icon: Banknote,
      desc: "All major banks",
    },
    ];
    async function handlePayment() {
    if (!isRazorpayLoaded) {
      toast.error("Payment system loading. Please wait.");
      return;
    }

    try {
      setIsInitiating(true);

      // Step 1 — Create Razorpay order from backend
      const initiateRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          method: selectedMethod,
        }),
      });

      const initiateData = await initiateRes.json();

      if (!initiateData.success) {
        toast.error(initiateData.message || "Failed to initiate payment");
        return;
      }

      const {
        razorpayOrderId,
        amount,
        currency,
        keyId,
      } = initiateData.data;

      // Step 2 — Open Razorpay checkout
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency || "INR",
        name: "ShopApp",
        description: `Order #${order.id.slice(-8).toUpperCase()}`,
        order_id: razorpayOrderId,
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
        },
        theme: { color: "#000000" },

        // Step 3 — Handle payment success
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: order.id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success("Payment successful!");
              onPaymentSuccess(verifyData.data);
            } else {
              toast.error("Payment verification failed");
              onPaymentFail("verification_failed");
            }
          } catch {
            toast.error("Payment verification error");
            onPaymentFail("verification_error");
          }
        },

        // Handle modal close / payment failure
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
            setIsInitiating(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      // Handle payment failure inside modal
      razorpay.on("payment.failed", function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
        onPaymentFail(response.error.code);
        setIsInitiating(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsInitiating(false);
    }
  }
    return (
    <div className="space-y-5">

      {/* Order amount */}
      <div className="bg-secondary/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Amount to pay
          </span>
          <span className="text-2xl font-semibold">
            ₹{Number(order.totalAmount).toFixed(0)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Order #{order.id.slice(-8).toUpperCase()}
        </p>
      </div>

      {/* Payment method selection */}
      <div>
        <p className="text-sm font-medium mb-3">Select payment method</p>
        <div className="space-y-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                    selectedMethod === method.id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/50"
                  }`}
                />
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    selectedMethod === method.id
                      ? "bg-primary/10"
                      : "bg-secondary"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      selectedMethod === method.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{method.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {method.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pay button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handlePayment}
        disabled={isInitiating || !isRazorpayLoaded}
      >
        {isInitiating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Opening payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ₹{Number(order.totalAmount).toFixed(0)}
          </>
        )}
      </Button>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5" />
        <span>Secured by Razorpay — 256-bit SSL encryption</span>
      </div>

      {/* Test mode note */}
      {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.includes("test") && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-xs text-yellow-700 font-medium">
            Test mode — Use card: 4111 1111 1111 1111
          </p>
          <p className="text-xs text-yellow-600 mt-0.5">
            Expiry: any future date | CVV: any 3 digits | OTP: 1234
          </p>
        </div>
      )}
    </div>
  );

}