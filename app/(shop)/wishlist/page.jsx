"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setWishlist,
  removeFromWishlistLocally,
} from "../../store/slices/wishlistSlice";
import { addItemLocally, setCart } from "../../store/slices/wishlistSlice";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Package,
  ArrowRight,
  Star,
} from "lucide-react";


function WishlistSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full mt-3" />
      </div>
    </div>
  );
}

function WishlistItem({ item, onRemove, onAddToCart, isAddingToCart }) {
      const product = item.product;
  const primaryImage = product?.images?.[0];
  const finalPrice = product?.discountPrice ?? product?.basePrice;
  const discountPercent = product?.discountPrice
    ? Math.round(
        ((Number(product.basePrice) - Number(product.discountPrice)) /
          Number(product.basePrice)) *
          100
      )
    : 0;

     return (
    <div className="border rounded-xl overflow-hidden group hover:shadow-md transition-all duration-200 bg-background flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-secondary overflow-hidden">
        <Link href={`/products/${product?.id}`}>
          {primaryImage ? (
            <img
              src={primaryImage.imageUrl}
              alt={primaryImage.altText || product?.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercent > 0 && (
            <Badge className="bg-red-500 text-white text-xs px-1.5">
              -{discountPercent}%
            </Badge>
          )}
          {!item.isInStock && (
            <Badge variant="secondary" className="text-xs">
              Out of stock
            </Badge>
          )}
        </div>

        {/* Remove from wishlist */}
        <button
          onClick={() => onRemove(item.id)}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Remove from wishlist"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-0.5">
            {product?.category?.name}
          </p>
          <Link href={`/products/${product?.id}`}>
            <h3 className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
              {product?.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-semibold">
              ₹{Number(finalPrice).toFixed(0)}
            </span>
            {product?.discountPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{Number(product.basePrice).toFixed(0)}
              </span>
            )}
          </div>

          {/* Stock info */}
          <p
            className={`text-xs mt-1 ${
              item.isInStock ? "text-green-600" : "text-red-500"
            }`}
          >
            {item.isInStock
              ? `${item.totalStock} in stock`
              : "Out of stock"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Link href={`/products/${product?.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full text-xs"
              size="sm"
              disabled={!item.isInStock}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
              {item.isInStock ? "Select & add" : "Out of stock"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default function WishlistPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setIsLoading(false);
    }
  }, [user]);

   async function fetchWishlist() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/wishlist?userId=${user.id}`);
      const data = await res.json();
      console.log(data);
      
      if (data.success) {
        setItems(data.data);
        dispatch(
          setWishlist(
            data.data.map((item) => ({
              id: item.id,
              productId: item.productId,
            }))
          )
        );
      }
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  }
   async function handleRemove(wishlistItemId) {
    try {
      const res = await fetch(`/api/wishlist/${wishlistItemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        dispatch(removeFromWishlistLocally(wishlistItemId));
        setItems((prev) => prev.filter((i) => i.id !== wishlistItemId));
        toast.success("Removed from wishlist");
      } else {
        toast.error(data.message || "Failed to remove");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }
   async function handleClearWishlist() {
    try {
      const res = await fetch(`/api/wishlist?userId=${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        dispatch(setWishlist([]));
        setItems([]);
        toast.success("Wishlist cleared");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }
   if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please login first</h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view your wishlist.
        </p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }
   const inStockItems = items.filter((i) => i.isInStock);
  const outOfStockItems = items.filter((i) => !i.isInStock);

   return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            My wishlist
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Loading..."
              : `${items.length} item${items.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500"
            onClick={handleClearWishlist}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <WishlistSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty wishlist */
        <div className="text-center py-16">
          <Heart className="h-20 w-20 mx-auto text-muted-foreground/20 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-muted-foreground mb-6">
            Save items you love and come back to them later.
          </p>
          <Link href="/products">
            <Button>
              Explore products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold">{items.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total saved
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold text-green-600">
                {inStockItems.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                In stock
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold text-red-500">
                {outOfStockItems.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Out of stock
              </p>
            </div>
          </div>

          {/* In stock items */}
          {inStockItems.length > 0 && (
            <div>
              {outOfStockItems.length > 0 && (
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Available ({inStockItems.length})
                </h2>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {inStockItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Out of stock items */}
          {outOfStockItems.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Out of stock ({outOfStockItems.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-60">
                {outOfStockItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}