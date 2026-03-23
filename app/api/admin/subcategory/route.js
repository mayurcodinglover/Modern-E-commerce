import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import {includes, success, z} from "zod"

const validateSubCategory=z.object({
    name:z.string().min(1).max(150),
    slug:z.string().min(1).max(150),
    categoryId:z.string().min(1),
});
export async function POST(req)
{
    try {
    const body=await req.json();
    const parsed=validateSubCategory.safeParse(body);
    if(!parsed.success)
    {
        return NextResponse.json({success:false,message:parsed.error.errors},{status:400});
    }
    const {name,slug,categoryId}=parsed.data;

    const category=await prisma.category.findUnique({
        where:{id:categoryId}
    });

    if(!category)
    {
        return NextResponse.json({success:false,message:"Category not found"},{status:404});
    }

    if(!category.isActive)
    {
        return NextResponse.json({success:false,message:"Category is Not Active"},{status:400});
    }
    const slugexist=await prisma.subcategory.findUnique({
        where:{slug}
    });
    if(slugexist)
    {
        return NextResponse.json({success:false,message:"Slug Already Exist"},{status:409})
    }
    const existingName=await prisma.subcategory.findFirst({
        where:{categoryId,name}
    });
    if(existingName)
    {
        return NextResponse.json({success:false,message:"Subcategory name already exist"},{status:409});
    }
    const subCategory=await prisma.subcategory.create({
        data:{categoryId,name,slug},
        include:{category:{select:{id:true,name:true}}},
    });
    return NextResponse.json({success:true,message:"Subcategory created Successfully"},{status:201});
    } catch (error) {
        console.error(error)
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}

export async function GET(req)
{
    try {
        const {searchParams}=new URL(req.url);
    const categoryId=searchParams.get("categoryId");
    const includeInactive=searchParams.get("includeInactive")==="true";
    const search=searchParams.get("search") || "";

    if(!categoryId)
    {
        return NextResponse.json({success:false,message:"Category Id Query param is required"},{status:400});
    }
    const category=await prisma.category.findUnique({
        where:{
            id:categoryId
        }
    });
    if(!category)
    {
        return NextResponse.json({success:false,message:"Category Not Found"},{status:404});
    }
    const subcategories=await prisma.subcategory.findMany({
        where:{
            categoryId,
            ...(includeInactive ? {} : {isActive:true}),
            ...(search && {
                name:{contains:search,mode:"insensitive"},
            }),
        },
        include:{
            category:{select :{id:true,name:true}}
        },
        orderBy:{createdAt:"desc"}
    });

    return NextResponse.json({success:true,data:subcategories,total:subcategories.length,category:{id:category.id,name:category.name}},{status:200});
    
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }


}