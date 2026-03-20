import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import {success, z} from "zod"

const createCategoryValidation=z.object({
    name:z.string().min(1).max(150),
    slug:z.string().min(1).max(150),
    description:z.string().optional(),
    imageUrl:z.string().optional(),
    isActive:z.boolean()
});

export async function POST(req){
    try {
        const body=await req.json();
        const parsed=createCategoryValidation.safeParse(body);

        if(!parsed.success)
        {
            return NextResponse.json({success:false,errors:parsed.error.errors},{status:400})
        }
        const {name,slug,description,imageUrl}=parsed.data;

        const existing=await prisma.category.findFirst({
            where:{OR:[{name},{slug}]}
        });
        if(existing)
        {
            return NextResponse.json({success:false,message:existing.name===name? "Category name is already Exist":"Slug is already Exist"},{status:409});
        }
        const category=await prisma.category.create({
            data:{
                name,
                slug,
                description,
                imageUrl
            }
        });

        return NextResponse.json({success:true,message:"Category Created Successfully",data:category},{status:201});
    } catch (error) {
        console.log(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}

export async function GET(req){
    try {
        const {searchParams}=new URL(req.url);
        const includeInactive=searchParams.get("includeInactive")==="true"
        const search=searchParams.get("search") || "";

        const categories=await prisma.category.findMany({
            where:{
                ...(includeInactive ? {}:{isActive:true}),
                ...(search && {
                    name:{contains:search,mode:"insensitive"},
                }),
            },
            orderBy:{createdAt:"desc"}
        });

        return NextResponse.json({success:true,data:categories},{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}