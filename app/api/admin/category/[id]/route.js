import {NextResponse} from "next/server";
import prisma from "../../../../../lib/prisma";
import {success, z} from "zod";
import { parse } from "path";

const updateCategorySchema=z.object({
    name:z.string().min(1).max(150).optional(),
    slug:z.string().min(1).max(150),
    description:z.string().optional(),
    imageUrl:z.string().optional(),
    isActive:z.boolean().optional()
});

export async function GET(req,{params}){
    try {
        const {id}=await params;
        const category=await prisma.category.findUnique({
            where:{id},
            include:{
                subcategories:{
                    where:{isActive:true},
                    orderBy:{name:"asc"},
                },
                _count:{
                    select:{subcategories:true}
                }
            }
        });
        if(!category)
        {
            return NextResponse.json({success:false,message:"Category Not found"},{status:404})
        }
        return NextResponse.json({success:true,data:category},{status:200});
    } catch (error) {
        console.error(error)
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}

export async function PUT(req,{params}){
    try {
        const {id}=await params;
        const body=await req.json();
        const parsed=updateCategorySchema.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({success:false,errors: parsed.error.issues.map(e => e.message)},{status:400});
        }
        const existing=await prisma.category.findUnique({
            where:{id}
        });
        if(!existing)
        {
            return NextResponse.json({success:false,message:"Category not found"},{status:404});
        }
       let conflict=null;
       if(parsed.data.name)
       {
        conflict=await prisma.category.findFirst({
            where:{
                id:{not:id},
                name:parsed.data.name
            },
        });
       }
       if(!conflict && parsed.data.slug)
       {
        conflict=await prisma.category.findFirst({
            where:{
                id:{not:id},
                slug:parsed.data.slug
            },
        });
       }
       if(conflict)
       {
            return NextResponse.json({success:false,message:"Name or slug already Exist "},{status:409});
       }
       const updated=await prisma.category.update({
        where:{id},
        data:parsed.data,
       });

       return NextResponse.json({success:true,message:"Category Updated Successfully",data:updated},{status:200});
    } catch (error) {
        console.error("Internal server Error",error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}

export async function PATCH(req,{params})   
{
    try {
        const {id}=await params;
    const existing=await prisma.category.findFirst({
        where:{id}
    });
    if(!existing)
    {
        return NextResponse.json({success:false,message:"Categories not found"},{status:404});
    }
    if(existing.isActive)
    {
        return NextResponse.json({success:false,message:"Category is already Active"},{status:400});
    }
    await prisma.$transaction([
      prisma.subcategory.updateMany({
        where: { categoryId: id },
        data: { isActive: true },
      }),
      prisma.category.update({
        where: { id },
        data: { isActive: true },
      }),
    ]);
    const updated=await prisma.category.findUnique({
        where:{id},
        include:{
            subcategories:{orderBy:{name:"asc"}},
            _count:{select:{subcategories:true}},
        }
    });
    return NextResponse.json({success:true,message:"Categories and it's Subcategory reActivated successfully",data:updated},{status:200});
    } catch (error) {
        console.error(error)
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}

export async function DELETE(req,{params})
{
        try {
            const {id}=await params;
        const exist=await prisma.category.findFirst({
            where:{id}
        });
        if(!exist)
        {
            return NextResponse.json({success:false,message:"Category not found"},{status:404});
        }
        if(!exist.isActive)
        {
            return NextResponse.json({success:false,message:"Category Already Deactivated"},{status:400});
        }
        await prisma.$transaction([
            prisma.subcategory.updateMany({
                where:{categoryId:id},
                data:{isActive:false},
            }),
            prisma.category.update({
            where:{id},
                data:{
                    isActive:false
                },
        }),
        ]);
        return NextResponse.json({success:true,message:"Category Deactivated Successfully"},{status:200});
        } catch (error) {
            console.log(error);
            return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
        }
}

