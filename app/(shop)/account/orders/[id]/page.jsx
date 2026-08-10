"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  MapPin,
  CreditCard,
  Tag,
  ArrowLeft,
  Star,
  CheckCircle,
  Truck,
  Clock,
} from "lucide-react";

const statusSteps = [
  { key: "pending", label: "Order placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const statusOrder = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function OrderTracker({ status }) {
  const currentIndex = statusOrder.indexOf(status);
  const isCancelled = status === "cancelled" || status === "refunded";

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-medium text-sm">
          Order {status}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {statusSteps.map((step, index) => {
          const Icon = step.icon;
          const isDone = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center flex-1"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p
                className={`text-xs mt-1.5 text-center ${
                  isDone ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
              {index < statusSteps.length - 1 && (
                <div
                  className={`absolute h-0.5 top-4 left-0 right-0 -z-0 ${
                    index < currentIndex ? "bg-primary" : "bg-border"
                  }`}
                  style={{
                    left: `${(index + 0.5) * (100 / statusSteps.length)}%`,
                    right: `${
                      (statusSteps.length - index - 1.5) *
                      (100 / statusSteps.length)
                    }%`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrder();
  }, [id, user]);

  async function fetchOrder() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error("Order not found");
        router.push("/account/orders");
      }
    } catch {
      toast.error("Failed to load order");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) return null;

  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountAmount);
  const shipping = Number(order.shippingAmount);
  const tax = Number(order.taxAmount);
  const total = Number(order.totalAmount);

  return (
    <div className="space-y-5">

      {/* Back + Header */}
      <div>
        <Link href="/account/orders">
          <Button variant="ghost" size="sm" className="mb-3 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to orders
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">
              Order #{order.id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${
              order.status === "delivered"
                ? "bg-green-100 text-green-800"
                : order.status === "cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Order tracker */}
      <div className="bg-background border rounded-xl p-5">
        <h3 className="text-sm font-medium mb-5">Order status</h3>
        <OrderTracker status={order.status} />
      </div>

      {/* Order items */}
      <div className="bg-background border rounded-xl p-5">
        <h3 className="text-sm font-medium mb-4">
          Items ({order.items?.length})
        </h3>
        <div className="space-y-4">
          {order.items?.map((item) => {
            const product = item.productVariant?.product;
            const variant = item.productVariant;
            const primaryImage = product?.images?.[0];

            return (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0 border">
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
                  <Link
                    href={`/products/${product?.id}`}
                    className="text-sm font-medium hover:text-primary truncate block"
                  >
                    {product?.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    {variant?.size && (
                      <span className="text-xs text-muted-foreground">
                        {variant.size.name}
                      </span>
                    )}
                    {variant?.color && (
                      <span className="text-xs text-muted-foreground">
                        {variant.color.name}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      × {item.quantity}
                    </span>
                  </div>

                  {/* Review button for delivered orders */}
                  {order.status === "delivered" && (
                    <Link
                      href={`/products/${product?.id}?review=true`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2 mt-1 text-primary"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Write a review
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold">
                    ₹{Number(item.totalPrice).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ₹{Number(item.unitPrice).toFixed(0)} each
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        {/* Delivery address */}
        <div className="bg-background border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">Delivery address</h3>
          </div>
          <p className="text-sm font-medium">
            {order.address?.addressLine1}
          </p>
          {order.address?.addressLine2 && (
            <p className="text-sm text-muted-foreground">
              {order.address.addressLine2}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {order.address?.city}, {order.address?.state}{" "}
            {order.address?.postalCode}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.address?.country}
          </p>
        </div>

        {/* Payment */}
        <div className="bg-background border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">Payment</h3>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="capitalize">
                {order.payment?.method || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span
                className={
                  order.payment?.status === "paid"
                    ? "text-green-600 font-medium"
                    : "text-yellow-600"
                }
              >
                {order.payment?.status || "Pending"}
              </span>
            </div>
            {order.payment?.paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid on</span>
                <span>
                  {new Date(order.payment.paidAt).toLocaleDateString(
                    "en-IN"
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="bg-background border rounded-xl p-5">
        <h3 className="text-sm font-medium mb-4">Price breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Discount {order.coupon && `(${order.coupon.code})`}
              </span>
              <span>-₹{discount.toFixed(0)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                `₹${shipping.toFixed(0)}`
              )}
            </span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>₹{tax.toFixed(0)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-secondary/30 border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase mb-1">
            Order notes
          </p>
          <p className="text-sm">{order.notes}</p>
        </div>
      )}
    </div>
  );
}