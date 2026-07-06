"use client";

import { ColumnHeader } from "@/components/data-table/column-header";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-action";
import { Pencil, Trash2, RotateCcw } from "lucide-react";

export function getCategoryColumns({onEdit,onDeactivate,onReactivate}){
    return [
        {
             accessorKey: "name",
             header: ({ column }) => <ColumnHeader column={column} title="Name" />,
              cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      ),
        },
        {
      accessorKey: "description",
      header: ({ column }) => (
        <ColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground max-w-[200px] truncate">
          {row.original.description || "—"}
        </p>
      ),
    },
     {
      accessorKey: "isActive",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge value={row.original.isActive} />,
    },
     {
      accessorKey: "createdAt",
      header: ({ column }) => <ColumnHeader column={column} title="Created" />,
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
        id:"actions",
        cell:({row})=>(
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
        )
    }
    ]
}