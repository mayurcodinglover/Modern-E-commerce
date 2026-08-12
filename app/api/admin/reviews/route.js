import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        product: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Admin reviews GET error", error);
    return NextResponse.json({ success: false, message: "Failed to load reviews" }, { status: 500 });
  }
}
