"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { CouponForm } from "@/components/forms/CouponForm";
import { getCouponColumns } from "@/components/columns/coupon-columns";
import { ConfirmDialog } from "@/components/data-table/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Ticket,
  Plus,
  Percent,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

   useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons(){
    try {
         setIsLoading(true);
         const res=await axios.get("/api/admin/coupons?includeInactive=true");
         if(res.status===200)
         {
            setCoupons(res.data.data);
         }
         else{
             toast.error("Failed to load coupons");
         }
    } catch (error) {
         toast.error("Something went wrong");
    }finally {
      setIsLoading(false);
    }
  }
  async function handleCreate(formData){
    try {
         setIsSubmitting(true);
         const res=await axios.post("/api/admin/coupons",{
            code:formData.code,
            discountType:formData.discountType,
            discountValue: Number(formData.discountValue),
             minOrderAmount: formData.minOrderAmount
            ? Number(formData.minOrderAmount)
            : null,
             maxUses: formData.maxUses ? Number(formData.maxUses) : null,
          expiresAt: formData.expiresAt
            ? new Date(formData.expiresAt).toISOString()
            : null,
         });
         if(res.status===201)
         {
            toast.success("Coupon created successfully");
            setCreateOpen(false);
            fetchCoupons();
         }
         else{
            toast.error(data.message || "Failed to create coupon");
         }
    } catch (error) {
         toast.error("Something went wrong");
    }finally {
      setIsSubmitting(false);
    }
  }
   function handleEdit(coupon) {
    setSelectedCoupon(coupon);
    setEditOpen(true);
  }
  async function handleUpdate(formData){
    try {
         setIsSubmitting(true);
         console.log(selectedCoupon);
         const res=await axios.put(`/api/admin/coupons/${selectedCoupon.id}`,{
             code: formData.code,
          discountType: formData.discountType,
          discountValue: Number(formData.discountValue),
          minOrderAmount: formData.minOrderAmount
            ? Number(formData.minOrderAmount)
            : null,
          maxUses: formData.maxUses ? Number(formData.maxUses) : null,
          expiresAt: formData.expiresAt
            ? new Date(formData.expiresAt).toISOString()
            : null,
         })
         if(res.status===200)
         {
            toast.success("Coupon updated successfully");
        setEditOpen(false);
        setSelectedCoupon(null);
        fetchCoupons();
         } else {
        toast.error(data.message || "Failed to update coupon");
      }
    } catch (error) {
        console.log(error);
         toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }
  function handleDeactivate(coupon)
  {
     setSelectedCoupon(coupon);
    setConfirmAction("deactivate");
    setConfirmOpen(true);
  }
    function handleReactivate(coupon) {
    setSelectedCoupon(coupon);
    setConfirmAction("reactivate");
    setConfirmOpen(true);
  }

  async function handleConfirm(){
     try {
      setIsSubmitting(true);
      const method = confirmAction === "deactivate" ? "DELETE" : "PATCH";
      const res = await fetch(
        `/api/admin/coupons/${selectedCoupon.id}`,
        { method }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(
          confirmAction === "deactivate"
            ? "Coupon deactivated"
            : "Coupon reactivated"
        );
        setConfirmOpen(false);
        setSelectedCoupon(null);
        fetchCoupons();
      } else {
        toast.error(data.message || "Action failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
}
 const columns = getCouponColumns({
    onEdit: handleEdit,
    onDeactivate: handleDeactivate,
    onReactivate: handleReactivate,
  });

   // Stats
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const expiredCoupons = coupons.filter((c) => c.isExpired).length;
  const maxedOutCoupons = coupons.filter((c) => c.isMaxedOut).length;
  const percentageCoupons = coupons.filter(
    (c) => c.discountType === "percentage"
  ).length;
  const fixedCoupons = coupons.filter(
    (c) => c.discountType === "fixed"
  ).length;
  const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);
   return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage discount coupons
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create coupon
        </Button>
      </div>
       {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Total coupons</p>
          </div>
          <p className="text-2xl font-semibold">{coupons.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeCoupons} active
          </p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="h-4 w-4 text-purple-500" />
            <p className="text-xs text-muted-foreground">Percentage</p>
          </div>
          <p className="text-2xl font-semibold">{percentageCoupons}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            % based discounts
          </p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="h-4 w-4 text-green-500" />
            <p className="text-xs text-muted-foreground">Fixed</p>
          </div>
          <p className="text-2xl font-semibold">{fixedCoupons}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            flat amount discounts
          </p>
        </div>
        <div className="bg-background border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Ticket className="h-4 w-4 text-blue-500" />
            <p className="text-xs text-muted-foreground">Total uses</p>
          </div>
          <p className="text-2xl font-semibold">{totalUses}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            across all coupons
          </p>
        </div>
      </div>
       {/* Warnings */}
      {(expiredCoupons > 0 || maxedOutCoupons > 0) && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-700">
            {expiredCoupons > 0 && (
              <p>
                <strong>{expiredCoupons}</strong> coupon
                {expiredCoupons > 1 ? "s have" : " has"} expired.
              </p>
            )}
            {maxedOutCoupons > 0 && (
              <p>
                <strong>{maxedOutCoupons}</strong> coupon
                {maxedOutCoupons > 1 ? "s have" : " has"} reached the usage
                limit.
              </p>
            )}
            <p className="mt-1 text-orange-600">
              Consider deactivating them to keep your list clean.
            </p>
          </div>
        </div>
      )}

      <Separator />

       <DataTable
        columns={columns}
        data={coupons}
        searchKey="code"
        searchPlaceholder="Search by coupon code..."
        isLoading={isLoading}
      />
       <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create coupon</DialogTitle>
          </DialogHeader>
          <CouponForm
            onSubmit={handleCreate}
            isLoading={isSubmitting}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

       <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit coupon</DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <CouponForm
              onSubmit={handleUpdate}
              defaultValues={{
                code: selectedCoupon.code,
                discountType: selectedCoupon.discountType,
                discountValue: String(selectedCoupon.discountValue),
                minOrderAmount: selectedCoupon.minOrderAmount
                  ? String(selectedCoupon.minOrderAmount)
                  : "",
                maxUses: selectedCoupon.maxUses
                  ? String(selectedCoupon.maxUses)
                  : "",
                expiresAt: selectedCoupon.expiresAt
                  ? new Date(selectedCoupon.expiresAt)
                      .toISOString()
                      .slice(0, 16)
                  : "",
              }}
              isLoading={isSubmitting}
              onCancel={() => {
                setEditOpen(false);
                setSelectedCoupon(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

       {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          confirmAction === "deactivate"
            ? "Deactivate coupon?"
            : "Reactivate coupon?"
        }
        description={
          confirmAction === "deactivate"
            ? `Deactivating "${selectedCoupon?.code}" will prevent customers from using it at checkout.`
            : `Reactivating "${selectedCoupon?.code}" will allow customers to use it again.`
        }
        confirmLabel={
          confirmAction === "deactivate" ? "Deactivate" : "Reactivate"
        }
        onConfirm={handleConfirm}
        loading={isSubmitting}
        destructive={confirmAction === "deactivate"}
      />
    </div>
  );
}