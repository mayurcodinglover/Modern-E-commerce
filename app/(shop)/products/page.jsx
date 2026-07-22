"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { useSelector } from "react-redux";

function ProductSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}
export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

    const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") || "all"
  );
  const [sortBy, setSortBy] = useState("newest");

    const limit = 12;

     const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryId && categoryId !== "all") params.set("categoryId", categoryId);
      params.set("page", page);
      params.set("limit", limit);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryId, page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/category");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  function clearFilters() {
    setSearch("");
    setCategoryId("all");
    setSortBy("newest");
    setPage(1);
  }

    const hasActiveFilters =
    search || (categoryId && categoryId !== "all");

  const totalPages = Math.ceil(total / limit);

   return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">All products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? "Loading..." : `${total} products found`}
          </p>
        </div>
      </div>
       {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex gap-2 flex-1 max-w-sm"
        >
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {/* Category filter */}
          <Select
            value={categoryId}
            onValueChange={(val) => {
              setCategoryId(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price_asc">Price: Low to high</SelectItem>
              <SelectItem value="price_desc">Price: High to low</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          : products.length > 0
          ? products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                userId={user?.id}
              />
            ))
          : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground text-lg">
                No products found.
              </p>
              <Button
                variant="link"
                onClick={clearFilters}
                className="mt-2"
              >
                Clear filters
              </Button>
            </div>
          )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}