"use client"
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/config/admin-nav";

function getPageTitle(pathname) {
  for (const section of adminNavItems) {
    for (const item of section.items) {
      if (item.href === "/admin" && pathname === "/admin") return "Dashboard";
      if (item.href !== "/admin" && pathname.startsWith(item.href)) {
        return item.label;
      }
    }
  }
  return "Admin";
}

export function AdminTopbar({ onMenuClick }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
    return (
    <header className="h-14 border-b bg-background flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

       {/* Page title */}
      <h1 className="font-semibold text-base">{pageTitle}</h1>

       {/* Spacer */}
      <div className="flex-1" />

         {/* Search */}
      <div className="hidden md:flex items-center relative w-64">
        <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9 h-8 text-sm"
        />
      </div>

        {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </Button>
        {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium cursor-pointer">
        A
      </div>
    </header>
    );
}