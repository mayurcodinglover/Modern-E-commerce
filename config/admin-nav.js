import {
  LayoutDashboard,
  Tag,
  Tags,
  Package,
  Ruler,
  Palette,
  ShoppingCart,
  ClipboardList,
  Ticket,
  Users,
  Star,
  BarChart3,
} from "lucide-react";

export const adminNavItems = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Tag,
      },
      {
        label: "Subcategories",
        href: "/admin/subcategories",
        icon: Tags,
      },
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
      },
      {
        label: "Sizes",
        href: "/admin/sizes",
        icon: Ruler,
      },
      {
        label: "Colors",
        href: "/admin/colors",
        icon: Palette,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ClipboardList,
      },
      {
        label: "Coupons",
        href: "/admin/coupon",
        icon: Ticket,
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: Star,
      },
    ],
  },
];
