"use client";

import { ColumnHeader } from "@/components/data-table/column-header";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-action";
import { Eye, RefreshCw } from "lucide-react";

export function getOrderColumns({ onView, onUpdateStatus }) {
  return [
         {
      accessorKey: "id",
      header: ({ column }) => <ColumnHeader column={column} title="Order ID" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          #{row.original.id.slice(-8).toUpperCase()}
        </span>
      ),
    },
     {
      accessorKey: "user",
      header: ({ column }) => <ColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">
            {row.original.user?.firstName} {row.original.user?.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.user?.email}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "items",
      header: ({ column }) => <ColumnHeader column={column} title="Items" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm">
            {row.original.items?.length || 0} item
            {row.original.items?.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
            {row.original.items
              ?.slice(0, 2)
              .map((i) => i.productVariant?.product?.name)
              .join(", ")}
            {row.original.items?.length > 2 &&
              ` +${row.original.items.length - 2} more`}
          </p>
        </div>
      ),
    },
     {
      accessorKey: "totalAmount",
      header: ({ column }) => <ColumnHeader column={column} title="Total" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">
            ₹{Number(row.original.totalAmount).toFixed(0)}
          </p>
          {row.original.discountAmount > 0 && (
            <p className="text-xs text-green-600">
              -₹{Number(row.original.discountAmount).toFixed(0)} discount
            </p>
          )}
        </div>
      ),
    },
     {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge value={row.original.status} />,
    },
     {
      accessorKey: "payment",
      header: ({ column }) => (
        <ColumnHeader column={column} title="Payment" />
      ),
      cell: ({ row }) => (
        <StatusBadge
          value={row.original.payment?.status || "pending"}
        />
      ),
    },
     {
      accessorKey: "createdAt",
      header: ({ column }) => <ColumnHeader column={column} title="Date" />,
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      ),
    },
      {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          row={row}
          actions={[
            {
              label: "View details",
              icon: <Eye className="h-4 w-4" />,
              onClick: onView,
            },
            {
              label: "Update status",
              icon: <RefreshCw className="h-4 w-4" />,
              onClick: onUpdateStatus,
            },
          ]}
        />
      ),
    },
  ]
}