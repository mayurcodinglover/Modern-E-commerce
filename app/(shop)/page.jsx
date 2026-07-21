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
    <div className="border rounded-xl overflow-hidden">
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
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/30 py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full mb-4">
              New collection available
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
              Discover Your
              <br />
              <span className="text-primary">Perfect Style</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Shop the latest trends with unbeatable prices. Free shipping on orders above ₹499.
            </p>
            <div className="flex gap-3 justify-center md:justify-start flex-wrap">
              <Link href="/products">
                <Button size="lg">
                  Shop now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/products?sale=true">
                <Button size="lg" variant="outline">
                  View sale
                </Button>
              </Link>
            </div>
          </div>

           {/* Hero image placeholder */}
          <div className="flex-1 flex justify-center">
            <div className="w-80 h-80 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-24 w-24 text-primary/30" />
            </div>
          </div>
        </div>
      </section>

       {/* Features bar */}
      <section className="border-y bg-secondary/30 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">
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
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Shop by category</h2>
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
                  <div className="border rounded-xl p-4 text-center hover:border-primary hover:bg-primary/5 transition-all">
                    <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-2 overflow-hidden">
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
                    <p className="text-xs font-medium group-hover:text-primary transition-colors">
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
      <section className="py-12 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Featured products</h2>
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