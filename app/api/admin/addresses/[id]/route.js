import {NextResponse} from 'next/server'
import prisma from '../../../../../lib/prisma'
import {z} from 'zod'

export async function GET(req,{params})
{
    try {
        const {id}=await params;
        const address=await prisma.address.findUnique({where:{id},include:{user:{
            select:{
                id:true,
                firstName:true,
                lastName:true,
                email:true
            }
        }},});
        if(!address)
        {
            return NextResponse.json({error:"Address not found"},{status:404});
        }
        return NextResponse.json({success:true,data:address},{status:200});

    } catch (error) {
        console.error("Error fetching address:", error);
        return NextResponse.json({error:"Failed to fetch address"},{status:500});
    }
}