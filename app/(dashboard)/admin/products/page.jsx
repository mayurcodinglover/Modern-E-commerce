"use client";
import React from 'react'
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { ProductForm } from "@/components/forms/ProductForm";
import { getProductColumns } from "@/components/columns/product-columns";
import { ConfirmDialog } from "@/components/data-table/confirm-dialog";
import { ManageProductDialog } from "@/components/manage-product-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import axios from "axios";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

   const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts(){
    try {
      const {data}=await axios.get("/api/admin/products?includeInactive=true");
      if(data.products)
      {
        setProducts(data.products);
      }
       else {
        console.log(data);
        
        toast.error("Failed to load products");
      }
    } catch (error) {
      
       toast.error("Something went wrong");
    }finally{
       setIsLoading(false);
    }
  }

  async function handleCreate(formData){
    try {
      setIsSubmitting(true);
      const {data}=await axios.post("/api/admin/products",{
        ...formData,
        basePrice: Number(formData.basePrice),
          discountPrice: formData.discountPrice
           ? Number(formData.discountPrice)
            : null,
            subcategoryId: formData.subcategoryId || null
      });
      if(data.success)
      {
        toast.success("Product created successfully");
        setCreateOpen(false);
        fetchProducts();
      }else {
        toast.error(data.message || "Failed to create product");
      }
    } catch (error) {
       toast.error("Something went wrong");
    }finally {
      setIsSubmitting(false);
    }
  }
  function handleEdit(product) {
    setSelectedProduct(product);
    setEditOpen(true);
  }
  function handleManage(product) {
    setSelectedProduct(product);
    setManageOpen(true);
  }

  async function handleUpdate(fromData)
  {
    try {
       setIsSubmitting(true);
       const {data}=await axios.put(`/api/admin/products/${selectedProduct.id}`,{
        ...formData,
         basePrice: Number(formData.basePrice),
            discountPrice: formData.discountPrice
              ? Number(formData.discountPrice)
              : null,
            subcategoryId: formData.subcategoryId || null,
       });
       if(data.success)
       {
        toast.success("Product updated successfully");
        setEditOpen(false);
        setSelectedProduct(null);
        fetchProducts();
       }else {
        toast.error(data.message || "Failed to update product");
      }
    } catch (error) {
       toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }
   function handleDeactivate(product) {
    setSelectedProduct(product);
    setConfirmAction("deactivate");
    setConfirmOpen(true);
  }
    function handleReactivate(product) {
    setSelectedProduct(product);
    setConfirmAction("reactivate");
    setConfirmOpen(true);
  }

  async function handleConfirm(){
    try {
      setIsSubmitting(true);
       const method = confirmAction === "deactivate" ? "DELETE" : "PATCH";
        const res = await fetch(
        `/api/admin/products/${selectedProduct.id}`,
        { method }
      );
     const data = await res.json();
      if (res.ok) {
        toast.success(
          confirmAction === "deactivate"
            ? "Product deactivated"
            : "Product reactivated"
        );
        setConfirmOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        console.log(data);
        
        toast.error(data.message || "Action failed");
      }
    } catch (error) {
       toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }
   const columns = getProductColumns({
    onEdit: handleEdit,
    onManage: handleManage,
    onDeactivate: handleDeactivate,
    onReactivate: handleReactivate,
  });
   const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;
  const totalVariants = products.reduce(
    (sum, p) => sum + (p._count?.variants || 0),
    0
  );

   return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product catalog
          </p>
        </div>
          <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add product
        </Button>
      </div>

       <div className="grid grid-cols-4 gap-4">
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total products</p>
          <p className="text-2xl font-semibold">{products.length}</p>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-semibold text-gray-400">{inactiveCount}</p>
        </div>
          <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total variants</p>
          <p className="text-2xl font-semibold">{totalVariants}</p>
        </div>
      </div>
        <Separator />

         <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search products..."
        isLoading={isLoading}
      />

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create product</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleCreate} isLoading={isSubmitting} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              onSubmit={handleUpdate}
              defaultValues={{
                name: selectedProduct.name,
                title: selectedProduct.title || "",
                description: selectedProduct.description || "",
                categoryId: selectedProduct.categoryId,
                subcategoryId: selectedProduct.subcategoryId || "",
                basePrice: String(selectedProduct.basePrice),
                discountPrice: selectedProduct.discountPrice
                  ? String(selectedProduct.discountPrice)
                  : "",
              }}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

       {/* Manage Variants & Images Dialog */}
      <ManageProductDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        product={selectedProduct}
      />
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          confirmAction === "deactivate"
            ? "Deactivate product?"
            : "Reactivate product?"
        }
        description={
          confirmAction === "deactivate"
            ? `Deactivating "${selectedProduct?.name}" will also deactivate all its variants.`
            : `Reactivating "${selectedProduct?.name}" will also reactivate all its variants.`
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
