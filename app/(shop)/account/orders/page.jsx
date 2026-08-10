"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";


const statusConfig = {
  pending: { label: "Pending", class: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", class: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", class: "bg-purple-100 text-purple-800" },
  shipped: { label: "Shipped", class: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Delivered", class: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", class: "bg-red-100 text-red-800" },
  refunded: { label: "Refunded", class: "bg-orange-100 text-orange-800" },
};

function OrderSkeleton() {
  return (
    <div className="border rounded-xl p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48" />
      <Separator />
      <div className="flex gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-12 h-12 rounded-lg" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const user = useSelector((state) => state.auth.user);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, statusFilter, page]);

  async function fetchOrders() {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set("userId", user.id);
      params.set("page", page);
      params.set("limit", "5");
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">My orders</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track and manage your orders
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All orders</SelectItem>
            {Object.entries(statusConfig).map(([val, config]) => (
              <SelectItem key={val} value={val}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
          <h3 className="font-semibold mb-2">No orders yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {statusFilter !== "all"
              ? `No ${statusFilter} orders found.`
              : "You haven't placed any orders yet."}
          </p>
          <Link href="/products">
            <Button>
              Start shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] || {
              label: order.status,
              class: "bg-gray-100 text-gray-800",
            };
            const itemImages = order.items
              ?.slice(0, 3)
              .map(
                (i) => i.productVariant?.product?.images?.[0]?.imageUrl
              )
              .filter(Boolean);

            return (
              <div
                key={order.id}
                className="border rounded-xl p-5 hover:border-primary/30 transition-colors"
              >
                {/* Order header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium font-mono">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.class}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0">
                    ₹{Number(order.totalAmount).toFixed(0)}
                  </p>
                </div>

                <Separator className="mb-3" />

                {/* Product thumbnails */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-1.5">
                    {itemImages.length > 0 ? (
                      itemImages.map((img, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-lg bg-secondary overflow-hidden border"
                        >
                          <img
                            src={img}
                            alt="Product"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                    {order.items?.length > 3 && (
                      <div className="w-10 h-10 rounded-lg bg-secondary border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground font-medium">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {order.items
                        ?.map((i) => i.productVariant?.product?.name)
                        .join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items?.length} item
                      {order.items?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {order.payment && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          order.payment.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.payment.status === "paid"
                          ? "Paid"
                          : "Payment pending"}
                      </span>
                    )}
                    {order.coupon && (
                      <span className="text-xs text-green-600">
                        Coupon: {order.coupon.code}
                      </span>
                    )}
                  </div>
                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      View details
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );a
}