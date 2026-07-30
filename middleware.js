import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/account", "/cart", "/checkout", "/wishlist"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const decoded = token ? await verifyToken(token) : null;

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!decoded) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !decoded) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));
  }

  if (authRoutes.some((route) => pathname.startsWith(route)) && decoded) {
    return NextResponse.redirect(new URL("/", req.url));
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
