import { ColumnHeader } from "@/components/data-table/column-header";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-action";
import { Pencil, Trash2, RotateCcw, Package } from "lucide-react";

export function getProductColumns({onEdit,onManage,onDeactivate,onReactivate})
{
    return [
        {
            accessorKey: "name",
            header: ({ column }) => <ColumnHeader column={column} title="Product" />,
            cell: ({ row }) => {
        const primaryImage = row.original.images?.find((img) => img.isPrimary);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
              {primaryImage ? (
                <img
                  src={primaryImage.imageUrl}
                  alt={primaryImage.altText || row.original.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <Package className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">
                {row.original.title || "—"}
              </p>
            </div>
          </div>
        );
      },
        },
         {
      accessorKey: "category",
      header: ({ column }) => <ColumnHeader column={column} title="Category" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.category?.name || "—"}</p>
          {row.original.subcategory && (
            <p className="text-xs text-muted-foreground">
              {row.original.subcategory.name}
            </p>
          )}
        </div>
      ),
    },
     {
      accessorKey: "basePrice",
      header: ({ column }) => <ColumnHeader column={column} title="Price" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">
            ₹{Number(row.original.basePrice).toFixed(0)}
          </p>
          {row.original.discountPrice && (
            <p className="text-xs text-green-600">
              Sale: ₹{Number(row.original.discountPrice).toFixed(0)}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "_count",
      header: ({ column }) => <ColumnHeader column={column} title="Variants" />,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          <p>{row.original._count?.variants || 0} variants</p>
          <p>{row.original._count?.images || 0} images</p>
        </div>
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
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          row={row}
          actions={[
            {
              label: "Edit details",
              icon: <Pencil className="h-4 w-4" />,
              onClick: onEdit,
            },
            {
              label: "Manage variants & images",
              icon: <Package className="h-4 w-4" />,
              onClick: onManage,
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