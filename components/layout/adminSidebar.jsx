"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/config/admin-nav";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function SidebarContent({ onClose }) {
  const pathname = usePathname();
  function isActive(href) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }
   return (
    <div className="flex flex-col h-full min-h-0">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-base">ShopAdmin</span>
          </Link>
           {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        </div>
         <ScrollArea className="flex-1 px-3 py-4 min-h-0">
        <div className="space-y-6">
          {adminNavItems.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom user section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">
              admin@shop.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );    
}
export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-background h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}
export function AdminSidebarMobile({ open, onClose }) {
  if (!open) return null;
   return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-64 bg-background border-r z-50 lg:hidden">
        <SidebarContent onClose={onClose} />
      </div>
    </>
  );
}
