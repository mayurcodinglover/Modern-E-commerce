"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/data-table/status-badge";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export function UpdateStatusDialog({
  open,
  onOpenChange,
  order,
  onUpdate,
  isLoading,
}) {
  const [selectedStatus, setSelectedStatus] = useState("");


   function handleOpen(isOpen) {
    if (isOpen) setSelectedStatus(order?.status || "");
    onOpenChange(isOpen);
  }
  function handleUpdate() {
    if (!selectedStatus || selectedStatus === order?.status) return;
    onUpdate(selectedStatus);
  }
  if (!order) return null;
   return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Update order status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-secondary rounded-lg p-3">
            <span className="text-sm text-muted-foreground">
              Order #{order.id.slice(-8).toUpperCase()}
            </span>
            <StatusBadge value={order.status} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">New status</p>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.value === order.status}
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge value={option.value} />
                      {option.value === order.status && (
                        <span className="text-xs text-muted-foreground">
                          (current)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           {/* Status flow hint */}
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-medium mb-1">
              Status flow
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              {["pending", "confirmed", "processing", "shipped", "delivered"].map(
                (s, i, arr) => (
                  <div key={s} className="flex items-center gap-1">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        s === order.status
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border"
                      }`}
                    >
                      {s}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-muted-foreground text-xs">→</span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={
              isLoading ||
              !selectedStatus ||
              selectedStatus === order.status
            }
          >
            {isLoading ? "Updating..." : "Update status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
   );
}