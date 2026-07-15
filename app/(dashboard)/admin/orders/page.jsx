"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { getOrderColumns } from "@/components/columns/order-columns";
import { OrderDetailDialog } from "@/components/order-detail-dialog";
import { UpdateStatusDialog } from "@/components/update-status-dialog";
import { Separator } from "@/components/ui/separator";
import axios from "axios";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ClipboardList,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react"

const statusFilters = [
  { label: "All orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);


   useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  async function fetchOrders(){
    try {
        setIsLoading(true);
        const status=
        statusFilter!=="all" ? `&status=${statusFilter}`:"";
        const res=await axios.get(`/api/admin/orders?limit=100${status}`);
        
        if(res.status===200)
        {
            setOrders(res.data.data);
        }
        else{
             toast.error("Failed to load orders");
        }
    }catch(error) {
      toast.error("Something went wrong",error);
    } finally {
      setIsLoading(false);
    }
  }
   function handleView(order) {
    setSelectedOrder(order);
    setDetailOpen(true);
  }
   function handleUpdateStatus(order) {
    setSelectedOrder(order);
    setStatusOpen(true);
  }
  async function handleStatusUpdate(newStatus)
  {
    try {
         setIsSubmitting(true);
         const res=await axios.patch(`/api/admin/orders/${selectedOrder.id}/status`,{
            status:newStatus
         });
         if(res.status===200)
         {
             toast.success(`Order status updated to "${newStatus}"`);
        setStatusOpen(false);
        setSelectedOrder(null);
        fetchOrders();
         }
         else{
             toast.error(res.data.message || "Failed to update status");
         }
    } catch (error) {
         if (axios.isAxiosError(error)) {
    if (error.response?.status === 400) {
      toast.error(error.response.data.message);
    } else if (error.response?.status === 404) {
      toast.error(error.response.data.message);
    } else if (error.response?.status === 500) {
      toast.error("Internal server error");
    } else {
      toast.error("Something went wrong");
    }
  } else {
    toast.error("Something went wrong");
  }
    }finally {
      setIsSubmitting(false);
    }
  }
   const columns = getOrderColumns({
    onView: handleView,
    onUpdateStatus: handleUpdateStatus,
  });
    const pending = orders.filter((o) => o.status === "pending").length;
  const shipped = orders.filter((o) => o.status === "shipped").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

     return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and track all customer orders
        </p>
      </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <p className="text-2xl font-semibold">{orders.length}</p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-yellow-500" />
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <p className="text-2xl font-semibold text-yellow-600">{pending}</p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="h-4 w-4 text-blue-500" />
            <p className="text-xs text-muted-foreground">Shipped</p>
          </div>
          <p className="text-2xl font-semibold text-blue-600">{shipped}</p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
          <p className="text-2xl font-semibold text-green-600">{delivered}</p>
        </div>
        <div className="bg-background border rounded-lg p-4 lg:col-span-1 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </div>
          <p className="text-2xl font-semibold text-red-600">{cancelled}</p>
        </div>
      </div>

        {/* Revenue banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Total revenue (excluding cancelled & refunded)
          </p>
          <p className="text-2xl font-semibold mt-0.5">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <Separator />

       {/* Status filter */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">Filter by status:</p>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

        <DataTable
        columns={columns}
        data={orders}
        searchKey="id"
        searchPlaceholder="Search by order ID..."
        isLoading={isLoading}
      />

       {/* Order Detail Dialog */}
      <OrderDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        order={selectedOrder}
      />

       <UpdateStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        order={selectedOrder}
        onUpdate={handleStatusUpdate}
        isLoading={isSubmitting}
      />
    </div>
  );
}