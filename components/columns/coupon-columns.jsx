"use client";

import { ColumnHeader } from "@/components/data-table/column-header";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-action";
import { Pencil, Trash2, RotateCcw, Percent, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function getCouponColumns({ onEdit, onDeactivate, onReactivate }) {
  return [
    {
         accessorKey: "code",
      header: ({ column }) => <ColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-sm bg-secondary px-2 py-0.5 rounded">
            {row.original.code}
          </span>
          {row.original.isExpired && (
            <Badge
              variant="outline"
              className="text-xs text-red-500 border-red-300"
            >
              Expired
            </Badge>
          )}
          {row.original.isMaxedOut && (
            <Badge
              variant="outline"
              className="text-xs text-orange-500 border-orange-300"
            >
              Maxed out
            </Badge>
          )}
        </div>
      ),
    },
     {
      accessorKey: "discountType",
      header: ({ column }) => (
        <ColumnHeader column={column} title="Discount" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center">
            {row.original.discountType === "percentage" ? (
              <Percent className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {row.original.discountType === "percentage"
                ? `${Number(row.original.discountValue).toFixed(0)}% off`
                : `₹${Number(row.original.discountValue).toFixed(0)} off`}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {row.original.discountType}
            </p>
          </div>
        </div>
      ),
    },
     {
      accessorKey: "minOrderAmount",
      header: ({ column }) => (
        <ColumnHeader column={column} title="Min order" />
      ),
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground">
          {row.original.minOrderAmount
            ? `₹${Number(row.original.minOrderAmount).toFixed(0)}`
            : "No minimum"}
        </p>
      ),
    },
     {
      accessorKey: "usedCount",
      header: ({ column }) => <ColumnHeader column={column} title="Usage" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">
            {row.original.usedCount} used
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.maxUses
              ? `of ${row.original.maxUses} max`
              : "unlimited"}
          </p>
          {/* Usage progress bar */}
          {row.original.maxUses && (
            <div className="w-20 h-1 bg-secondary rounded-full mt-1">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${Math.min(
                    (row.original.usedCount / row.original.maxUses) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          )}
        </div>
      ),
    },
     {
      accessorKey: "expiresAt",
      header: ({ column }) => (
        <ColumnHeader column={column} title="Expires" />
      ),
      cell: ({ row }) => {
        if (!row.original.expiresAt) {
          return (
            <p className="text-sm text-muted-foreground">Never</p>
          );
        }
        const expiry = new Date(row.original.expiresAt);
        const now = new Date();
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return (
          <div>
            <p className="text-sm">
              {expiry.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            {daysLeft > 0 ? (
              <p
                className={`text-xs ${
                  daysLeft <= 7
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {daysLeft} days left
              </p>
            ) : (
              <p className="text-xs text-red-500">Expired</p>
            )}
          </div>
        );
      },
    },
     {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          row={row}
          actions={[
            {
              label: "Edit",
              icon: <Pencil className="h-4 w-4" />,
              onClick: onEdit,
            },
            row.original.isActive
              ? {
                  label: "Deactivate",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: onDeactivate,
                  destructive: true,
                }
              : {
                  label: "Reactivate",
                  icon: <RotateCcw className="h-4 w-4" />,
                  onClick: onReactivate,
                },
          ]}
        />
      ),
    },
]
}