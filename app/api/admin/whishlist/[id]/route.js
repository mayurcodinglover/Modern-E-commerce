import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function DELETE(req,{params})
{
    try {
        const {id}=await params;
        const existing=await prisma.whishlist.findUnique({where:{id}});
        if(!existing)
        {
            return NextResponse.json({error:"Whishlist item not found"},{status:404});
        }
        await prisma.whishlist.delete({where:{id}});
        return NextResponse.json({success:true,message:"Product removed from whishlist"},{status:200});
    } catch (error) {
        console.error("Error removing from whishlist:",error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}