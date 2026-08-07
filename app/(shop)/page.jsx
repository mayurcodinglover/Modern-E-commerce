"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ShoppingBag, Truck, Shield, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";

function ProductSkeleton() {
  return (
    <div className="border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData(){
     try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products?limit=8"),
        fetch("/api/admin/category"),
      ]);
       const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

        if (productsData.success) setFeaturedProducts(productsData.data);
      if (categoriesData.success) setCategories(categoriesData.data);
    }
    catch(error){

 console.error("Failed to fetch", error);
    } finally {
      setIsLoading(false);
    }
  }

   const features = [
    {
      icon: Truck,
      title: "Free shipping",
      desc: "On orders above ₹499",
    },
    {
      icon: Shield,
      title: "Secure payment",
      desc: "100% secure transactions",
    },
    {
      icon: RefreshCw,
      title: "Easy returns",
      desc: "7 day return policy",
    },
    {
      icon: ShoppingBag,
      title: "Quality products",
      desc: "Curated with care",
    },
  ];

   return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#14213d] px-4 py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('/hero-editorial.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14213d] via-[#14213d]/80 to-[#14213d]/15" />
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-[1fr_auto] items-stretch gap-8">
          <div className="flex-1 text-center md:text-left">
            <span className="eyebrow inline-block text-[#c7ddd6] border-b border-[#c7ddd6]/60 pb-2 mb-6">
              Collection 01 — new season
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium leading-[.88] tracking-[-0.065em] mb-7 text-white">
              Discover your
              <br />
              <span className="italic text-[#f4f7f6]">perfect style.</span>
            </h1>
            <p className="text-white/75 text-base md:text-lg mb-9 max-w-md leading-relaxed">
              Shop the latest trends with unbeatable prices. Free shipping on orders above ₹499.
            </p>
            <div className="flex gap-3 justify-center md:justify-start flex-wrap">
              <Link href="/products">
                <Button size="lg" className="rounded-md bg-[#0d7c70] px-6 text-white hover:bg-[#09645b]">
                  Shop now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/products?sale=true">
                <Button size="lg" variant="outline" className="rounded-md border-white/50 bg-transparent text-white hover:bg-white hover:text-[#14213d]">
                  View sale
                </Button>
              </Link>
            </div>
          </div>

           {/* Hero image placeholder */}
          <div className="hidden md:flex self-stretch items-end border-l border-white/30 pl-4">
            <span className="edition-rail text-white/80">Atelier / Edited for now</span>
          </div>
        </div>
      </section>

       {/* Features bar */}
      <section className="border-y border-[#14213d]/15 bg-[#dde5e2]/55 py-5 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 border border-[#14213d]/15 bg-white flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="font-utility text-[10px] text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div><p className="eyebrow text-[#0d7c70] mb-2">Browse the edit</p><h2 className="text-3xl md:text-4xl font-medium">Shop by category</h2></div>
              <Link href="/products">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?categoryId=${cat.id}`}
                  className="group"
                >
                  <div className="border border-[#14213d]/15 p-4 text-center bg-card hover:bg-[#14213d] hover:text-white transition-colors duration-300">
                    <div className="w-14 h-14 rounded-full bg-secondary mx-auto mb-3 overflow-hidden ring-1 ring-[#14213d]/10">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <p className="eyebrow group-hover:text-white transition-colors">
                      {cat.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

       {/* Featured products */}
      <section className="py-16 px-4 bg-[#dde5e2]/50 border-y border-[#14213d]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div><p className="eyebrow text-[#0d7c70] mb-2">The latest edit</p><h2 className="text-3xl md:text-4xl font-medium">Featured products</h2></div>
            <Link href="/products">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              : featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    userId={user?.id}
                  />
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}
