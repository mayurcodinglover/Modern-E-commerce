import {NextResponse} from "next/server";
import prisma from "../../../../../lib/prisma";
import {z} from "zod";

const ValidateSchema=z.object({
    code:z.string().min(1,"Code is required"),
    orderAmount:z.number().positive("Order amount must be positive"),
});

export async function POST(req)
{
    try {
        const body=await req.json();
        const parsed=ValidateSchema.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({success:false,error:parsed.error.errors.map(e=>e.message).join(", ")},{status:400});
        }
        const {code,orderAmount}=parsed.data;
        const coupon=await prisma.coupon.findUnique({where:{code}});
        if(!coupon || !coupon.isActive)
        {
            return NextResponse.json({success:false,error:"Invalid or Expired coupon code"},{status:404});
        }
        if(coupon.expiresAt && coupon.expiresAt < new Date())
        {
            return NextResponse.json({success:false,error:"Coupon code has expired"},{status:400});
        }
        if(coupon.maxUses && coupon.usedCount >= coupon.maxUses)
        {
            return NextResponse.json({success:false,error:"Coupon code has reached its maximum usage limit"},{status:400});
        }
        if(coupon.minOrderAmount && orderAmount < coupon.minOrderAmount)
        {
            return NextResponse.json({success:false,error:`Minimum order amount for this coupon is ${coupon.minOrderAmount}`},{status:400});
        }
        let discountAmount=0;
        if(coupon.discountType==="percentage")
        {
            discountAmount=(orderAmount* coupon.discountValue)/100;
        }
        else{
            discountAmount=coupon.discountValue;
        }

        const finalAmount=orderAmount - discountAmount;
        return NextResponse.json({
            success:true,
            data:{
                couponId:coupon.id,
                code:coupon.code,
                discountType:coupon.discountType,
                discountValue:Number(coupon.discountValue),
                discountAmount:Math.round(discountAmount * 100) / 100,
                originalAmount:orderAmount,
                finalAmount:Math.round(finalAmount * 100) / 100,
            },
        },{status:200});
    } catch (error) {
        console.error("Error validating coupon:", error);
        return NextResponse.json({ error: "An error occurred while validating the coupon" }, { status: 500 });
    }
}