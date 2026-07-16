"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  Tag,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-background border rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {sub && (
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/category?includeInactive=true"),
      ]);

      const productsData = await productsRes.json();
      console.log(productsData);
      
      const categoriesData = await categoriesRes.json();

      setStats({
        products: productsData?.total || 0,
        categories: categoriesData.total || 0,
        orders: 0,
        users: 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Welcome back!</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here's what's happening in your store today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total products"
          value={isLoading ? "..." : stats.products}
          icon={Package}
          color="bg-blue-100 text-blue-600"
          sub="Active catalog"
        />
        <StatCard
          label="Categories"
          value={isLoading ? "..." : stats.categories}
          icon={Tag}
          color="bg-purple-100 text-purple-600"
          sub="All categories"
        />
        <StatCard
          label="Total orders"
          value={isLoading ? "..." : stats.orders}
          icon={ClipboardList}
          color="bg-green-100 text-green-600"
          sub="All time"
        />
        <StatCard
          label="Customers"
          value={isLoading ? "..." : stats.users}
          icon={Users}
          color="bg-orange-100 text-orange-600"
          sub="Registered users"
        />
      </div>

      <Separator />

      {/* Quick links */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Quick actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Add product", href: "/admin/products", icon: Package },
            { label: "Add category", href: "/admin/categories", icon: Tag },
            { label: "View orders", href: "/admin/orders", icon: ShoppingCart },
            { label: "Manage coupons", href: "/admin/coupon", icon: TrendingUp },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary transition-colors"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{action.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}