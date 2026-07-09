"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSubcategorySchema } from "@/lib/validations/subcategory.schema";
import { generateSlug } from "@/lib/utils/slug";
import axios from "axios";
import toast from "react-hot-toast";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SubcategoryForm({
  onSubmit,
  defaultValues,
  isLoading,
  onCancel,
  prefillCategoryId,
}) {

    const [categories, setCategories] = useState([]);
     const form = useForm({
    resolver: zodResolver(createSubcategorySchema),
    defaultValues: defaultValues || {
      categoryId: prefillCategoryId || "",
      name: "",
      slug: "",
    },
  });
   const nameValue = form.watch("name");

    useEffect(() => {
    if (!defaultValues) {
      form.setValue("slug", generateSlug(nameValue || ""));
    }
  }, [nameValue]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories(){
    try {
        const res=await axios.get("/api/category?includeInactive=true");
        if(res.status===200)
        {
            setCategories(res.data.data);
        }
        else{
            toast.error("Failed to fetch categories");
        }
    } catch (error) {
         console.error("Failed to fetch categories", error);
    }
  }
   function handleSubmit(data) {
    onSubmit(data);
    if (!defaultValues) form.reset();
  }

    return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent category *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subcategory name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. T-Shirts" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. t-shirts" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : defaultValues
              ? "Update subcategory"
              : "Add subcategory"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
      </Form>
    )
}