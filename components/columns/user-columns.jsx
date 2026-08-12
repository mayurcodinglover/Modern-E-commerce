"use client";
import { ColumnHeader } from "@/components/data-table/column-header";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-action";
import { Pencil, Trash2 } from "lucide-react";

export function getUserColumns({ onEdit, onDelete }) {
  return [
    { accessorKey: "firstName", header: ({ column }) => <ColumnHeader column={column} title="User" />, cell: ({ row }) => <div><p className="font-medium">{row.original.firstName} {row.original.lastName}</p><p className="text-xs text-muted-foreground">{row.original.email}</p></div> },
    { accessorKey: "role.name", header: "Role", cell: ({ row }) => <span className="capitalize text-sm">{row.original.role?.name || "—"}</span> },
    { accessorKey: "emailVerified", header: "Verified", cell: ({ row }) => <StatusBadge value={row.original.emailVerified} /> },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => <StatusBadge value={row.original.isActive} /> },
    { accessorKey: "createdAt", header: ({ column }) => <ColumnHeader column={column} title="Joined" />, cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString("en-IN")}</span> },
    { id: "actions", cell: ({ row }) => <RowActions row={row} actions={[{ label: "Edit", icon: <Pencil className="h-4 w-4" />, onClick: onEdit }, ...(row.original.isActive ? [{ label: "Deactivate", icon: <Trash2 className="h-4 w-4" />, onClick: onDelete, destructive: true }] : [])]} /> },
  ];
}
