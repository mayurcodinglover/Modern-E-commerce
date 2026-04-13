import {z} from "zod";
import prisma from "../../../../../../../lib/prisma";
import {NextResponse} from "next/server";

const validateVariantUpdateSchema=z.object({
    sku:z.string().min(1).max(100).optional(),
    stockQuantity:z.number().int().min(0).optional(),
    extraPrice:z.number().min(0).optional(),
    isActive:z.boolean().optional(),
});

export async function PUT(req,{params})
{
    try {
        const {id,variantId}=await params;
        const body=await req.json();
        const parsed=validateVariantUpdateSchema.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({status:"false",errors: parsed.error.issues.map(e => e.message)},{status:400});
        }
        const product=await prisma.product.findUnique({where:{id}});
        if(!product)
        {
            return NextResponse.json({status:"false",error:'Product not found'},{status:404});
        }
        const variant=await prisma.productVariant.findUnique({where:{id:variantId}});
        if(!variant || variant.productId!==id)
        {
            return NextResponse.json({status:"false",error:'Variant not found'},{status:404});
        }
        if(parsed.data.sku)
        {
            const skuExists=await prisma.productVariant.findFirst({where:{sku:parsed.data.sku,id:{not:variantId}}});
            if(skuExists)
            {
                return NextResponse.json({status:"false",error:'SKU already exists'},{status:400});
            }
        }
        const updated=await prisma.productVariant.update({
            where:{id:variantId},
            data:parsed.data,
            include:{
                size:{select:{id:true,name:true}},
                color:{select:{id:true,name:true,hexCode:true}}
            }
        })
        return NextResponse.json({status:"true",data:updated},{status:200});
    } catch (error) {
        console.error("Error updating variant:", error);
        return NextResponse.json({status:"false",error:'Internal Server Error'},{status:500});
    }
}
export async function DELETE(req,{params})
{
    try {
        const {id,variantId}=await params;
        const product=await prisma.product.findUnique({where:{id}});
        if(!product)
        {
            return NextResponse.json({status:"false",error:'Product not found'},{status:404});
        }
        const variant=await prisma.productVariant.findUnique({where:{id:variantId,productId:id}});
        if(!variant)
        {
            return NextResponse.json({status:"false",error:'Variant not found'},{status:404});
        }
        //order and cart logic we will write when database is ready
        // const usedInorders=await prisma.orderItem.findFirst({where:{productVariantId:variantId}});
        // if(usedInorders)
        // {
        //     return NextResponse.json({status:"false",error:'Cannot delete variant that is part of an order'},{status:400});
        // }
        //block delete if variant is in any active cart
        // const usedInCarts=await prisma.cartItem.findFirst({where:{productVariantId:variantId}});
        // if(usedInCarts)
        // {
        //     return NextResponse.json({status:"false",error:'Cannot delete variant that is part of an active cart'},{status:400});
        // }
        await prisma.productVariant.delete({where:{id:variantId}});
        return NextResponse.json({status:"true",message:'Variant deleted successfully'},{status:200});
    } catch (error) {
        console.error("Error deleting variant:", error);
        return NextResponse.json({status:"false",error:'Internal Server Error'},{status:500});
    }
}