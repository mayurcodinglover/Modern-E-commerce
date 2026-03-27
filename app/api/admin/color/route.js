import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import {success, z} from "zod"

const createColorValidation=z.object({
    name:z.string().min(1).max(50),
    hexCode:z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/,{
        message:"Invalid hex code Example:#FF0000"
    }).optional().nullable(),
});


export async function POST(req){
    try {
        const body=await req.json();
        const parsed=createColorValidation.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({success:false,errors:parsed.error.errors},{status:400});
        }
         const existing = await prisma.color.findFirst({
      where: { name: parsed.data.name },
    });
        if(existing)
        {
            return NextResponse.json({success:false,message:"Color name already exist"},{status:409});
        }
        const colorcreate=await prisma.color.create({
            data:{
                name:parsed.data.name,
                hexCode:parsed.data.hexCode ?? null
            }
        });
        return NextResponse.json({success:true,message:"Color Added Successfully"},{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}

export async function GET(req){
    try {
        const colors=await prisma.color.findMany({});
        return NextResponse.json({success:true,data:colors},{status:200});
    } catch (error) {
        console.error(error)
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}