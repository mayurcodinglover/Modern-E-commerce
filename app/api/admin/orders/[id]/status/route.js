import prisma from "../../../../../../lib/prisma";
import { NextResponse } from "next/server";
import {success, z} from "zod"

const validStatuses=[
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded"
];

const updateStatusSchema=z.object({
    status:z.enum(
        ["pending","confirmed","processing","shipped","delivered","cancelled","refunded"],
        {message:"Invalid Order Status"}
    )
});

export async function PATCH(req,{params})
{
    try {
        const {id}=await params;
        const body=await req.json();
        const parsed=updateStatusSchema.safeParse(body);

        if(!parsed.success)
        {
            return NextResponse.json({
                success:false,
                errors:parsed.error.errors,
                validStatuses
            },{status:400});
        }
        const existing=await prisma.orders.findUnique({
            where:{id}
        });
        if(!existing)
        {
            return NextResponse.json({success:false,message:"Order not found"},{status:404});
        }
        if(existing.status==="delivered" || existing.status==="refunded")
        {
            return NextResponse.json({
                success:false,
                message:`Can not change chage status of a ${existing.status} order`
            },{status:400});
        }
        //If cancelling to restore stock
        if(parsed.data.status==="cancelled" && existing.status!=="cancelled")
        {
            const orderItems=await prisma.orderItems.findMany({where:{orderId:id}});
            await prisma.$transaction(async (tx)=>{
                for(const item of orderItems)
                {
                    await tx.productVariant.update({
                        where:{id:item.productVariant},
                        data:{
                            stockQuantity:{increment:item.quantity}
                        },
                    });
                }
                if(existing.couponId)
                {
                    await tx.coupon.update({
                        where:{id:existing.couponId},
                        data:{
                            usedCount:{decrement:1}
                        }
                    });
                }
                await tx.order.update({
                    where:{id},
                    data:{
                        status:parsed.data.status
                    },
                });
            });
        }
        else{
            await prisma.order.update({
                where:{id},
                data:{status:parsed.data.status},
            });
        }
        const updated=await prisma.order.findUnique({
            where:{id},
            include:{
                items:true,
                payment:{select:{status:true}},
            },
        });

        return NextResponse.json({success:true,message:"Order status updated successfully",data:updated},{status:200})
    } catch (error) {
        console.error("Internal server Error",error);
        NextResponse.json({success:false,message:"Internal server error"},{status:500})
    }
}