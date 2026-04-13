import prisma from "../../../../../lib/prisma";
import { NextResponse } from "next/server";
import {includes, z} from "zod"

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