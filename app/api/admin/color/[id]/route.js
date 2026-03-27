import prisma from "../../../../../lib/prisma";
import { NextResponse } from "next/server";
import {success, z} from "zod";

const updateColorValidation=z.object({
    name:z.string().min(1).max(50).optional(),
    hexCode:z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/,{
        message:"Invalid Hexa code Ex #ffffff"
    }).optional().nullable()
});

export async function GET(req,{params})
{
    try {
        const {id}=await params;
        const exist=await prisma.color.findFirst({
            where:{id}
        });
        if(!exist)
        {
            return NextResponse.json({success:false,message:"Color not exist."},{status:404});
        }
        return NextResponse.json({success:true,data:exist},{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status500});
    }
}

export async function PUT(req,{params})
{
    try {
        const {id}=await params;
        const body=await req.json();
        const parsed=updateColorValidation.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({success:false,errors:parsed.error.errors},{status:400});
        }
        const exist=await prisma.color.findFirst({where:{id}});
        if(!exist)
        {
            return NextResponse.json({success:false,message:"Color not exist"},{status:404});
        }
        const nameExist=await prisma.color.findFirst({
            where:{
                name:parsed.data.name,
                id:{not:id}
            }
        });
        if(nameExist)
        {
            return NextResponse.json({success:false,message:"Name Already Exist"},{status:409});
        }
        const updateColor=await prisma.color.update({
            where:{id},
            data:{
                name:parsed.data.name,
                hexCode:parsed.data.hexCode
            }
        });
        return NextResponse.json({success:true,message:"color Updated successfully"},{status:200});
    } catch (error) {
         console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status500});
    }
}

export async function DELETE(req,{params})
{
    try {
        const {id}=await params;
        const exist=await prisma.color.findFirst({
            where:{id}
        });
        if(!exist)
        {
            return NextResponse.json({success:false,message:"Color not found"},{status:404});
        }
        const deletecolor=await prisma.color.delete({
            where:{id}
        });

        return NextResponse.json({success:true,message:"Color Deleted Successfully"},{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}