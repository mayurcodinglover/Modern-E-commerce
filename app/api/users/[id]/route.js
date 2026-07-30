import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { z } from "zod";

const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100)
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100)
    .optional(),
  email: z.string().email("Invalid email").optional(),
  profileImageUrl: z.string().url().optional().nullable(),
});

// GET /api/users/[id] — Get user profile
export async function GET(req, { params }) {
  try {
    const auth = await authenticate(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status }
      );
    }

    const { id } = await params;

    // Users can only fetch their own profile
    if (auth.user.id !== id && auth.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: { select: { name: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { passwordHash, emailVerificationToken, ...safeUser } = user;

    return NextResponse.json(
      { success: true, data: safeUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] — Update user profile
export async function PUT(req, { params }) {
  try {
    const auth = await authenticate(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status }
      );
    }

    const { id } = await params;

    // Users can only update their own profile
    if (auth.user.id !== id && auth.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.errors },
        { status: 400 }
      );
    }

    // Check user exists
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check email conflict with other users
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const emailConflict = await prisma.user.findFirst({
        where: {
          email: parsed.data.email,
          id: { not: id },
        },
      });

      if (emailConflict) {
        return NextResponse.json(
          { success: false, message: "Email already in use by another account" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      include: { role: { select: { name: true } } },
    });

    const { passwordHash, emailVerificationToken, ...safeUser } = updated;

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: safeUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}