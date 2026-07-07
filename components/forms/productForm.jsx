import React from 'react'
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@/lib/validations/product.schema";
import axios from "axios"
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export function ProductForm({onSubmit,defaultValues,isLoading})
{
   const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const form = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: defaultValues || {
      name: "",
      title: "",
      description: "",
      categoryId: "",
      subcategoryId: "",
      basePrice: "",
      discountPrice: "",
    },
  });
  const selectedCategoryId=form.watch("categoryId");

    const fetchCategories=async()=>{
    try {
        const res=await axios.get("/api/admin/category?includeInactive=true");
        if(res.data.success)
        {
          setCategories(res.data.data)
        }
        else{
          console.error(res.data.message);
          toast.error(res.data.message);
        }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }
  useEffect(() => {
    fetchCategories();
  }, []);
   const fetchSubCategories=async(categoryId)=>{
    try {
      const res=await axios.get(`/api/admin/subcategory?categoryId=${categoryId}&includeInactive=true`);
      console.log(res);
      
      if(res.status===200)
      {
        setSubcategories(res.data.data);
      }
      else{
         console.error(res.data.message);
          toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories",error);
    }
  }
   useEffect(() => {
    if (selectedCategoryId) {
      fetchSubCategories(selectedCategoryId);
      form.setValue("subcategoryId", "");
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);


 
  return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Classic Tee" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Men's Classic T-Shirt" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
           <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Product description..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
          <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
            name="subcategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedCategoryId || loadingSubcategories}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingSubcategories
                            ? "Loading..."
                            : !selectedCategoryId
                            ? "Select category first"
                            : "Select subcategory"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base price (₹) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="999"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discountPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount price (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="799"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : defaultValues
              ? "Update product"
              : "Create product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Reset
            </Button>
        </div>
        </form>
      </Form>
  )
}
