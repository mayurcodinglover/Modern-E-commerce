import { SourceCode } from "eslint";
import prisma from "../../../../../lib/prisma";
import { NextResponse } from "next/server";
import { success, z } from "zod";

const updateSizeValidation=z.object({
    name:z.string().min(1).max(150)
});

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