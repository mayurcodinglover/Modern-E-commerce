"use client"
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCart, removeItemLocally, clearCart } from "../../store/slices/cartSlice.js";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  ArrowRight,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";

function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 border rounded-xl">
      <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

function CartItem({ item, onQuantityChange, onRemove, isUpdating }) {
   const product = item.productVariant?.product;
    const variant = item.productVariant;
  const primaryImage = product?.images?.[0];

  return (
    <div
      className={`flex gap-4 p-4 border rounded-xl transition-opacity ${
        isUpdating ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Product image */}
      <div className="w-24 h-24 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
        {primaryImage ? (
          <img
            src={primaryImage.imageUrl}
            alt={primaryImage.altText || product?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
      </div>
       {/* Product info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${product?.id}`}
              className="text-sm font-medium hover:text-primary truncate block"
            >
              {product?.name}
            </Link>

            {/* Variant badges */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {variant?.size && (
                <Badge variant="outline" className="text-xs py-0">
                  {variant.size.name}
                </Badge>
              )}
              {variant?.color && (
                <Badge
                  variant="outline"
                  className="text-xs py-0 flex items-center gap-1"
                >
                  {variant.color.hexCode && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: variant.color.hexCode }}
                    />
                  )}
                  {variant.color.name}
                </Badge>
              )}
            </div>

            {/* Stock warning */}
            {item.hasStockIssue && (
              <p className="text-xs text-red-500 mt-1">
                Only {variant?.stockQuantity} left in stock
              </p>
            )}

            {/* Unavailable warning */}
            {!item.isAvailable && (
              <p className="text-xs text-red-500 mt-1">
                This product is no longer available
              </p>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(item.id)}
            className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Price + Quantity */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity controls */}
          <div className="flex items-center border rounded-md">
            <button
              className="px-2.5 py-1.5 hover:bg-secondary transition-colors"
              onClick={() =>
                onQuantityChange(item.id, Math.max(1, item.quantity - 1))
              }
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-3 py-1.5 text-sm font-medium min-w-[2.5rem] text-center">
              {item.quantity}
            </span>
            <button
              className="px-2.5 py-1.5 hover:bg-secondary transition-colors"
              onClick={() =>
                onQuantityChange(
                  item.id,
                  Math.min(variant?.stockQuantity || 99, item.quantity + 1)
                )
              }
              disabled={item.quantity >= (variant?.stockQuantity || 99)}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-semibold">
              ₹{Number(item.totalPrice).toFixed(0)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                ₹{Number(item.unitPrice).toFixed(0)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  console.log(user);
  
  const cartState = useSelector((state) => state.cart);

   const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

   useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setIsLoading(false);
    }
  }, [user]);

   async function fetchCart() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/cart?userId=${user.id}`);
      const data = await res.json();
      console.log(data);
      
      if (data.success) {
        dispatch(setCart(data));
      }
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  }

    async function handleQuantityChange(cartItemId, newQuantity) {
    try {
      setUpdatingItems((prev) => new Set(prev).add(cartItemId));
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCart();
      } else {
        toast.error(data.message || "Failed to update quantity");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  }
   async function handleRemove(cartItemId) {
    try {
      setUpdatingItems((prev) => new Set(prev).add(cartItemId));
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        dispatch(removeItemLocally(cartItemId));
        fetchCart();
        toast.success("Item removed from cart");
      } else {
        toast.error(data.message || "Failed to remove item");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  }
    async function handleClearCart() {
    try {
      const res = await fetch(`/api/cart?userId=${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        dispatch(clearCart());
        setAppliedCoupon(null);
        toast.success("Cart cleared");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

    async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          orderAmount: cartState.cartTotal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.data);
        toast.success(`Coupon applied! You save ₹${data.data.discountAmount}`);
      } else {
        toast.error(data.message || "Invalid coupon");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  }
    if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please login first</h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view your cart.
        </p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

   const items = cartState.items || [];
   const subtotal = cartState.cartTotal || 0;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const shippingAmount = subtotal > 499 ? 0 : 49;
  const finalTotal = subtotal - discountAmount + shippingAmount;

   return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Shopping cart</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading..."
              : `${cartState.itemCount || 0} item${
                  cartState.itemCount !== 1 ? "s" : ""
                } in your cart`}
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500"
            onClick={handleClearCart}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear cart
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      ) : items.length === 0 ? (
        /* Empty cart */
        <div className="text-center py-16">
          <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground/20 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything yet.
          </p>
          <Link href="/products">
            <Button>
              Browse products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
                isUpdating={updatingItems.has(item.id)}
              />
            ))}

            {/* Continue shopping */}
            <Link href="/products">
              <Button variant="ghost" className="mt-2">
                ← Continue shopping
              </Button>
            </Link>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="border rounded-xl p-5 space-y-4 sticky top-20">
              <h2 className="font-semibold text-lg">Order summary</h2>

              {/* Coupon input */}
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Have a coupon?</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      className="font-mono uppercase text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-green-600">
                        -₹{appliedCoupon.discountAmount} off
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-green-600 hover:text-green-800 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}

              <Separator />

              {/* Price breakdown */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({cartState.itemCount} items)
                  </span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon discount</span>
                    <span>-₹{discountAmount.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingAmount === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shippingAmount}`
                    )}
                  </span>
                </div>

                {shippingAmount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{(499 - subtotal).toFixed(0)} more for free shipping
                  </p>
                )}

                <Separator />

                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(0)}</span>
                </div>

                {discountAmount > 0 && (
                  <p className="text-xs text-green-600 font-medium text-center">
                    You save ₹{discountAmount.toFixed(0)} on this order!
                  </p>
                )}
              </div>

              {/* Checkout button */}
              <Link
                href={`/checkout${
                  appliedCoupon
                    ? `?coupon=${appliedCoupon.code}`
                    : ""
                }`}
              >
                <Button className="w-full" size="lg">
                  Proceed to checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <p className="text-xs text-muted-foreground text-center">
                  Secure checkout — SSL encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}