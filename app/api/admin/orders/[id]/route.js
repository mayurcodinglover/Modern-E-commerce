import prisma from "../../../../../lib/prisma";
import {NextResponse} from "next/server";

export async function GET(req,{params})
{
    try {
        const {id}=await params;
        const order=await prisma.order.findUnique({
            where:{id},
            include:{
                items:{
                    include:{
                        productVariant:{
                            include:{
                                product:{
                                    select:{id:true,name:true,
                                        images:{
                                            where:{isPrimary:true},
                                            take:1,
                                            select:{imageUrl:true},
                                        },
                                    },
                                },
                                size:{
                                    select:{name:true},
                                },
                                color:{ select:{name:true,hexCode:true}},
                            },
                        },
                    },
                },
                address:true,
                coupon:{
                    select:{code:true,discountType:true,discountValue:true},
                },
                payment:true,
                user:{
                    select:{
                        id:true,firstName:true,lastName:true,email:true,
                    },
                },
            },
        });

        if(!order)
        {
            return NextResponse.json({error:"Order not found"},{status:404});
        }
        return NextResponse.json({success:true,data:order},{status:200});
    } catch (error) {
        console.error("Error fetching order:", error);
        return NextResponse.json({error:"Failed to fetch order"},{status:500});
    }
}