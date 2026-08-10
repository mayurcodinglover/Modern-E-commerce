"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newAddressSchema } from "@/lib/validations/auth.schema";
import { toast } from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/data-table/confirm-dialog";
import { MapPin, Plus, Star, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AddressesPage() {
  const user = useSelector((state) => state.auth.user);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const form = useForm({
    resolver: zodResolver(newAddressSchema),
    defaultValues: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
  });

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  async function fetchAddresses() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/addresses?userId=${user.id}`);
      const data = await res.json();
      if (data.success) setAddresses(data.data);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd(formData) {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Address added successfully");
        setAddOpen(false);
        form.reset();
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to add address");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditClick(address) {
    setSelectedAddress(address);
    form.reset({
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state || "",
      postalCode: address.postalCode,
      country: address.country,
    });
    setEditOpen(true);
  }

  async function handleEdit(formData) {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/addresses/${selectedAddress.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Address updated successfully");
        setEditOpen(false);
        setSelectedAddress(null);
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetDefault(addressId) {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Default address updated");
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete() {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/addresses/${selectedAddress.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Address deleted");
        setDeleteOpen(false);
        setSelectedAddress(null);
        fetchAddresses();
      } else {
        console.log(data);
        
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reusable address form fields
  function AddressFormFields() {
    return (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="addressLine1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address line 1 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="House/Flat no, Street name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="addressLine2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address line 2</FormLabel>
              <FormControl>
                <Input
                  placeholder="Landmark, Area (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="Ahmedabad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State *</FormLabel>
                <FormControl>
                  <Input placeholder="Gujarat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="380001"
                    maxLength={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country *</FormLabel>
                <FormControl>
                  <Input placeholder="India" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">My addresses</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your delivery addresses
          </p>
        </div>
        <Button size="sm" onClick={() => { form.reset(); setAddOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />
          Add address
        </Button>
      </div>

      {/* Address list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border rounded-xl p-5 animate-pulse"
            >
              <div className="h-4 bg-secondary rounded w-1/2 mb-2" />
              <div className="h-3 bg-secondary rounded w-3/4 mb-1" />
              <div className="h-3 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 border rounded-xl">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
          <p className="font-medium mb-1">No addresses saved</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add a delivery address to speed up checkout.
          </p>
          <Button
            variant="outline"
            onClick={() => { form.reset(); setAddOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-xl p-5 transition-colors ${
                address.isDefault ? "border-primary/40 bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      address.isDefault
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">
                        {address.addressLine1}
                      </p>
                      {address.isDefault && (
                        <Badge
                          variant="outline"
                          className="text-xs text-primary border-primary"
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                    {address.addressLine2 && (
                      <p className="text-sm text-muted-foreground">
                        {address.addressLine2}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state}{" "}
                      {address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.country}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground"
                      onClick={() => handleSetDefault(address.id)}
                      title="Set as default"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => handleEditClick(address)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-500 hover:text-red-700"
                    onClick={() => {
                      setSelectedAddress(address);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add new address</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAdd)}
              className="space-y-4"
            >
              <AddressFormFields />
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save address"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit address</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEdit)}
              className="space-y-4"
            >
              <AddressFormFields />
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Update address"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditOpen(false);
                    setSelectedAddress(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete address?"
        description="This address will be permanently removed. If it is linked to an existing order it cannot be deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={isSubmitting}
        destructive={true}
      />
    </div>
  );
}