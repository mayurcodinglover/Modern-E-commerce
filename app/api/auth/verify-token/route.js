import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import prisma from "../../../../lib/prisma";

// GET /api/auth/verify-token
export async function GET(req) {
  try {
    const auth = await authenticate(req);

    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: auth.status }
      );
    }

    // Fetch fresh user from DB to make sure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      include: { role: { select: { name: true } } },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "User not found or deactivated" },
        { status: 401 }
      );
    }

    const { passwordHash, emailVerificationToken, ...safeUser } = user;

    return NextResponse.json(
      { success: true, data: { user: safeUser } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify token error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}