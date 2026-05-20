import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { z } from "zod";

const updateCartSchema=z.object({
    quantity:z.number().int().min(1).default(1),
});

export async function PUT(req,{params})
{
    try {
        const {id}=await params;
        const body=await req.json();
        const parsed=updateCartSchema.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({error:"Invalid data",details:parsed.error.errors},{status:400});
        }
        const {quantity}=parsed.data;

        const cartItem=await prisma.cart.findUnique({where:{id},
        include:{
            productVariant:{select:{stockQuantity:true,isActive:true}}
        }});

        if(!cartItem)
        {
            return NextResponse.json({error:"Cart item not found"},{status:404});
        }
        if(!cartItem.productVariant.isActive)
        {
            return NextResponse.json({error:"Product Variant is not available"},{status:400});
        }
        if(cartItem.productVariant.stockQuantity<quantity)
        {
            return NextResponse.json({error:"Insufficient stock"},{status:400});
        }
        const updated=await prisma.cart.update({
            where:{id},
            data:{quantity},
            include:{
                productVariant:{
                    include:{
                        product:{select:{id:true,name:true,basePrice:true,discountPrice:true}},
                        size:{select:{id:true,name:true}},
                        color:{select:{id:true,name:true,hexCode:true}},
                    },
                },
            },
        });
        return NextResponse.json({success:true,message:"Cart item updated successfully",data:updated},{status:200});
    } catch (error) {
        console.error("Error updating cart item:", error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}

export async function DELETE(req,{params})
{
    try {
        const {id}=await params;
        const cartItem=await prisma.cart.findUnique({where:{id}});
        if(!cartItem)
        {
            return NextResponse.json({error:"Cart item not found"},{status:404});
        }
        await prisma.cart.delete({where:{id}});
        return NextResponse.json({success:true,message:"Cart item deleted successfully"},{status:200});
    } catch (error) {
        console.error("Error deleting cart item:", error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}