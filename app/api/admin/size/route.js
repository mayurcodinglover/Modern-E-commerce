import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSizeValidation=z.object({
    name:z.string().min(1).max(150)
});
export async function POST(req)
{
    try {
        const body=await req.json();
        const parsedData=createSizeValidation.safeParse(body);
        if(!parsedData.success)
        {
            return NextResponse.json({success:false,errors:parsedData.error.errors},{status:400});
        }
        const exist=await prisma.size.findFirst({
            where:{name:parsedData.data.name}
        });
        if(exist)
        {
            return NextResponse.json({success:false,message:"Size Name Already Exist"},{status:409});
        }
        const categoryCreate=await prisma.size.create({
            data:{
                name:parsedData.data.name
            }
        });
        return NextResponse.json({success:true,message:"Size Created Successfully",data:categoryCreate},{status:201});
        
    } catch (error) {
        console.error(error);
        return NextResponse.json({status:false,message:"Internal server Error"});
    }
}

export async function GET(req)
{
    try {
        const sizes=await prisma.size.findMany({});
        return NextResponse.json({success:true,data:sizes});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500})
    }
}