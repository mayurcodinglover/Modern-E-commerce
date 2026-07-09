"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSizeSchema } from "@/lib/validations/size.schema";
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

export function SizeForm({onSubmit,defaultValues,isLoading,onCancel}) {
    const form=useForm({
        resolver:zodResolver(createSizeSchema),
        defaultValues:defaultValues || {
            name:""
        }
    });
    function handleSubmit(formData) {
        onSubmit(formData);
        if(!defaultValues) {
            form.reset();
        }
    }
     return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
             <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. S, M, L, XL, 32, 34" {...field} />
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
              ? "Update size"
              : "Add size"}
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