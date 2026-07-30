import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Routes that require login
const protectedRoutes = [
  "/account",
  "/cart",
  "/checkout",
  "/wishlist",
];

// Routes that require admin role
const adminRoutes = ["/admin"];

// Routes that should redirect to home if already logged in
const authRoutes = ["/login", "/register"];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Get token from cookies (for server-side) or skip
  const token = req.cookies.get("token")?.value;
  const decoded = token ? verifyToken(token) : null;

  // If trying to access admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // If trying to access protected routes without login
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!decoded) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${pathname}`, req.url)
      );
    }
  }

  // If already logged in and trying to access auth pages
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (decoded) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/cart",
    "/checkout",
    "/wishlist",
    "/login",
    "/register",
  ],
};