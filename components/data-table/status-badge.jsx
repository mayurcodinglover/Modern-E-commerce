import { Badge } from "@/components/ui/badge";

const statusConfig = {
  true: { label: "Active", variant: "default", className: "bg-green-100 text-green-800" },
  false: { label: "Inactive", variant: "secondary", className: "bg-gray-100 text-gray-600" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", className: "bg-purple-100 text-purple-800" },
  shipped: { label: "Shipped", className: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
  refunded: { label: "Refunded", className: "bg-orange-100 text-orange-800" },
  paid: { label: "Paid", className: "bg-green-100 text-green-800" },
};

export function StatusBadge({ value }) {
  const config = statusConfig[String(value)] || {
    label: String(value),
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}