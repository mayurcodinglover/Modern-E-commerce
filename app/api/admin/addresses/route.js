import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import {z} from "zod";
import { parse } from "path";


const addressSchema=z.object({
    userId:z.string().min(1,"Address ID is required"),
    addressLine1:z.string().min(1).max(255,"Address Line 1 must be less than 255 characters"),
    addressLine2:z.string().max(255).optional().nullable(),
    city:z.string().min(1).max(100,"City must be less than 100 characters"),
    state:z.string().max(100).optional().nullable(),
    postalCode:z.string().min(1).max(20),
    country:z.string().min(1).max(100),
    isDefault:z.boolean().default(false)
});

export async function POST(req)
{
    try {
        const body=await req.json();
        const parsedData=addressSchema.safeParse(body);
        if(!parsedData.success)
        {
            return NextResponse.json({error:parsedData.error.errors.map(e=>e.message).join(",")},{status:400});
        }
        const {userId,addressLine1,addressLine2,city,state,postalCode,country,isDefault}=parsedData.data;
        const userExists=await prisma.user.findUnique({where:{id:userId}});
        if(!userExists)
        {
            return NextResponse.json({error:"User not found"},{status:404});
        }
        const addressCount=await prisma.address.count({where:{userId}});
        const shouldBeDefault=isDefault || addressCount===0;
        if(shouldBeDefault)
        {
            await prisma.address.updateMany({where:{userId},data:{isDefault:false}});
        }
        const newAddress=await prisma.address.create({
            data:{
                userId,
                addressLine1,
                addressLine2:addressLine2 || null,
                city,
                state:state || null,
                postalCode,
                country,
                isDefault:shouldBeDefault
            }
        });
        return NextResponse.json({success:true,address:newAddress},{status:201});
    } catch (error) {
        console.error("Error creating address:", error);
        return NextResponse.json({error:"Failed to create address"},{status:500});
    }
}
export async function GET(req)
{
    try {
        const {searchParams}=new URL(req.url);
        const userId=searchParams.get("userId");
        if(!userId)
        {
            return NextResponse.json({success:false,error:"userId query parameter is required"},{status:400});
        }
        const user=await prisma.user.findUnique({where:{id:userId}});
        if(!user)
        {
            return NextResponse.json({success:false,error:"User not found"},{status:404});
        }
        const addresses=await prisma.address.findMany({where:{userId},orderBy:[{isDefault:"desc"},{createdAt:"desc"}]});
        return NextResponse.json({success:true,data:addresses,total:addresses.length},{status:200});
    } catch (error) {
        console.error("Error fetching addresses:", error);
        return NextResponse.json({error:"Failed to fetch addresses"},{status:500});
    }
}