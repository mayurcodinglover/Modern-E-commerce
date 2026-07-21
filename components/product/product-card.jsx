"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart, Package, Axis3DIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlistLocally, removeFromWishlistLocally } from "../../app/store/slices/wishlistSlice";
import { toast } from "sonner";
import axios from "axios";

export function ProductCard({ product, userId }) {
    const dispatch = useDispatch();
    const wishlistItems = useSelector((state) => state.wishlist.items);
    const [addingToCart, setAddingToCart] = useState(false);

     const primaryImage = product.images?.find((img) => img.isPrimary);
  const finalPrice = product.discountPrice ?? product.basePrice;
  const discountPercent = product.discountPrice
    ? Math.round(
        ((Number(product.basePrice) - Number(product.discountPrice)) /
          Number(product.basePrice)) *
          100
      )
    : 0;

     const isInWishlist = wishlistItems.some(
    (item) => item.productId === product.id
  );

   const totalStock = product.variants?.reduce(
    (sum, v) => sum + v.stockQuantity,
    0
  );
  const inStock = totalStock > 0;

   async function handleWishlistToggle(e) {
    e.preventDefault();
    if (!userId) {
      toast.error("Please login to add to wishlist");
      return;
    }

    if(isInWishlist)
    {
        const item=wishlistItems.find((i)=>i.productId===product.id);
        try {
            const res=await axios.delete(`/api/whishlist/${item.id}`);
            if(res.status===200)
            {
              dispatch(removeFromWishlistLocally(item.id));
              toast.success("Removed from wishlist");
            }
        } catch (error) {
             toast.error("Something went wrong");
        }
    }
    else{
      try {
        const res=await axios.post("/api/whishlist",{userId,productId:product.id});
        if(res.status===201)
        {
          dispatch(addToWishlistLocally({id:res.data.data.id,productId:product.id}));
           toast.success("Added to wishlist");
        }
      } catch (error) {
        toast.error("Something went wrong");
      }
    }
  }
  return (
    <Link href={`/products/${product.id}`}>
      <div className="group border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 bg-background h-full flex flex-col">

        {/* Image */}
        <div className="relative aspect-square bg-secondary overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.imageUrl}
              alt={primaryImage.altText || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercent > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-1.5">
                -{discountPercent}%
              </Badge>
            )}
            {!inStock && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5"
              >
                Out of stock
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all
              ${
                isInWishlist
                  ? "bg-red-500 text-white"
                  : "bg-white/80 text-muted-foreground hover:bg-white"
              }`}
          >
            <Heart
              className="h-4 w-4"
              fill={isInWishlist ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">
              {product.category?.name}
            </p>
            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-semibold">
              ₹{Number(finalPrice).toFixed(0)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{Number(product.basePrice).toFixed(0)}
              </span>
            )}
          </div>

          {/* Variants count */}
          {product.variants?.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {product.variants.length} variant
              {product.variants.length !== 1 ? "s" : ""} available
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}