import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "../../../../../lib/prisma";

const couponUpdateSchema=z.object({
    code:z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/, {
        message: "Code must be uppercase letters, numbers, hyphens or underscores only",
        }).optional(),
    discountType:z.enum(['percentage','fixed']).optional(),
    discountValue:z.number().positive().optional(),
    minOrderAmount:z.number().positive().optional().nullable(),
    maxUses:z.number().int().optional().nullable(),
    expiresAt:z.string().datetime().optional().nullable(),
})

export async function GET(req,{params})
{
    try {
        const {id}=await params;
        const coupon=await prisma.coupon.findUnique({where:{id}});
        if(!coupon)
        {
            return NextResponse.json({error:"Coupon not found"},{status:404});
        }
        const now=new Date();
        return NextResponse.json({
            success:true,
            data:{
                ...coupon,
                isExpired:coupon.expiresAt ? coupon.expiresAt < now : false,
                isMaxOut:coupon.maxUses ? coupon.usedCount >= coupon.maxUses : false,
                remainingUses:coupon.maxUses ? coupon.maxUses - coupon.usedCount : null
            }
        },{status:200});
    } catch (error) {
        console.error("Error fetching coupon:", error);
        return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 });
    }
}