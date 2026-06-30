import {NextResponse} from "next/server";
import prisma from "../../../lib/prisma";
import {z} from "zod";

const createReviewSchema=z.object({
    userId:z.string().min(1),
    productId:z.string().min(1),
    orderId:z.string().optional().nullable(),
    rating:z.number().int().min(1).max(5),
    title:z.string().max(255).optional().nullable(),
    body:z.string().optional().nullable(),
});

export async function POST(req){
    try {
        body=await req.json();
        const parsed=createReviewSchema.safeParse(body);

        if(!parsed.success)
        {
            return NextResponse.json(
            { success: false, errors: parsed.error.errors },
            { status: 400 }
            );
        }
        const {userId,productId,orderId,rating,title,body:reviewBody}=parsed.data;
        const [user,product]=await promise.all([
            prisma.user.findUnique({where:{id:userId}}),
            prisma.product.findUnique({where:{id:productId}})
        ]);
        if(!user)
        {
             return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
        }
            if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    const existing=await prisma.review.findUnique({
        where:{userId_productId:{userId,productId}}
    });
     if (existing) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this product" },
        { status: 409 }
      );
    }
    let isVerified=false;
    if(orderId)
    {
        const order=await prisma.order.findFirst({
            where:{
                id:orderId,
                userId,
                status:"delivered",
                items:{
                    some:{
                        productVariant:{productId},
                    },
                },
            },
        });
        isVerified=!!order;
    }
    const review=await prisma.review.create({
        data:{
            userId,
            productId,
            orderId:orderId ?? null,
            rating,
            title:title ?? null,
            body:reviewBody ?? null,
            isVerified,
        },
        include:{
            user:{
                select:{id:true,firstName:true,lastName:true}
            },
        },
    });

    return NextResponse.json({success:true,mesage:"Review submited successfully",data:review},{status:201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server Error"},
            {status:500}
        );
    }
}

export async function GET(req){
    try {
        const {searchParams}=new URL(req.url);
        const productId=searchParams.get("productId");
           if (!productId) {
      return NextResponse.json(
        { success: false, message: "productId query param is required" },
        { status: 400 }
      );
    }
    const [reviews,allRatings]=await promise.all([
        prisma.review.findMany({
            where:{productId},
            include:{
                user:{
                    select:{
                        id:true,
                        firstName:true,
                        lastName:true,
                    },
                },
            },
            orderBy:[
                {isVerified:"desc"},
                {createdAt:"desc"},
            ],
        }),
        prisma.review.aggregate({
            where:{productId},
            _avg:{rating:true},
            _count:{rating:true}
        }),
    ]);
    return NextResponse.json({
        success:true,
        data:reviews,
        summary:{
            averageRating:Math.round((allRatings._avg.rating ?? 0)*10)/10,
            totalReviews:allRatings._count.rating,
        },
    },{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {success:false,message:"Internal server Error"},
            {status:500}
        )
    }
}