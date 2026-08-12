import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    const [users, roles] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: { role: true, _count: { select: { orders: true } } },
      }),
      prisma.role.findMany({ orderBy: { name: "asc" } }),
    ]);
    return NextResponse.json({ success: true, data: users, roles });
  } catch (error) {
    console.error("Admin users GET error", error);
    return NextResponse.json({ success: false, message: "Failed to load users" }, { status: 500 });
  }
}
