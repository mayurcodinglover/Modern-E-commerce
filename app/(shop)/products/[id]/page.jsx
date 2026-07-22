"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../../../store/slices/cartSlice.js";  
import { addToWishlistLocally, removeFromWishlistLocally } from "../../../store/slices/wishlistSlice.js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Heart,
  Package,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);

  const isInWishlist = wishlistItems.some(
    (item) => item.productId === id
  );

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

   async function fetchProduct() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.success) setProduct(data.data);
    } catch {
      toast.error("Failed to load product");
    } finally {
      setIsLoading(false);
    }
  }
    async function fetchReviews() {
    try {
      const res = await fetch(`/api/reviews?productId=${id}`);
      const data = await res.json();
      if (data.success) setReviews(data.data);
    } catch {
      console.error("Failed to fetch reviews");
    }
  }
   const sizes = product
    ? [...new Map(
        product.variants
          ?.filter((v) => v.size)
          .map((v) => [v.size.id, v.size])
      ).values()]
    : [];

    const colors = product
    ? [...new Map(
        product.variants
          ?.filter((v) => v.color)
          .map((v) => [v.color.id, v.color])
      ).values()]
    : [];

    // Find matching variant for selected size + color
  const selectedVariant = product?.variants?.find((v) => {
    const sizeMatch = !sizes.length || !selectedSize || v.size?.id === selectedSize;
    const colorMatch = !colors.length || !selectedColor || v.color?.id === selectedColor;
    return sizeMatch && colorMatch;
  });

  const finalPrice = product
    ? Number(product.discountPrice ?? product.basePrice) +
      Number(selectedVariant?.extraPrice ?? 0)
    : 0;

  const discountPercent = product?.discountPrice
    ? Math.round(
        ((Number(product.basePrice) - Number(product.discountPrice)) /
          Number(product.basePrice)) *
          100
      )
    : 0;

     async function handleAddToCart() {
    if (!user) {
      toast.error("Please login to add to cart");
      return;
    }
    if (!selectedVariant) {
      toast.error("Please select size and color");
      return;
    }
    if (selectedVariant.stockQuantity < quantity) {
      toast.error(`Only ${selectedVariant.stockQuantity} items available`);
      return;
    }

    try {
      setAddingToCart(true);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          productVariantId: selectedVariant.id,
          quantity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Added to cart");
        // Refresh cart count
        const cartRes = await fetch(`/api/cart?userId=${user.id}`);
        const cartData = await cartRes.json();
        if (cartData.success) dispatch(setCart(cartData));
      } else {
        toast.error(data.message || "Failed to add to cart");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleWishlist() {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }
    if (isInWishlist) {
      const item = wishlistItems.find((i) => i.productId === id);
      const res = await fetch(`/api/wishlist/${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        dispatch(removeFromWishlistLocally(item.id));
        toast.success("Removed from wishlist");
      }
    } else {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productId: id }),
      });
      const data = await res.json();
      if (data.success) {
        dispatch(
          addToWishlistLocally({ id: data.data.id, productId: id })
        );
        toast.success("Added to wishlist");
      }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-lg">Product not found</p>
        <Link href="/products">
          <Button variant="link" className="mt-2">
            Back to products
          </Button>
        </Link>
      </div>
    );
  }

  const images = product.images || [];
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;


     return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">

        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]?.imageUrl}
                alt={images[selectedImage]?.altText || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-20 w-20 text-muted-foreground/30" />
              </div>
            )}

            {/* Image nav buttons */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
                  onClick={() =>
                    setSelectedImage((i) =>
                      i === 0 ? images.length - 1 : i - 1
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
                  onClick={() =>
                    setSelectedImage((i) =>
                      i === images.length - 1 ? 0 : i + 1
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === i
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.altText || `Image ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-5">

          {/* Name + Category */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {product.category?.name}
              {product.subcategory && ` › ${product.subcategory.name}`}
            </p>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            {product.title && (
              <p className="text-muted-foreground mt-1">{product.title}</p>
            )}
          </div>

          {/* Rating */}
          {avgRating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(Number(avgRating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{avgRating}</span>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold">
              ₹{finalPrice.toFixed(0)}
            </span>
            {product.discountPrice && (
              <span className="text-lg text-muted-foreground line-through">
                ₹{Number(product.basePrice).toFixed(0)}
              </span>
            )}
            {discountPercent > 0 && (
              <Badge className="bg-red-500 text-white">
                -{discountPercent}% off
              </Badge>
            )}
          </div>

          <Separator />

          {/* Size selector */}
          {sizes.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Size:{" "}
                <span className="text-muted-foreground font-normal">
                  {selectedSize
                    ? sizes.find((s) => s.id === selectedSize)?.name
                    : "Select"}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all ${
                      selectedSize === size.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {colors.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Color:{" "}
                <span className="text-muted-foreground font-normal">
                  {selectedColor
                    ? colors.find((c) => c.id === selectedColor)?.name
                    : "Select"}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    title={color.name}
                    className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.id
                        ? "border-primary scale-110"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                    style={{
                      backgroundColor: color.hexCode || "#e5e7eb",
                    }}
                  >
                    {selectedColor === color.id && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock info */}
          {selectedVariant && (
            <p
              className={`text-sm ${
                selectedVariant.stockQuantity > 0
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {selectedVariant.stockQuantity > 0
                ? `${selectedVariant.stockQuantity} in stock`
                : "Out of stock"}
            </p>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium">Quantity:</p>
            <div className="flex items-center border rounded-md">
              <button
                className="px-3 py-2 hover:bg-secondary transition-colors"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                className="px-3 py-2 hover:bg-secondary transition-colors"
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(
                      selectedVariant?.stockQuantity || 99,
                      q + 1
                    )
                  )
                }
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleAddToCart}
              disabled={
                addingToCart ||
                !selectedVariant ||
                selectedVariant.stockQuantity === 0
              }
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {addingToCart ? "Adding..." : "Add to cart"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleWishlist}
              className={isInWishlist ? "text-red-500 border-red-300" : ""}
            >
              <Heart
                className="h-4 w-4"
                fill={isInWishlist ? "currentColor" : "none"}
              />
            </Button>
          </div>

          {/* Description */}
          {product.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reviews section */}
      {reviews.length > 0 && (
        <div className="mt-16">
          <Separator className="mb-8" />
          <h2 className="text-xl font-semibold mb-6">
            Customer reviews ({reviews.length})
          </h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {review.user?.firstName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {review.user?.firstName} {review.user?.lastName}
                      </p>
                      {review.isVerified && (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-600 border-green-300"
                        >
                          Verified purchase
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.title && (
                  <p className="text-sm font-medium mb-1">{review.title}</p>
                )}
                {review.body && (
                  <p className="text-sm text-muted-foreground">
                    {review.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}