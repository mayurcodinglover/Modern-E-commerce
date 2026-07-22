import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        images: { orderBy: { displayOrder: "asc" } },
        variants: {
          where: { isActive: true },
          include: {
            size: { select: { id: true, name: true } },
            color: { select: { id: true, name: true, hexCode: true } },
          },
        },
        _count: { select: { reviews: true } },
      },
    });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }
    const finalPrice = product.discountPrice ?? product.basePrice;

    return NextResponse.json(
      { success: true, data: { ...product, finalPrice } },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
