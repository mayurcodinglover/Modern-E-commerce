"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVariantSchema } from "@/lib/validations/product.schema";

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

export function VariantForm({ onSubmit, isLoading }) {
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

   const form = useForm({
    resolver: zodResolver(createVariantSchema),
    defaultValues: {
      sku: "",
      sizeId: "",
      colorId: "",
      stockQuantity: "0",
      extraPrice: "0",
    },
  });
   useEffect(() => {
    fetchSizeAndColors();
  }, []);

  async function  fetchSizeAndColors(){
    try {
         const [sizesRes, colorsRes] = await Promise.all([
        fetch("/api/admin/sizes"),
        fetch("/api/admin/colors"),
      ]);
      const sizesData = await sizesRes.json();
      const colorsData = await colorsRes.json();
      if (sizesData.success) setSizes(sizesData.data);
      if (colorsData.success) setColors(colorsData.data);
    } catch (error) {
         console.error("Failed to fetch sizes/colors", error);
    }
  }
   return (
    <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. CLASSIC-TEE-RED-M" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sizeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
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
            name="colorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        <div className="flex items-center gap-2">
                          {color.hexCode && (
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{ backgroundColor: color.hexCode }}
                            />
                          )}
                          {color.name}
                        </div>
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
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extraPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extra price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add variant"}
        </Button>
         </form>
    </Form>
   )
}