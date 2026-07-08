"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { VariantForm } from "@/components/forms/VariantForm";
import { ImageForm } from "@/components/forms/ImageForm";
import { StatusBadge } from "@/components/data-table/status-badge";
import { Trash2, Star, StarOff } from "lucide-react";
import { Badge } from "./ui/badge";
import axios from "axios";

export function ManageProductDialog({ open, onOpenChange, product }) {
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("variants");

  useEffect(() => {
    if (product && open) {
      fetchVariants();
      fetchImages();
    }
  }, [product, open]);

  async function fetchVariants(){
    try {
        const res=await axios.get(`/api/admin/products/${product.id}/variants?includeInactive=true`);
        if(res.status===200)
        {
            setVariants(res.data.data);
        }
    } catch (error) {
         toast.error("Failed to load variants");
    }
  }
  async function fetchImages(){
    try {
        const res=await axios.get(`/api/admin/products/${product.id}/images`);
        if(res.data.success)
        {
            setImages(res.data.data)
        }
    } catch (error) {
         toast.error("Failed to load images");
    }
  }
  async function handleAddVariant(formData){
    try {
          setIsSubmitting(true);
          const res=await axios.post(`/api/admin/products/${product.id}/variants`,{
            ...formData,
            stockQuantity:Number(formData.stockQuantity),
            extraPrice:Number(formData.extraPrice),
            sizeId:formData.sizeId || null,
            colorId:formData.colorId || null
          });
          if(res.status===201)
          {
            toast.success("Variant added successfully");
            fetchVariants();
          }
          else{
             toast.error(res.data.message || "Failed to add variant");
          }
    } catch (error) {
        toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleDeleteVariant(variantId)
  {
    try {
        const res=await axios.delete(`/api/admin/products/${product.id}/variants/${variantId}`);
        if(res.status===200)
        {
             toast.success("Variant deleted");
        fetchVariants();
        }else {
        toast.error(res.data.message || "Failed to delete variant");
      }
    } catch (error) {
      console.log(error);
         toast.error("Something went wrong");
    }
  }
  async function handleAddImage(formData)
  {
    try {
        setIsSubmitting(true);
        const uploadData = new FormData();

uploadData.append("file", formData.file);
    uploadData.append("altText", formData.altText);
    uploadData.append("displayOrder", Number(formData.displayOrder));
    uploadData.append("isPrimary", String(formData.isPrimary));
          const res=await axios.post(`/api/admin/products/${product.id}/images`,uploadData);
        if(res.status===201)
        {
             toast.success("Image added successfully");
        fetchImages();
        } else {
        toast.error(res.data.message || "Failed to add image");
      }
    } catch (error) {
         toast.error("Something went wrong");
    }finally{
        setIsSubmitting(false);
    }
  }
  async function handleSetPrimary(imageId)
  {
    try {
        const {data}=await axios.patch(`/api/admin/products/${product.id}/images/${imageId}/primary`);
        if(data.success)
        {
             toast.success("Primary image updated");
        fetchImages();
        } else {
        toast.error(data.message || "Failed to update primary image");
      }

    } catch (error) {
         toast.error("Something went wrong");
    }
  }
  async function handleDeleteImage(imageId)
  {
    try {
        const {data}=await axios.delete(`/api/admin/products/${product.id}/images/${imageId}`);
        if(data.success)
        {
             toast.success("Image deleted");
        fetchImages();
        }else {
        toast.error(data.message || "Failed to delete image");
      }
    } catch (error) {
         toast.error("Something went wrong");
    }
  }
    if (!product) return null;

     return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage — {product.name}</DialogTitle>
        </DialogHeader>

        {/* Tab buttons */}
        <div className="flex gap-2 border-b pb-2">
          <button
            className={`text-sm px-4 py-1.5 rounded-md ${
              activeTab === "variants"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
            onClick={() => setActiveTab("variants")}
          >
            Variants ({variants.length})
          </button>
          <button
            className={`text-sm px-4 py-1.5 rounded-md ${
              activeTab === "images"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
            onClick={() => setActiveTab("images")}
          >
            Images ({images.length})
          </button>
        </div>
        {/* Variants Tab */}
        {activeTab === "variants" && (
          <div className="space-y-4">
            <VariantForm onSubmit={handleAddVariant} isLoading={isSubmitting} />
            <Separator />
            <h4 className="text-sm font-medium">
              Existing variants ({variants.length})
            </h4>
            {variants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No variants yet. Add one above.
              </p>
            ) : (
              <div className="space-y-2">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-mono font-medium">
                          {variant.sku}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {variant.size && (
                            <Badge variant="outline" className="text-xs">
                              {variant.size.name}
                            </Badge>
                          )}
                          {variant.color && (
                            <Badge
                              variant="outline"
                              className="text-xs flex items-center gap-1"
                            >
                              {variant.color.hexCode && (
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: variant.color.hexCode,
                                  }}
                                />
                              )}
                              {variant.color.name}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Stock: {variant.stockQuantity}
                          </span>
                          {Number(variant.extraPrice) > 0 && (
                            <span className="text-xs text-muted-foreground">
                              +₹{Number(variant.extraPrice).toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={variant.isActive} />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteVariant(variant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="space-y-4">
            <ImageForm onSubmit={handleAddImage} isLoading={isSubmitting} />
            <Separator />
            <h4 className="text-sm font-medium">
              Existing images ({images.length})
            </h4>
            {images.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No images yet. Add one above.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="h-24 bg-secondary flex items-center justify-center overflow-hidden">
                      <img
                        src={image.imageUrl}
                        alt={image.altText || "Product image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "";
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {image.altText || "No alt text"}
                      </p>
                      {image.isPrimary && (
                        <Badge className="text-xs mt-1 bg-green-100 text-green-800">
                          Primary
                        </Badge>
                      )}
                      <div className="flex gap-1 mt-2">
                        {!image.isPrimary && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => handleSetPrimary(image.id)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Set primary
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 h-7 px-2"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
         </DialogContent>
    </Dialog>
     );
}