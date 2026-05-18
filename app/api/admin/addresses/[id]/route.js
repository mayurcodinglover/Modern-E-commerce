import {NextResponse} from 'next/server'
import prisma from '../../../../../lib/prisma'
import {z} from 'zod'


const updateAddressSchema=z.object({
    addressLine1:z.string().optional(),
    addressLine2:z.string().optional(),
    city:z.string().optional(),
    state:z.string().optional(),
    postalCode:z.string().optional(),
    country:z.string().optional(),
});
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
export async function PUT(req,{params})
{
    try {
        const {id}=await params;
        const body=await req.json();
        const parsedData=updateAddressSchema.safeParse(body);
        if(!parsedData.success)
        {
            return NextResponse.json({error:"Invalid data",details:parsedData.error.errors},{status:400});
        }
        const existing =await prisma.address.findUnique({where:{id}});
        if(!existing)
        {
            return NextResponse.json({error:"Address not found"},{status:404});
        }
        const updateAddress=await prisma.address.update({where:{id},data:parsedData.data});
        return NextResponse.json({success:true,data:updateAddress},{status:200});
    } catch (error) {
        console.error("Error updating address:", error);
        return NextResponse.json({error:"Failed to update address"},{status:500});
    }
}
export async function DELETE(req,{params})
{
    try {
        const {id}=await params;
        const existing=await prisma.address.findUnique({where:{id}});
        if(!existing)
        {
            return NextResponse.json({error:"Address not found"},{status:404});
        }
        const usedInOrders=await prisma.order.findFirst({where:{addressId:id}});
        if(usedInOrders)
        {
            return NextResponse.json({error:"Cannot delete address associated with orders"},{status:400});
        }

        await prisma.address.delete({where:{id}});
        if(existing.isDefault)
        {
            const nextAddress=await prisma.address.findFirst({where:{userId:existing.userId},orderBy:{createdAt:'desc'}});
            if(nextAddress)
            {
                await prisma.address.update({where:{id:nextAddress.id},data:{isDefault:true}});
            }
        }
        return NextResponse.json({success:true,message:"Address deleted successfully"},{status:200});
    } catch (error) {
        console.error("Error deleting address:", error);
        return NextResponse.json({error:"Failed to delete address"},{status:500});
    }
}
export async function PATCH(req,{params})
{
    try {
        const {id}=await params;
        const address=await prisma.address.findUnique({where:{id}});
        if(!address)
        {
            return NextResponse.json({error:"Address not found"},{status:404});
        }
        if(address.isDefault)
        {
            return NextResponse.json({error:"Address is already default"},{status:400});
        }
        await prisma.$transaction([
            prisma.address.updateMany({where:{userId:address.userId},data:{isDefault:true},
            data:{isDefault:false}}),
            prisma.address.update({where:{id},data:{isDefault:true}})
        ]);
        const updated=await prisma.address.findUnique({where:{id}});
        return NextResponse.json({success:true,data:updated},{status:200});
    } catch (error) {
        console.error("Error setting default address:", error);
        return NextResponse.json({error:"Failed to set default address"},{status:500});
    }
}