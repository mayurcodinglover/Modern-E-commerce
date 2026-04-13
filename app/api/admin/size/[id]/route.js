import { SourceCode } from "eslint";
import prisma from "../../../../../lib/prisma";
import { NextResponse } from "next/server";
import { success, z } from "zod";

const updateSizeValidation=z.object({
    name:z.string().min(1).max(150)
});
export async function PUT(req,{params})
{
    try {
        const {id}=await params;
        const body=await req.json();
        const parsed=updateSizeValidation.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({success:false,errors: parsed.error.issues.map(e => e.message)},{status:400});
        }
        const exist=await prisma.size.findFirst({
            where:{id}
        });
        if(!exist)
        {
            return NextResponse.json({success:false,message:"Size does not exist"},{status:404});
        }

        const nameConflict=await prisma.size.findFirst({
            where:{name:parsed.data.name,id:{not:id}}
        })
        if(nameConflict)
        {
            return NextResponse.json({success:false,message:"Size Name Already Exist"},{status:409});
        }
        const updateSize=await prisma.size.update({
            where:{id},
            data:{
                name:parsed.data.name
            }
        });
        return NextResponse.json({success:true,message:"Size updated Successfully"},{status:200});
    } catch (error) {
        console.error("Internal server Error",error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}

export async function GET(req,{params})
{
    const {id}=await params;
    try {
        const exist=await prisma.size.findFirst({
            where:{id}
        });
        if(!exist)
        {
            return NextResponse.json({success:false,message:"Size not found"},{status:404});
        }
        return NextResponse.json({success:true,data:exist},{status:201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}

export async function DELETE(req,{params})
{
    const {id}=await params;
    try {
        const exist=await prisma.size.findFirst({
            where:{id}
        });
         if(!exist)
        {
            return NextResponse.json({success:false,message:"Size not found"},{status:404});
        }
        await prisma.size.delete({
            where:{id}
        });
        return NextResponse.json({success:true,message:"Size Deleted Successfully"},{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}
