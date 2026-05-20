import {NextResponse} from "next/server";
import prisma from "../../../lib/prisma";
import {hex, size, z} from "zod";
import { error } from "console";
import { id } from "zod/v4/locales";

const addToCartSchema=z.object({
    productVariantId:z.string().min(1,"Product Variant ID is required"),
    userId:z.string().min(1,"User ID is required"),
    quantity:z.number().int().min(1).default(1),
});

export async function POST(req){
    try {
        const body=await req.json();
        const parsed=addToCartSchema.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({error:"Invalid data",details:parsed.error.errors},{status:400});
        }
        const {productVariantId,userId,quantity}=parsed.data;

        const user=await prisma.user.findUnique({where:{id:userId}});
        if(!user)
        {
            return NextResponse.json({error:"User not found"},{status:404});
        }
        const productVariant=await prisma.productVariant.findUnique({where:{id:productVariantId},
        include:{
                product:{select:{id:true,name:true,isActive:true}},
                size:{select:{id:true,name:true}},
                color:{select:{id:true,name:true,hexCode:true}},},
        });
        if(!productVariant)
        {
            return NextResponse.json({error:"Product Variant not found"},{status:404});
        }
        if(!productVariant.isActive || !productVariant.product.isActive)
        {
            return NextResponse.json({error:"Product Variant is not available"},{status:400});
        }
        if(productVariant.stockQuantity<quantity)
        {
            return NextResponse.json({error:"Insufficient stock"},{status:400});
        }
        //If item already exist in cart then update quantity
        const existingCartItem=await prisma.cart.findFirst({
            where:{userId,productVariantId}
        });
        console.log("Existing Cart Item:", existingCartItem);
        if(existingCartItem)
        {
            const newQuantity=existingCartItem.quantity+quantity;
            if(productVariant.stockQuantity<newQuantity)
            {
                return NextResponse.json({error:"Insufficient stock"},{status:400});
            }
             const updated=await prisma.cart.update({
            where:{id:existingCartItem.id},
            data:{quantity:newQuantity},
            include:{
                productVariant:{
                    include:{
                        product:{select:{id:true,name:true,basePrice:true,discountPrice:true,}},
                        size:{select:{id:true,name:true}},
                        color:{select:{id:true,name:true,hexCode:true}},
                    }
                }
            }
        })
        return NextResponse.json({
            success:true,
            message:"Cart quantity updated successfully",
            data:updated
        },
        {status:200});
        }
       

        const cartItem=await prisma.cart.create({
            data:{
                userId,
                productVariantId,
                quantity
            },
            include:{
                productVariant:{
                    include:{
                        product:{select:{id:true,name:true,basePrice:true,discountPrice:true,}},
                        size:{select:{id:true,name:true}},
                        color:{select:{id:true,name:true,hexCode:true}},
                    }
                }
            }
        })
        return NextResponse.json({
            success:true,
            message:"Product added to cart successfully",
            data:cartItem
        },
        {status:201
        })
    } catch (error) {
        console.error("Error adding to cart:", error);
        return NextResponse.json({error:"Failed to add to cart"},{status:500});
    }
}

export async function GET(req){
    try {
        const {searchParams}=new URL(req.url);
        const userId=searchParams.get("userId");
        if(!userId)
        {
            return NextResponse.json({error:"User ID is required"},{status:400});  
        }
        const user=await prisma.user.findUnique({where:{id:userId}});
        if(!user)
        {
            return NextResponse.json({error:"User not found"},{status:404});
        }
        const cartItems=await prisma.cart.findMany({
            where:{userId},
            include:{
                productVariant:{
                    include:{
                        product:{select:{id:true,name:true,basePrice:true,discountPrice:true,isActive:true,images:{where:{isPrimary:true},take:1,select:{imageUrl:true,altText:true}}}},
                        size:{select:{id:true,name:true}},
                        color:{select:{id:true,name:true,hexCode:true}},    
                    }
                }
            },
            orderBy:{createdAt:"desc"}
        });
        const enrichedCartItems=cartItems.map(item=>{
            const product=item.productVariant.product;
            const unitPrice = Number(product.discountPrice ?? product.basePrice)
        + Number(item.productVariant.extraPrice);
        const totalPrice=unitPrice*item.quantity;

        return {
            ...item,
            unitPrice,
            totalPrice,
            isAvailable:product.isActive && item.productVariant.isActive,
            hasStockIssue:item.productVariant.stockQuantity<item.quantity,
        }
        })
        const cartTotal=enrichedCartItems.reduce((acc,item)=>acc+item.totalPrice,0);
        const itemCount=enrichedCartItems.reduce((acc,item)=>acc+item.quantity,0);

        return NextResponse.json({
            success:true,
            data:enrichedCartItems,
            summary:{
                itemCount,
                cartTotal:Math.round(cartTotal*100)/100,
                totalItems:enrichedCartItems.length,
            },
        },
        {status:200}
    );
        
    } catch (error) {
        console.error("Error fetching cart:", error);
        return NextResponse.json({error:"Failed to fetch cart"},{status:500});
    }
}
export async function DELETE(req){
    try {
        const {searchParams}=new URL(req.url);
        const userId=searchParams.get("userId");

        if(!userId)
        {
            return NextResponse.json({error:"user Id is required"},{status:400});
        }
        const user=await prisma.user.findUnique({where:{id:userId}});
        if(!user)
        {
            return NextResponse.json({error:"User not found"},{status:404});
        }
        const deleted=await prisma.cart.deleteMany({where:{userId}});
        return NextResponse.json({
            success:true,
            message:"Cart cleared successfully",
            data:deleted
        });
    } catch (error) {
        console.error("Error deleting cart item:", error);
        return NextResponse.json({error:"Failed to delete cart item"},{status:500});
    }
}