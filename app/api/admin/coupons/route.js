import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const couponSchema=z.object({
    code:z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/, {
      message: "Code must be uppercase letters, numbers, hyphens or underscores only",
    }),
    discountType:z.enum(['percentage','fixed'],{
        message:"Discount type must be either 'percentage' or 'fixed'"
    }),
    discountValue:z.number().positive("Discount value must be a positive number"),
    minOrderAmount:z.number().positive("Minimum order amount must be a positive number").optional().nullable(),
    maxUses:z.number().int().optional().nullable(),
    expiresAt:z.string().datetime().optional().nullable(),
});

export async function POST(req,{params})
{
    try {
        const body=await req.json();
        const parsed=couponSchema.safeParse(body);
        if (!parsed.success) {
    return NextResponse.json(
        {
            error: parsed.error.issues.map(e => e.message).join(", ")
        },
        { status: 400 }
    );
}
        const {code,discountType,discountValue,minOrderAmount,maxUses,expiresAt}=parsed.data;
        if(discountType==='percentage' && discountValue>100)
        {
            return NextResponse.json({error:"Percentage discount value must be between 0 and 100"},{status:400});
        }
        const existingCoupon=await prisma.coupon.findUnique({where:{code}});
        if(existingCoupon)
        {
            return NextResponse.json({error:"Coupon code already exists"},{status:400});
        }
        const newCoupon=await prisma.coupon.create({

            data:{
                code,
                discountType,
                discountValue,
                minOrderAmount:minOrderAmount || null,
                maxUses:maxUses || null,
                expiresAt:expiresAt ? new Date(expiresAt) : null,
            },
        });
        return NextResponse.json({message:"Coupon created successfully",coupon:newCoupon},{status:201});
    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }
}