"use client";
import { useState } from "react";
import { AdminSidebar, AdminSidebarMobile } from "@/components/layout/adminSidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

   return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <AdminSidebar />

        <AdminSidebarMobile
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
       {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
   );
}