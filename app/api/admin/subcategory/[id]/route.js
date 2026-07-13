import prisma from "../../../../../lib/prisma";
import { NextResponse } from "next/server";
import {z} from "zod"

const updateValidation=z.object({
    name:z.string().min(1).max(150).optional(),
    slug:z.string().min(1).max(150).optional(),
    categoryId:z.string().min(1).optional(),
    isActive:z.boolean().optional()
});

export async function PUT(req,{params})
{
    try {
        const {id}=await params;
        const body=await req.json();
        const parsed=updateValidation.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({success:false,errors: parsed.error.issues.map(e => e.message)},{status:400});
        }
        const existing=await prisma.subcategory.findUnique({
            where:{id}
        });
        if(!existing)
        {
            return NextResponse.json({success:false,message:"subcategory not found"},{status:404});
        }
        if(parsed.data.categoryId)
        {
            const newCategory=await prisma.category.findUnique({
                where:{id:parsed.data.categoryId}
            });
            if(!newCategory)
            {
                return NextResponse.json({success:false,message:"Category not found"},{status:404});
            }
            if(!newCategory.isActive)
            {
                return NextResponse.json({success:false,message:"category not Active"},{status:400});
            }
        }
        if(parsed.data.slug)
        {
            const slugConflict=await prisma.subcategory.findFirst({
                where:{slug:parsed.data.slug,id:{not:id}}
            });
            if(slugConflict)
            {
                return NextResponse.json({success:false,message:"Slug name already exist"},{status:409});
            }
        }
        if(parsed.data.name)
        {
            const targetCategoryId=parsed.data.categoryId || existing.categoryId;
            const nameConflict=await prisma.subcategory.findFirst({
                where:{
                    name:parsed.data.name,
                    categoryId:targetCategoryId,
                    id:{not:id},
                },
            });
            if(nameConflict)
            {
                return NextResponse.json({success:false,message:"Name already exist"},{status:409});
            }
        }
        const updated=await prisma.subcategory.update({
            where:{id},
            data:parsed.data,
            include:{category:{select:{id:true,name:true}}},
        });
        return NextResponse.json({success:true,message:"subcategory updated successfully",data:updated},{status:200});

    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}
// GET /api/admin/subcategories/[id] — Get single subcategory
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    console.log(id);
    

    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    if (!subcategory) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: subcategory },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/subcategories/[id] — Soft delete
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    const existing = await prisma.subcategory.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found" },
        { status: 404 }
      );
    }

    if (!existing.isActive) {
      return NextResponse.json(
        { success: false, message: "Subcategory is already deactivated" },
        { status: 400 }
      );
    }

    const updated = await prisma.subcategory.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Subcategory deactivated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/subcategories/[id] — Reactivate
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;

    const existing = await prisma.subcategory.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found" },
        { status: 404 }
      );
    }

    if (existing.isActive) {
      return NextResponse.json(
        { success: false, message: "Subcategory is already active" },
        { status: 400 }
      );
    }

    // Check parent category is still active before reactivating
    const parentCategory = await prisma.category.findUnique({
      where: { id: existing.categoryId },
    });

    if (!parentCategory.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot reactivate — parent category is inactive. Reactivate the category first.",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.subcategory.update({
      where: { id },
      data: { isActive: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Subcategory reactivated successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
