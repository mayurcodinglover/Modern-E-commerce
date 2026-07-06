"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { CategoryForm } from "@/components/forms/category-form";
import { getCategoryColumns } from "@/components/columns/category-columns";
import { ConfirmDialog } from "@/components/data-table/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Selected category for edit/delete
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch all categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/categories?includeInactive=true");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  // Create category
  async function handleCreate(formData) {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category created successfully");
        setCreateOpen(false);
        fetchCategories();
      } else {
        toast.error(data.message || "Failed to create category");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Edit category
  function handleEdit(category) {
    setSelectedCategory(category);
    setEditOpen(true);
  }

  async function handleUpdate(formData) {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category updated successfully");
        setEditOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        toast.error(data.message || "Failed to update category");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Deactivate category
  function handleDeactivate(category) {
    setSelectedCategory(category);
    setConfirmAction("deactivate");
    setConfirmOpen(true);
  }

  // Reactivate category
  function handleReactivate(category) {
    setSelectedCategory(category);
    setConfirmAction("reactivate");
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    try {
      setIsSubmitting(true);
      const method = confirmAction === "deactivate" ? "DELETE" : "PATCH";
      const res = await fetch(
        `/api/admin/categories/${selectedCategory.id}`,
        { method }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(
          confirmAction === "deactivate"
            ? "Category deactivated"
            : "Category reactivated"
        );
        setConfirmOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        toast.error(data.message || "Action failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns = getCategoryColumns({
    onEdit: handleEdit,
    onDeactivate: handleDeactivate,
    onReactivate: handleReactivate,
  });

  // Stats
  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.filter((c) => !c.isActive).length;

  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your product categories
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold">{categories.length}</p>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-semibold text-gray-400">{inactiveCount}</p>
        </div>
      </div>

      <Separator />

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={categories}
        searchKey="name"
        searchPlaceholder="Search categories..."
        isLoading={isLoading}
      />

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleCreate}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              onSubmit={handleUpdate}
              defaultValues={{
                name: selectedCategory.name,
                slug: selectedCategory.slug,
                description: selectedCategory.description || "",
                imageUrl: selectedCategory.imageUrl || "",
              }}
              isLoading={isSubmitting}
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
            ? "Deactivate category?"
            : "Reactivate category?"
        }
        description={
          confirmAction === "deactivate"
            ? `Deactivating "${selectedCategory?.name}" will also deactivate all its subcategories. Products in this category will be hidden.`
            : `Reactivating "${selectedCategory?.name}" will also reactivate all its subcategories.`
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