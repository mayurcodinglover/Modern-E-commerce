"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/data-table/status-badge";
import { Badge } from "@/components/ui/badge";
import { MapPin, CreditCard, Package, Tag } from "lucide-react";

export function OrderDetailDialog({ open, onOpenChange, order }) {
  if (!order) return null;
  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountAmount);
  const shipping = Number(order.shippingAmount);
  const tax = Number(order.taxAmount);
  const total = Number(order.totalAmount);

   return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Order #{order.id.slice(-8).toUpperCase()}
            <StatusBadge value={order.status} />
          </DialogTitle>
        </DialogHeader>

         <div className="space-y-5">

          {/* Customer info */}
          <div className="bg-secondary rounded-lg p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              Customer
            </p>
            <p className="text-sm font-medium">
              {order.user?.firstName} {order.user?.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.user?.email}
            </p>
          </div>

          {/* Delivery address */}
          <div className="bg-secondary rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Delivery address
              </p>
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

            {/* Order items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                Order items ({order.items?.length})
              </p>
            </div>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                      {item.productVariant?.product?.images?.[0]?.imageUrl ? (
                        <img
                          src={item.productVariant.product.images[0].imageUrl}
                          alt={item.productVariant.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {item.productVariant?.product?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.productVariant?.size && (
                          <Badge variant="outline" className="text-xs py-0">
                            {item.productVariant.size.name}
                          </Badge>
                        )}
                        {item.productVariant?.color && (
                          <Badge
                            variant="outline"
                            className="text-xs py-0 flex items-center gap-1"
                          >
                            {item.productVariant.color.hexCode && (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    item.productVariant.color.hexCode,
                                }}
                              />
                            )}
                            {item.productVariant.color.name}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          x{item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ₹{Number(item.totalPrice).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{Number(item.unitPrice).toFixed(0)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Discount {order.coupon && `(${order.coupon.code})`}
                </span>
                <span className="text-green-600">-₹{discount.toFixed(0)}</span>
              </div>
            )}
            {shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹{shipping.toFixed(0)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{tax.toFixed(0)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
          </div>


          {/* Payment info */}
          {order.payment && (
            <div className="bg-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Payment
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Method</p>
                  <p className="font-medium capitalize">
                    {order.payment.method || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge value={order.payment.status} />
                </div>
                {order.payment.transactionId && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-xs">
                      {order.payment.transactionId}
                    </p>
                  </div>
                )}
                {order.payment.paidAt && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Paid at</p>
                    <p>
                      {new Date(order.payment.paidAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
           {/* Notes */}
          {order.notes && (
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Customer notes
              </p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
   );
}