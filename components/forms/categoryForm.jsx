"use client";
import React from 'react'
import { useEffect } from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { createCategorySchema } from '@/lib/validations/category.schema';
import { generateSlug } from '@/lib/utils/slug';
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

const CategoryForm = ({ onSubmit, defaultValues, isLoading }) => {
  const form=useForm({
    resolver:zodResolver(createCategorySchema),
    defaultValues:defaultValues || {
      name:"",
      slug:"",
      description:"",
      imageUrl:"",
    },
  });
  const nameValue=form.watch("name");
  useEffect(() => {
    if(!defaultValues)
    {
      form.setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue]);
  return (
    <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({field})=>(
              <FormItem>
              <FormLabel>Category name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Men's Clothing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
          <FormField
          control={form.control}
          name="slug"
          render={({field})=>(
              <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. mens-clothing" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
          <FormField
          control={form.control}
          name="description"
          render={({field})=>(
              <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. This category includes all men's clothing items." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
          <FormField
          control={form.control}
          name="imageUrl"
          render={({field})=>(
              <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="e.g. https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />

          <div className="flex gap-2 pt-2">
             <Button type="submit" disabled={isLoading}>
              {isLoading
              ? "Saving..."
              : defaultValues
              ? "Update category"
              : "Create category"}
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

export default CategoryForm
