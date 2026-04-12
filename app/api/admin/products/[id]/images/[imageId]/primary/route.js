import { NextResponse } from "next/server";
import prisma from "../../../../../../../../lib/prisma";
import { isPrimary } from "cluster";

export async function PATCH(req,{params})
{
    const {id,imageId}=await params;
    try {
        const product=await prisma.product.findUnique({where:{id}});
        if(!product)
        {
            return NextResponse.json({error:'Product not found'},{status:404});
        }
        const image=await prisma.productImage.findUnique({where:{id:imageId}});
        if(!image || image.productId !== id)
        {
            return NextResponse.json({error:'Image not found for this product'},{status:404}); 
        }
        if(image.isPrimary)
        {
            return NextResponse.json({message:'Image is already primary'},{status:200});
        }
        await prisma.$transaction([
            prisma.productImage.updateMany({where:{productId:id,isPrimary:true},data:{isPrimary:false}}),
            prisma.productImage.update({where:{id:imageId},data:{isPrimary:true}})
        ]);
        const updatedImage=await prisma.productImage.findUnique({where:{id:imageId}})
        return NextResponse.json({message:'Primary image updated successfully', image: updatedImage},{status:200});
    } catch (error) {
        console.error("Error setting primary image:", error);
        return NextResponse.json({ error: "Failed to set primary image" }, { status: 500 });
    }
}