"use client"
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { ColorForm } from "@/components/forms/ColorForm";
import { ConfirmDialog } from "@/components/data-table/confirm-dialog";
import { RowActions } from "@/components/data-table/row-action";
import { ColumnHeader } from "@/components/data-table/column-header";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2 } from "lucide-react";
import axios from "axios"
export default function ColorsPage() {
     const [colors, setColors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    fetchColors();
  }, []);

  async function fetchColors(){
    try {
         setIsLoading(true);
         const res=await axios.get("/api/admin/color");
         if(res.status===200)
         {
            setColors(res.data.data);
         }
          else toast.error("Failed to load colors");
    } catch (error) {
        toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }
  async function handleCreate(formData){
    try {
         setIsSubmitting(true);
         const res=await axios.post("/api/admin/color",formData);
         console.log(res);
         
         if(res.status===201)
         {
            toast.success(res.data.message);
             setCreateOpen(false);
             fetchColors();
         }else {
        toast.error(data.message || "Failed to add color");
      }
    } catch (error) {
          toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }
  function handleEdit(color){
    setSelectedColor(color);
    setEditOpen(true);
  }
  async function handleUpdate(formData){
    try {
        setIsSubmitting(true);
        const res=await axios.put(`/api/admin/color/${selectedColor.id}`,formData);
        console.log(res);
        
        if(res.status===200)
        {
            toast.success(res.data.message);
            setEditOpen(false);
            setSelectedColor(null);
            fetchColors();
        }
         else {
        toast.error(data.message || "Failed to update color");
      }
    } catch (error) {
        console.error(error);
         toast.error("Something went wrong");
    }finally {
      setIsSubmitting(false);
    }
  }
  function handleDeleteClick(color){
    setSelectedColor(color);
    setDeleteOpen(true);
  }
  async function handleDelete(){
    try {
         setIsSubmitting(true);
         const res=await axios.delete(`/api/admin/color/${selectedColor.id}`);
         if(res.status===200)
         {
            toast.success(res.data.message);
            setSelectedColor(null);
            setDeleteOpen(false);
            fetchColors();
         }else {
        toast.error(data.message || "Failed to delete color");
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
      header: ({ column }) => <ColumnHeader column={column} title="Color" />,
       cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full border shadow-sm flex-shrink-0"
            style={{
              backgroundColor: row.original.hexCode || "#e5e7eb",
            }}
          />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
     {
      accessorKey: "hexCode",
      header: ({ column }) => <ColumnHeader column={column} title="Hex code" />,
      cell: ({ row }) => (
        <span className="text-sm font-mono text-muted-foreground">
          {row.original.hexCode || "—"}
        </span>
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
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Colors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage product colors
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add color
        </Button>
      </div>
         <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total colors</p>
          <p className="text-2xl font-semibold">{colors.length}</p>
        </div>
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Color swatches</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {colors.slice(0, 10).map((c) => (
              <div
                key={c.id}
                className="w-5 h-5 rounded-full border"
                style={{ backgroundColor: c.hexCode || "#e5e7eb" }}
                title={c.name}
              />
            ))}
            {colors.length > 10 && (
              <span className="text-xs text-muted-foreground self-center">
                +{colors.length - 10} more
              </span>
            )}
          </div>
        </div>
      </div>
       <Separator />
        <DataTable
        columns={columns}
        data={colors}
        searchKey="name"
        searchPlaceholder="Search colors..."
        isLoading={isLoading}
      />

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add color</DialogTitle>
          </DialogHeader>
          <ColorForm
            onSubmit={handleCreate}
            isLoading={isSubmitting}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit color</DialogTitle>
          </DialogHeader>
          {selectedColor && (
            <ColorForm
              onSubmit={handleUpdate}
              defaultValues={{
                name: selectedColor.name,
                hexCode: selectedColor.hexCode || "",
              }}
              isLoading={isSubmitting}
              onCancel={() => {
                setEditOpen(false);
                setSelectedColor(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
        <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete color?"
        description={`Are you sure you want to delete "${selectedColor?.name}"? Colors used in product variants cannot be deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={isSubmitting}
        destructive={true}
      />
    </div>
  );
}