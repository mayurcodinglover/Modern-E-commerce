import { NextResponse } from "next/server";
import prisma from "../../../../../../../lib/prisma";
import {z} from "zod";
import { isPrimary } from "cluster";

export async function DELETE(req,{params})
{
    const {id,imageId}=await params;
    try {
        const product=await prisma.product.findUnique({where:{id}});
        if(!product)
        {
            return NextResponse.json({error:'Product not found'},{status:404});
        }
        const productImage=await prisma.productImage.findUnique({where:{id:imageId}});
        if(!productImage || productImage.productId !== id)
        {
            return NextResponse.json({error:'Image not found for this product'},{status:404});
        }
        await prisma.productImage.delete({where:{id:imageId}});
        if(productImage.isPrimary)
        {
            const nextImage=await prisma.productImage.findFirst({where:{productId:id},orderBy:{displayOrder:'asc'}});
            
            if(nextImage)
            {
                await prisma.productImage.update({where:{id:nextImage.id},data:{isPrimary:true}});
            }
        }
        return NextResponse.json({message:'Image deleted successfully'},{status:200});
    } catch (error) {
        console.error("Error deleting product image:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}