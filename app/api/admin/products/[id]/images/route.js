import {z} from "zod";
import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { promises as fs } from "fs";
import path from "path";

const validateImageSchema=z.object({
    altText:z.string().max(255).optional().nullable(),
    isPrimary:z.boolean().default(false),
    displayOrder:z.number().int().min(0).default(0),
})

export async function POST(req, { params }) {
  try {
    const { id } = await params;

    const formData = await req.formData();

    const file = formData.get("file");
    let imageUrl = formData.get("imageUrl");

    // User must either upload a file OR provide a URL
    if (!file && !imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload an image or provide an image URL",
        },
        { status: 400 }
      );
    }

    const body = {
      altText: formData.get("altText"),
      isPrimary: formData.get("isPrimary") === "true",
      displayOrder: formData.get("displayOrder")
        ? Number(formData.get("displayOrder"))
        : 0,
    };

    const parsed = validateImageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parsed.error.issues.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const { altText, isPrimary, displayOrder } = parsed.data;

    // Check product
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    // Upload file only if user selected one
    if (file) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      const extension = path.extname(file.name);

      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}${extension}`;

      const filePath = path.join(uploadDir, fileName);

      const bytes = await file.arrayBuffer();

      const buffer = Buffer.from(bytes);

      await fs.writeFile(filePath, buffer);

      // Save generated URL
      imageUrl = `/uploads/${fileName}`;
    }

    // Remove previous primary image
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: {
          productId: id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // First image automatically becomes primary
    const imageCount = await prisma.productImage.count({
      where: {
        productId: id,
      },
    });

    const shouldBePrimary = isPrimary || imageCount === 0;

    const productImage = await prisma.productImage.create({
      data: {
        productId: id,
        imageUrl,
        altText,
        displayOrder,
        isPrimary: shouldBePrimary,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: productImage,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error adding product image:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req,{params})
{
    try {
        const {id}=await params;
        const product=await prisma.product.findUnique({where:{id}});
        if(!product)
        {
            return NextResponse.json({success:"false",error:'Product not found'},{status:404});
        }
        const images=await prisma.productImage.findMany({where:{productId:id},orderBy:{displayOrder:'asc'}});
        return NextResponse.json({success:"true",data:images},{status:200});
    } catch (error) {
        console.error("Error fetching product images:", error);
        return NextResponse.json({success:"false",error:'Internal server error'},{status:500});
    }
}