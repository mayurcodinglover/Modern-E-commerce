import {NextResponse} from "next/server";
import prisma from "../../../lib/prisma";

export async function DELETE(req,{params})
{
    try {
        const {id}=await params;
        const review=await prisma.review.findUnique({where:{id}})  ;
        if(!review)
        {
             return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
        }
         await prisma.review.delete({ where: { id } });

    return NextResponse.json(
      { success: true, message: "Review deleted successfully" },
      { status: 200 }
    );
    } catch (error) {
         console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
    }
}