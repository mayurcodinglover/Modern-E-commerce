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
export async function PUT(req,{params})
{
    try {
        const {id}=await params;
        const body=await req.json();
        const parsed=couponUpdateSchema.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({success:false,error:parsed.error.errors.map(e=>e.message).join(", ")},{status:400});
        }
        const existing=await prisma.coupon.findUnique({where:{id}});
        if(!existing)
        {
            return NextResponse.json({success:false,error:"Coupon not found"},{status:404});
        }

        if(parsed.data.code)
        {
            const conflict=await prisma.coupon.findFirst({
                where:{
                    code:parsed.data.code,
                    id:{not:id}
                }
            });
            if(conflict)
            {
                return NextResponse.json({success:false,error:"code already in use"},{status:400});
            }
        }
        const finalType=parsed.data.discountType || existing.discountType;
        const finalValue=parsed.data.discountValue || existing.discountValue;
        if(finalType==="percentage" && finalValue > 100 )
        {
            return NextResponse.json({success:false,error:"Percentage discount cannot exceed 100"},{status:400});
        }
        const updated=await prisma.coupon.update({
            where:{id},
            data:{
                ...parsed.data,
                ...(parsed.data.expiresAt ? {expiresAt:new Date(parsed.data.expiresAt)} : null)
            },
        });
        return NextResponse.json({success:true,data:updated},{status:200});
    } catch (error) {
        console.error("Error updating coupon:", error);
        return NextResponse.json({success:false,error:"Failed to update coupon"},{status:500});
    }
}

export async function DELETE(req,{params})
{
    try {
        const {id}=await params;
        const existing=await prisma.coupon.findUnique({where:{id}});
        if(!existing)
            {
                return NextResponse.json({success:false,error:"Coupon not found"},{status:404});
            }        
            if(!existing.isActive)
            {
                return NextResponse.json({success:false,error:"Coupon already inactive"},{status:400});
            }
            await prisma.coupon.update({
                where:{id},
                data:{isActive:false}
            });
            return NextResponse.json({success:true,message:"Coupon deactivated successfully"},{status:200});
    } catch (error) {
        console.error("Error deleting coupon:", error);
        return NextResponse.json({success:false,error:"Failed to delete coupon"},{status:500});

    }
}

export async function PATCH(req,{params})
{
    try {
        const {id}=await params;
        const existing=await prisma.coupon.findUnique({where:{id}});
        if(!existing)
        {
            return NextResponse.json({success:false,error:"Coupon not found"},{status:404});
        }
        if(existing.isActive)
        {
            return NextResponse.json({success:false,error:"Coupon is already active"},{status:400});
        }
        await prisma.coupon.update({
            where:{id},
            data:{isActive:true}
        });
        return NextResponse.json({success:true,message:"Coupon activated successfully"},{status:200});
    } catch (error) {
        console.error("Error toggling coupon:", error);
        return NextResponse.json({success:false,error:"Failed to toggle coupon"},{status:500});
    }
}