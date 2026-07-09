"use client";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { SizeForm } from "@/components/forms/SizeForm";
import { ConfirmDialog } from "@/components/data-table/confirm-dialog";
import { RowActions } from "@/components/data-table/row-action";
import { ColumnHeader } from "@/components/data-table/column-header";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function SizesPage() {
     const [sizes, setSizes] = useState([]);
     const [isLoading, setIsLoading] = useState(true);
     const [isSubmitting, setIsSubmitting] = useState(false);
      const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    fetchSizes();
  }, []);

  async function fetchSizes(){
    try {
        setIsLoading(true);
        const res=await axios.get("/api/admin/size");
        if(res.status===200)
        {
            setSizes(res.data.data)
        }
        else{
            toast.error("Failed to load sizes");
        }
    } catch (error) {
        toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData){
    try {
        setIsSubmitting(true);
        const res=await axios.post("/api/admin/size",formData);
        if(res.status===201)
        {
            toast.success(res.data.message);
            setCreateOpen(false);
            fetchSizes();
        }
        else{
            toast.error(data.message || "Failed to add size");
        }
    } catch (error) {
        console.log(error);
        
        toast.error("Something went wrong");
    }finally{
        setIsSubmitting(false);
    }
  }
   function handleEdit(size) {
    setSelectedSize(size);
    setEditOpen(true);
  }
  async function handleUpdate(formData)
  {
    try {
        setIsSubmitting(true);
        const res=await axios.put(`/api/admin/size/${selectedSize.id}`,formData);
        if(res.status===200)
        {
             toast.success("Size updated successfully");
        setEditOpen(false);
        setSelectedSize(null);
        fetchSizes();
        }
        else{
             toast.error(data.message || "Failed to update size");
        }
    } catch (error) {
        toast.error("Something went wrong");
    }finally {
      setIsSubmitting(false);
    }
  }
   function handleDeleteClick(size) {
    setSelectedSize(size);
    setDeleteOpen(true);
  }
  async function handleDelete(){
    try {
         setIsSubmitting(true);
         const res=await axios.delete(`/api/admin/size/${selectedSize.id}`);
         if(res.status===200)
         {
             toast.success("Size deleted successfully");
        setDeleteOpen(false);
        setSelectedSize(null);
        fetchSizes();
         }else {
        toast.error(data.message || "Failed to delete size");
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
          header: ({ column }) => <ColumnHeader column={column} title="Size name" />,
           cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
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
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: handleDeleteClick,
              destructive: true,
            },
          ]}
        />
      ),
    }
  ];
   return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sizes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage product sizes
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add size
        </Button>
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total sizes</p>
          <p className="text-2xl font-semibold">{sizes.length}</p>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Available sizes</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {sizes.slice(0, 8).map((s) => (
              <span
                key={s.id}
                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
              >
                {s.name}
              </span>
            ))}
            {sizes.length > 8 && (
              <span className="text-xs text-muted-foreground">
                +{sizes.length - 8} more
              </span>
            )}
          </div>
        </div>
      </div>
        <Separator />

      <DataTable
        columns={columns}
        data={sizes}
        searchKey="name"
        searchPlaceholder="Search sizes..."
        isLoading={isLoading}
      />

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add size</DialogTitle>
          </DialogHeader>
          <SizeForm
            onSubmit={handleCreate}
            isLoading={isSubmitting}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit size</DialogTitle>
          </DialogHeader>
          {selectedSize && (
            <SizeForm
              onSubmit={handleUpdate}
              defaultValues={{ name: selectedSize.name }}
              isLoading={isSubmitting}
              onCancel={() => {
                setEditOpen(false);
                setSelectedSize(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
       {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete size?"
        description={`Are you sure you want to delete "${selectedSize?.name}"? This cannot be undone. Sizes used in product variants cannot be deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={isSubmitting}
        destructive={true}
      />
    </div>
   )
}