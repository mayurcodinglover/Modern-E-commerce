import {NextResponse} from 'next/server'
import prisma from '../../../../lib/prisma'
import {z} from 'zod'

const addToWhishlistSchema=z.object({
    userId:z.string().min(1,"User ID is required"),
    productId:z.string().min(1,"Product ID is required"),
});

export async function POST(req)
{
    try {
        const body=await req.json();
        const parsed=addToWhishlistSchema.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({error:"Invalid data",details:parsed.error.errors},{status:400});
        }
        const {userId,productId}=parsed.data;
        const userExists=await prisma.user.findUnique({where:{id:userId}});
        if(!userExists)
        {
            return NextResponse.json({error:"User not found"},{status:404});
        }
        const productExists=await prisma.product.findUnique({where:{id:productId}});
        if(!productExists)
        {
            return NextResponse.json({error:"Product not found"},{status:404});
        }
        if(!productExists.isActive)
        {
            return NextResponse.json({error:"Product is not available"},{status:400});
        }
        const existing=await prisma.whishlist.findUnique({where:{userId_productId:{userId,productId}}});
        if(existing)
        {
            return NextResponse.json({error:"Product already in whishlist"},{status:400});
        }
        const whishlistItem=await prisma.whishlist.create({
            data:{
                userId,
                productId,
            },
            include:{
                product:{
                    select:{
                        id:true,
                        name:true,
                        basePrice:true,
                        discountPrice:true,
                        images:{
                            where:{isPrimary:true},
                            take:1,
                            select:{imageUrl:true,altText:true},
                        },
                    },
                },
            },  
        });
        return NextResponse.json({success:true,message:"Product added to whishlist",data:whishlistItem},{status:201});
    } catch (error) {
        console.error("Error adding to whishlist:", error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}

export async function GET(req)
{
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const userExists=await prisma.user.findUnique({where:{id:userId}});
        if(!userExists)
        {
            return NextResponse.json({error:"User not found"},{status:404});
        }
        const whishlistItems=await prisma.whishlist.findMany({where:{userId},
        include:
        {
            product:{
                select:{
                    id:true,
                    name:true,
                    basePrice:true,
                    discountPrice:true,
                    isActive:true,
                    images:{
                        where:{isPrimary:true},
                        take:1,
                        select:{imageUrl:true,altText:true},
                    },
                    variants:{
                        where:{isActive:true},
                        select:{
                            id:true,
                            stockQuantity:true,
                        }
                    }
                }
            }   
        },orderBy: { createdAt: "desc" }});
        //Enriched each item with usefull flags
        const enriched=whishlistItems.map((item)=>{
            const totalStock=item.product.variants.reduce((acc,variant)=>acc+variant.stockQuantity,0);
            const finalPrice=item.product.discountPrice ?? item.product.basePrice;
            const discount=item.product.discountPrice ? Math.round(((item.product.basePrice - item.product.discountPrice)/item.product.basePrice)*100) : 0;
            return {
                ...item,
                finalPrice:Number(finalPrice),
                discountPercentage:discount,
                isAvailable:item.product.isActive,
                isInStock:totalStock>0,
                totalStock,
            };
        });
        return NextResponse.json({success:true,data:enriched,total:enriched.length},{status:200});
    } catch (error) {
        console.error("Error fetching whishlist:", error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}

export async function DELETE(req)
{
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const userExists=await prisma.user.findUnique({where:{id:userId}});
        if(!userExists)
        {
            return NextResponse.json({error:"User not found"},{status:404});
        }
        const deleted=await prisma.whishlist.deleteMany({where:{userId}});
        return NextResponse.json({success:true,message:"Whishlist cleared",deletedCount:deleted.count},{status:200});
    } catch (error) {
        console.error("Error removing from whishlist:", error);
        return NextResponse.json({error:"Internal Server Error"},{status:500});
    }
}