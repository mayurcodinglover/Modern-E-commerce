"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { clearCart, setCart } from "../../store/slices/cartSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newAddressSchema } from "@/lib/validations/auth.schema";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  Package,
  Tag,
  CheckCircle,
  CreditCard,
  Truck,
} from "lucide-react";

const STEPS = { ADDRESS: 1, REVIEW: 2, PAYMENT: 3 };

function StepIndicator({ currentStep }) {
  const steps = [
    { num: 1, label: "Address" },
    { num: 2, label: "Review" },
    { num: 3, label: "Payment" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                currentStep > step.num
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === step.num
                  ? "border-primary text-primary"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {currentStep > step.num ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                step.num
              )}
            </div>
            <p
              className={`text-xs mt-1 ${
                currentStep >= step.num
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-20 h-0.5 mx-2 mb-4 ${
                currentStep > step.num ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const cartState = useSelector((state) => state.cart);

  const couponFromUrl = searchParams.get("coupon") || "";

  const [step, setStep] = useState(STEPS.ADDRESS);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [notes, setNotes] = useState("");

  // ✅ Local cart state — fetched fresh from API
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    itemCount: 0,
    cartTotal: 0,
  });
  const [cartLoading, setCartLoading] = useState(true);

  const addressForm = useForm({
    resolver: zodResolver(newAddressSchema),
    defaultValues: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    // ✅ Always fetch fresh cart directly from API
    fetchCart();
    fetchAddresses();
    if (couponFromUrl) validateCoupon(couponFromUrl);
  }, [user]);

  // ✅ Re-validate coupon when cart total is known
  useEffect(() => {
    if (couponFromUrl && cartSummary.cartTotal > 0) {
      validateCoupon(couponFromUrl);
    }
  }, [cartSummary.cartTotal]);

  // ✅ Fetch cart fresh from API — don't rely on Redux alone
  async function fetchCart() {
    try {
      setCartLoading(true);
      const res = await fetch(`/api/cart?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setCartItems(data.data);
        setCartSummary(data.summary);
        // Also update Redux
        dispatch(setCart(data));

        // If cart is empty redirect back
        if (data.data.length === 0) {
          toast.error("Your cart is empty");
          router.push("/cart");
        }
      }
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setCartLoading(false);
    }
  }

  async function fetchAddresses() {
    try {
      const res = await fetch(`/api/addresses?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
        const defaultAddr = data.data.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      }
    } catch {
      toast.error("Failed to load addresses");
    }
  }

  async function validateCoupon(code) {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          orderAmount: cartSummary.cartTotal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponData(data.data);
      } else {
        setCouponData(null);
      }
    } catch {
      console.error("Coupon validation failed");
    }
  }

  async function handleAddAddress(formData) {
    try {
      setIsLoading(true);
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Address added successfully");
        setAddAddressOpen(false);
        addressForm.reset();
        fetchAddresses();
        // ✅ Fixed — use data.data.id not data.address.id
        setSelectedAddressId(data.data.id);
      } else {
        toast.error(data.message || "Failed to add address");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const shippingAmount = cartSummary.cartTotal > 499 ? 0 : 49;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          addressId: selectedAddressId,
          couponCode: couponData?.code || null,
          notes: notes || null,
          shippingAmount,
          taxAmount: 0,
        }),
      });

      const data = await res.json();
      console.log("Order response:", data);

      if (data.success) {
        // ✅ Fixed — use data.order not data.data
        setPlacedOrder(data.order || data.data);
        dispatch(clearCart());
        setCartItems([]);
        setStep(STEPS.PAYMENT);
        toast.success("Order placed successfully!");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Place order error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  // Price calculations using fresh cart data
  const subtotal = cartSummary.cartTotal || 0;
  const discountAmount = couponData?.discountAmount || 0;
  const shippingAmount = subtotal > 499 ? 0 : 49;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

  // Order success screen
  if (placedOrder && step === STEPS.PAYMENT) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-background border rounded-2xl p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Order placed!</h1>
          <p className="text-muted-foreground text-sm mb-4">
            Your order has been placed successfully. We'll send you updates via email.
          </p>
          <div className="bg-secondary rounded-lg p-4 mb-6 text-left space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono font-medium">
                #{placedOrder.id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total amount</span>
              <span className="font-semibold">
                ₹{Number(placedOrder.totalAmount).toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                Pending payment
              </Badge>
            </div>
          </div>
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => router.push("/account/orders")}
            >
              View my orders
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Continue shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-2">Checkout</h1>
      <StepIndicator currentStep={step} />

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Left steps */}
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 1 — Address */}
          {step === STEPS.ADDRESS && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery address
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddAddressOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add new
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="border rounded-xl p-8 text-center">
                  <MapPin className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm mb-4">
                    No addresses saved yet.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setAddAddressOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add delivery address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-all ${
                            selectedAddressId === addr.id
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/50"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {addr.addressLine1}
                            </p>
                            {addr.isDefault && (
                              <Badge
                                variant="outline"
                                className="text-xs text-primary border-primary"
                              >
                                Default
                              </Badge>
                            )}
                          </div>
                          {addr.addressLine2 && (
                            <p className="text-sm text-muted-foreground">
                              {addr.addressLine2}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {addr.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-2">
                  Order notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={3}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!selectedAddressId || cartLoading}
                onClick={() => setStep(STEPS.REVIEW)}
              >
                {cartLoading ? "Loading..." : "Continue to review"}
              </Button>
            </div>
          )}

          {/* STEP 2 — Review */}
          {step === STEPS.REVIEW && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Review your order
              </h2>

              {/* Selected address */}
              <div className="border rounded-xl p-4 bg-secondary/30">
                <p className="text-xs text-muted-foreground font-medium uppercase mb-2">
                  Delivering to
                </p>
                {(() => {
                  const addr = addresses.find(
                    (a) => a.id === selectedAddressId
                  );
                  return addr ? (
                    <div className="text-sm">
                      <p className="font-medium">{addr.addressLine1}</p>
                      {addr.addressLine2 && (
                        <p className="text-muted-foreground">
                          {addr.addressLine2}
                        </p>
                      )}
                      <p className="text-muted-foreground">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-muted-foreground">{addr.country}</p>
                    </div>
                  ) : null;
                })()}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-primary mt-1"
                  onClick={() => setStep(STEPS.ADDRESS)}
                >
                  Change address
                </Button>
              </div>

              {/* Cart items — using local state fetched from API */}
              <div className="space-y-3">
                {cartLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-3 p-3 border rounded-lg">
                      <Skeleton className="w-14 h-14 rounded-md flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : cartItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items in cart
                  </p>
                ) : (
                  cartItems.map((item) => {
                    const product = item.productVariant?.product;
                    const variant = item.productVariant;
                    const primaryImage = product?.images?.[0];

                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 border rounded-lg"
                      >
                        <div className="w-14 h-14 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                          {primaryImage ? (
                            <img
                              src={primaryImage.imageUrl}
                              alt={product?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {product?.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {variant?.size && (
                              <span className="text-xs text-muted-foreground">
                                {variant.size.name}
                              </span>
                            )}
                            {variant?.size && variant?.color && (
                              <span className="text-muted-foreground text-xs">·</span>
                            )}
                            {variant?.color && (
                              <span className="text-xs text-muted-foreground">
                                {variant.color.name}
                              </span>
                            )}
                            <span className="text-muted-foreground text-xs">·</span>
                            <span className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm font-medium flex-shrink-0">
                          ₹{Number(item.totalPrice).toFixed(0)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(STEPS.ADDRESS)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || cartItems.length === 0}
                >
                  {isPlacingOrder ? "Placing order..." : "Place order"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Order summary */}
        <div>
          <div className="border rounded-xl p-5 space-y-4 sticky top-20">
            <h2 className="font-semibold">Order summary</h2>

            {cartLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Items ({cartSummary.itemCount})
                  </span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>

                {couponData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {couponData.code}
                    </span>
                    <span className="text-green-600">
                      -₹{discountAmount.toFixed(0)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Shipping
                  </span>
                  <span>
                    {shippingAmount === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shippingAmount}`
                    )}
                  </span>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(0)}</span>
                </div>
              </>
            )}

            <div className="pt-2">
              <p className="text-xs text-muted-foreground text-center mb-2">
                Accepted payment methods
              </p>
              <div className="flex items-center justify-center gap-2">
                {["UPI", "Card", "COD", "EMI"].map((method) => (
                  <span
                    key={method}
                    className="text-xs border rounded px-2 py-0.5 text-muted-foreground"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              <span>100% secure payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={addAddressOpen} onOpenChange={setAddAddressOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add new address</DialogTitle>
          </DialogHeader>
          <Form {...addressForm}>
            <form
              onSubmit={addressForm.handleSubmit(handleAddAddress)}
              className="space-y-4"
            >
              <FormField
                control={addressForm.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 1 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="House/Flat no, Street name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 2</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Landmark, Area (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={addressForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ahmedabad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input placeholder="Gujarat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={addressForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="380001"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save address"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddAddressOpen(false);
                    addressForm.reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}