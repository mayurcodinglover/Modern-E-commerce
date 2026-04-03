import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { title } from "process";
import { z } from "zod";
import { ca } from "zod/v4/locales";

const createProductValidation=z.object({
    name:z.string().min(1).max(150),
    title:z.string().min(1).max(255),
    description:z.string().min(1),
    categoryId:z.string().min(1,"Category is required"),
    subcategoryId:z.string().optional().nullable(),
    basePrice:z.number().positive("Base price must be a positive number"),
    discountedPrice:z.number().positive("Discounted price must be a positive number").optional().nullable(),
});

export async function POST(req){
    try {
        const body=await req.json();
        const parsedData=createProductValidation.safeParse(body);
        if(!parsedData.success){
            return NextResponse.json({error:"Invalid input",errors:parsedData.error.errors},{status:400});
        }
        const {name,title,description,categoryId,subcategoryId,basePrice,discountedPrice}=parsedData.data;
        const category=await prisma.category.findUnique({where:{id:categoryId}});
        if(!category)
        {
            return NextResponse.json({error:"category not found"},{status:404});
        }
        if(!category.isActive)
        {
            return NextResponse.json({error:"Category is inactive"},{status:400});
        }
        let subCategory=await prisma.subcategory.findUnique({where:{id:subcategoryId}});
        if(!subCategory)
        {
            return NextResponse.json({error:"Subcategory not found"},{status:404});
        }
        if(!subCategory.isActive)
        {
            return NextResponse.json({error:"Subcategory is inactive"},{status:400});
        }
        if(subCategory.categoryId!==categoryId)
        {
            return NextResponse.json({error:"Subcategory does not belong to the specified category"},{status:400});
        }
        const product=await prisma.product.create({
            data:{
                name,
                title:title ?? null,
                description:description ?? null,
                basePrice,
                discountPrice:discountedPrice ?? null,
                categoryId,
                subcategoryId:subcategoryId ?? null,
            },
            include:{
                category:{select:{id:true,name:true}},
                subcategory:{select:{id:true,name:true}},
            }
        });
        return NextResponse.json({message:"Product created Successfully",product},{status:201});
    } catch (error) {
        console.error("Error creating product:",error);
        return NextResponse.json({error:"Failed to create product"},{status:500});
    }
}
export async function GET(req){
    try {
        const {searchParams}=new URL(req.url);

        const categoryId=searchParams.get("categoryId") || "";
        const subcategoryId=searchParams.get("subcategoryId") || "";
        const includeInactive=searchParams.get("includeInactive")==="true";

        const where={
            ...(includeInactive?{}:{isActive:true}),
            ...(categoryId?{categoryId}:{}),
            ...(subcategoryId?{subcategoryId}:{})
        };

        const products=await prisma.product.findMany({
            where,
            include:{
                category:{select:{id:true,name:true}},
                subcategory:{select:{id:true,name:true}},
                images:{where:{isPrimary:true},take:1},
                _count:{
                    select:{variants:true,images:true}
                },
            },
            orderBy:{createdAt:"desc"},
        });
        const total=await prisma.product.count({where});
        return NextResponse.json({products,total},{status:200});
    } catch (error) {
        console.error("Error fetching products:",error);
        return NextResponse.json({error:"Failed to fetch products"},{status:500});
    }
}