"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { SubcategoryForm } from "@/components/forms/SubCategoryForm";
import { ConfirmDialog } from "@/components/data-table/confirm-dialog";
import { RowActions } from "@/components/data-table/row-action";
import { ColumnHeader } from "@/components/data-table/column-header";
import { StatusBadge } from "@/components/data-table/status-badge";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, RotateCcw } from "lucide-react";


export default function SubcategoriesPage() {
     const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    if (selectedCategoryId && selectedCategoryId !== "all") {
        console.log(selectedCategoryId);
      fetchSubcategories(selectedCategoryId);
    } else if (selectedCategoryId === "all") {
      fetchAllSubcategories();
    }
  }, [selectedCategoryId]);

  async function fetchCategories(){
    try {
        const res=await axios.get("/api/admin/category");
        console.log(res);
        
        if(res.status===200)
        {
            setCategories(res.data.data);
            fetchAllSubcategories();
        }
    } catch (error) {
        toast.error("Failed to load categories");
    }
  }

  async function fetchAllSubcategories(){
    try {
         setIsLoading(true);
         const res=await axios.get("/api/admin/subcategory?includeInactive=true");
          
         if(res.status===200)
         {
            setSubcategories(res.data.data);
         }
         else toast.error("Failed to load subcategories");
    } catch (error) {
        toast.error("Something went wrong");
    } finally {
    setIsLoading(false);
  }
  }

  async function fetchSubcategories(categoryId){
    try {
        setIsLoading(true);
        const res=await axios.get(`/api/admin/subcategory?categoryId=${categoryId}&includeInactive=true`);
        if(res.status===200)
        {
            setSubcategories(res.data.data);
        }
    } catch (error) {
         toast.error("Failed to load subcategories");
    }finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData){
    try {
        setIsSubmitting(true);
        const res=await axios.post("/api/admin/subcategory",formData);
        if(res.status===201)
        {
             toast.success("Subcategory created successfully");
              setCreateOpen(false);
               selectedCategoryId === "all"
          ? fetchAllSubcategories()
          : fetchSubcategories(selectedCategoryId);
        }
        else{
             toast.error(res.data.message || "Failed to create subcategory");
        }
    } catch (error) {
         toast.error(res.data.message || "Failed to create subcategory");
    } finally {
      setIsSubmitting(false);
    }
  }
  function handleEdit(sub) {
    setSelectedSubcategory(sub);
    setEditOpen(true);
  }

  async function handleUpdate(formData){
    try {
        setIsSubmitting(true);
        const res=await axios.put(`/api/admin/subcategory/${selectedSubcategory.id}`,formData);
        if(res.status===200)
        {
             toast.success("Subcategory updated successfully");
        setEditOpen(false);
        setSelectedSubcategory(null);
        selectedCategoryId === "all"
          ? fetchAllSubcategories()
          : fetchSubcategories(selectedCategoryId);
        }
        else{
             toast.error(res.data.message || "Failed to update subcategory");
        }
    } catch (error) {
         toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }
   function handleDeactivate(sub) {
    setSelectedSubcategory(sub);
    setConfirmAction("deactivate");
    setConfirmOpen(true);
  }
    function handleReactivate(sub) {
    setSelectedSubcategory(sub);
    setConfirmAction("reactivate");
    setConfirmOpen(true);
  }
  async function handleConfirm(){
    try {
        setIsSubmitting(true);
         const method = confirmAction === "deactivate" ? "DELETE" : "PATCH";
          const res = await fetch(
        `/api/admin/subcategory/${selectedSubcategory.id}`,
        { method }
      );
        const data = await res.json();
      if (data.success) {
        toast.success(
          confirmAction === "deactivate"
            ? "Subcategory deactivated"
            : "Subcategory reactivated"
        );
        setConfirmOpen(false);
        setSelectedSubcategory(null);
        selectedCategoryId === "all"
          ? fetchAllSubcategories()
          : fetchSubcategories(selectedCategoryId);
    }
    else{
         toast.error(data.message || "Action failed");
    }
    } catch (error) {
         toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }
  const columns=[
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
      accessorKey: "category",
      header: ({ column }) => (
        <ColumnHeader column={column} title="Parent category" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.category?.name || "—"}
        </span>
      ),
    },
     {
      accessorKey: "isActive",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge value={row.original.isActive} />,
    }, {
      accessorKey: "createdAt",
      header: ({ column }) => <ColumnHeader column={column} title="Created" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
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
              onClick: handleEdit,
            },
            row.original.isActive
              ? {
                  label: "Deactivate",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: handleDeactivate,
                  destructive: true,
                }
              : {
                  label: "Reactivate",
                  icon: <RotateCcw className="h-4 w-4" />,
                  onClick: handleReactivate,
                },
          ]}
        />
      ),
    },
  ];
  const activeCount = subcategories.filter((s) => s.isActive).length;
    return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subcategories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage subcategories under each category
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add subcategory
        </Button>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold">{subcategories.length}</p>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-semibold text-gray-400">
            {subcategories.length - activeCount}
          </p>
        </div>
      </div>

         {/* Filter by category */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">Filter by category:</p>
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

       <DataTable
        columns={columns}
        data={subcategories}
        searchKey="name"
        searchPlaceholder="Search subcategories..."
        isLoading={isLoading}
      />

       {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add subcategory</DialogTitle>
          </DialogHeader>
          <SubcategoryForm
            onSubmit={handleCreate}
            isLoading={isSubmitting}
            onCancel={() => setCreateOpen(false)}
            prefillCategoryId={
              selectedCategoryId !== "all" ? selectedCategoryId : ""
            }
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit subcategory</DialogTitle>
          </DialogHeader>
          {selectedSubcategory && (
            <SubcategoryForm
              onSubmit={handleUpdate}
              defaultValues={{
                categoryId: selectedSubcategory.categoryId,
                name: selectedSubcategory.name,
                slug: selectedSubcategory.slug,
              }}
              isLoading={isSubmitting}
              onCancel={() => {
                setEditOpen(false);
                setSelectedSubcategory(null);
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
            ? "Deactivate subcategory?"
            : "Reactivate subcategory?"
        }
        description={
          confirmAction === "deactivate"
            ? `Deactivating "${selectedSubcategory?.name}" will hide it from the shop.`
            : `Reactivating "${selectedSubcategory?.name}" will make it visible again.`
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