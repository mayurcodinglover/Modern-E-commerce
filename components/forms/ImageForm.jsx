"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createImageSchema } from "@/lib/validations/product.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Link } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export function ImageForm({ onSubmit, isLoading }) {
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
    const form = useForm({
    resolver: zodResolver(createImageSchema),
    defaultValues: {
      imageUrl: "",
      altText: "",
      displayOrder: "0",
      isPrimary: false,
    },
  });
   // When user selects image from device
  // In real app you'd upload to cloudinary/s3 here
  // For now we use the local preview URL
  function handleDeviceUpload({ file, base64, preview }) {
    setUploadedPreview(preview);
    setSelectedFile(file);
    // Set imageUrl to preview for demo
    // In production: upload to storage → get URL → set here
    form.setValue("imageUrl", preview);
  }
  function handleSubmit(formData) {
    if (!formData.imageUrl) {
      form.setError("imageUrl", { message: "Please provide an image URL or upload a file" });
      return;
    }
    onSubmit({
      ...formData,
      file: selectedFile, // Pass the selected file for upload
    });
    setUploadedPreview(null);
    form.reset();
  }

    return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

         {/* Image source tabs — URL or Upload */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Upload from device
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Paste URL
            </TabsTrigger>
          </TabsList>

           {/* Upload Tab */}
          <TabsContent value="upload" className="mt-3">
            <ImageUploader
              onUpload={handleDeviceUpload}
              isLoading={isLoading}
            />
            {uploadedPreview && (
              <p className="text-xs text-green-600 mt-2">
                Image selected. Fill in details below and click Add image.
              </p>
            )}
          </TabsContent>

           {/* URL Tab */}
          <TabsContent value="url" className="mt-3">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* URL preview */}
            {form.watch("imageUrl") && (
              <div className="mt-2 rounded-lg overflow-hidden border h-32">
                <img
                  src={form.watch("imageUrl")}
                  alt="URL preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="altText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alt text</FormLabel>
                <FormControl>
                  <Input placeholder="Describe the image" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display order</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isPrimary"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer">
                Set as primary image
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add image"}
        </Button>
      </form>
    </Form>
    );
}