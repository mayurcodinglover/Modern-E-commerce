import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/verify-email?status=invalid", req.url)
      );
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/verify-email?status=invalid", req.url)
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL("/verify-email?status=already-verified", req.url)
      );
    }

    // Check token expiry
    if (
      user.emailVerificationExpiresAt &&
      new Date() > new Date(user.emailVerificationExpiresAt)
    ) {
      return NextResponse.redirect(
        new URL("/verify-email?status=expired", req.url)
      );
    }

    // Mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });

    return NextResponse.redirect(
      new URL("/verify-email?status=success", req.url)
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.redirect(
      new URL("/verify-email?status=error", req.url)
    );
  }
}