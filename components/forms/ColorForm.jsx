"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createColorSchema } from "@/lib/validations/color.schema";
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

export function ColorForm({ onSubmit, defaultValues, isLoading, onCancel }) {
  const form = useForm({
    resolver: zodResolver(createColorSchema),
    defaultValues: defaultValues || { name: "", hexCode: "" },
  });

   const hexValue = form.watch("hexCode");

   function handleSubmit(data) {
    onSubmit(data);
    if (!defaultValues) form.reset();
  }
   return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
             <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Red, Navy Blue, Off White" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="hexCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hex code (optional)</FormLabel>
              <FormControl>
                <div className="flex gap-2 items-center">
                  {/* Color picker input */}
                  <input
                    type="color"
                    value={hexValue || "#000000"}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                    className="w-10 h-9 rounded cursor-pointer border p-0.5"
                  />
                  <Input
                    placeholder="#FF0000"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value.toUpperCase());
                    }}
                  />
                  {/* Live preview swatch */}
                  {hexValue && /^#[0-9A-Fa-f]{6}$/.test(hexValue) && (
                    <div
                      className="w-9 h-9 rounded-md border flex-shrink-0"
                      style={{ backgroundColor: hexValue }}
                    />
                  )}
                </div>
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
              ? "Update color"
              : "Add color"}
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
  );
}