import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import {z} from "zod";

const validateVariantSchema=z.object({
    sku:z.string().min(1,"SKU is required").max(100),
    sizeId:z.string().optional().nullable(),
    colorId:z.string().optional().nullable(),
    stockQuantity:z.number().int().min(0).default(0),
    extraPrice:z.number().min(0).default(0),
});

export async function POST(req,{params})
{
    try {
        const {id}=await params;
        const body=await req.json();
        const parsed=validateVariantSchema.safeParse(body);
        if(!parsed.success)
        {
            return NextResponse.json({status:"false",errors: parsed.error.issues.map(e => e.message)},{status:400});
        }
        const {sku,sizeId,colorId,stockQuantity,extraPrice}=parsed.data;
        const product=await prisma.product.findUnique({where:{id}});
        if(!product)
        {
            return NextResponse.json({status:"false",error:'Product not found'},{status:404});
        }
        if(!product.isActive)
        {
            return NextResponse.json({status:"false",error:'Cannot add variant to an inactive product'},{status:400});
        }
        if(sizeId)
        {
            const size=await prisma.size.findUnique({where:{id:sizeId}});
            if(!size)
            {
                return NextResponse.json({status:"false",error:'Size not found'},{status:404});
            }
        }
        if(colorId)
        {
            const color=await prisma.color.findUnique({where:{id:colorId}});
            if(!color)
            {
                return NextResponse.json({status:"false",error:'Color not found'},{status:404});
            }
        }
        const skuExists=await prisma.productVariant.findUnique({where:{sku}});
        if(skuExists)
        {
            return NextResponse.json({status:"false",error:'SKU already exists'},{status:400});
        }
        const variantsExist=await prisma.productVariant.findFirst({where:{productId:id,sizeId,colorId}});
        if(variantsExist)
        {
            return NextResponse.json({status:"false",error:'Variant with the same size and color already exists'},{status:400});
        }
        const variant=await prisma.productVariant.create({
            data:{
                productId:id,
                sku,
                sizeId:sizeId ?? null,
                colorId: colorId ?? null,
                stockQuantity,
                extraPrice,
            },
            include:{
                size:{select:{id:true,name:true}},
                color:{select:{id:true,name:true,hexCode:true}},
            },
        });
        return NextResponse.json({status:"true",message:"Variant created successfully",data:variant},{status:201});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "An error occurred while creating the product variant."}, {status: 500});
    }
}

export async function GET(req,{params})
{
    try {
        const {id}=await params;
        const {searchParams}=new URL(req.url);
        const includeInactive=searchParams.get("includeInactive")==="true";
        const product=await prisma.product.findUnique({where:{id}});
        if(!product)
        {
            return NextResponse.json({status:"false",error:'Product not found'},{status:404});
        }
        const variants=await prisma.productVariant.findMany({
            where:{
                productId:id,
                ...(includeInactive?{}:{isActive:true}),
            },
            include:{
                size:{select:{id:true,name:true}},
                color:{select:{id:true,name:true,hexCode:true}},
            },
            orderBy:{createdAt:'asc'},
        });
        return NextResponse.json({status:"true",data:variants,total:variants.length,product:{id:product.id,name:product.name}},{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "An error occurred while fetching product variants."}, {status: 500});
    }
}