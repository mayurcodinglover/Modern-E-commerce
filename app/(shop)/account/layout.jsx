"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { clearCart } from "../../store/slices/cartSlice";
import { setWishlist } from "../../store/slices/wishlistSlice";
import { cn } from "@/lib/utils";
import { clearAuthCookie } from "@/lib/logout";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const accountNavItems = [
  {
    label: "Profile",
    href: "/account",
    icon: User,
  },
  {
    label: "My orders",
    href: "/account/orders",
    icon: ShoppingBag,
  },
  {
    label: "My addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: Heart,
  },
];

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearAuthCookie();
    dispatch(logout());
    dispatch(clearCart());
    dispatch(setWishlist([]));
    toast.success("Logged out successfully");
    router.push("/");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-background border rounded-xl overflow-hidden sticky top-20">

            {/* User info */}
            <div className="p-5 border-b bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-semibold">
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <nav className="p-2">
              {accountNavItems.map((item) => {
            {/* Nav links */}
                const Icon = item.icon;
                const isActive =
                  item.href === "/account"
                    ? pathname === "/account"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  </Link>
                );
              })}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors mt-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
