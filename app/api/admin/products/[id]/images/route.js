import {z} from "zod";
import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

const validateImageSchema=z.object({
    imageUrl:z.string(),
    altText:z.string().max(255).optional().nullable(),
    isPrimary:z.boolean().default(false),
    displayOrder:z.number().int().min(0).default(0),
})

export async function POST(req,{params})
{
    try {
        const {id}=await params;
        const formData=await req.formData();
        const body={
            imageUrl:formData.get("imageUrl"),
            altText:formData.get("altText"),
            isPrimary:formData.get("isPrimary") === "true",
            displayOrder:formData.get("displayOrder") ? parseInt(formData.get("displayOrder")) : 0,
        }
        const parsed=validateImageSchema.safeParse(body);
        if(!parsed.success)
        {
             console.log("Zod Error:", parsed.error.format());
            return NextResponse.json({success:"false",errors:parsed.error.errors},{status:400});
        }
        const {imageUrl,altText,isPrimary,displayOrder}=parsed.data;
        //check product is exist or not
        const product=await prisma.product.findUnique({where:{id}});
        if(!product)
        {
            return NextResponse.json({success:"false",error:'Product not found'},{status:404});
        }
        if(isPrimary)
        {
            await prisma.productImage.updateMany({where:{productId:id,isPrimary:true},data:{isPrimary:false}});
        }
        //if no image exist for the product then set isprimary to true
        const imageCount=await prisma.productImage.count({where:{productId:id}});

        const shouldBePrimary=isPrimary || imageCount===0;

        const productImage=await prisma.productImage.create({
            data:{
                productId:id,
                imageUrl,
                altText,
                isPrimary:shouldBePrimary,
                displayOrder,
            }
        });
        return NextResponse.json({status:"true",data:productImage},{status:201});
    } catch (error) {
        console.error("Error adding product image:", error);
        return NextResponse.json({status:"false",error:'Internal server error'},{status:500});
    }
}

export async function GET(req,{params})
{
    try {
        const {id}=await params;
        const product=await prisma.product.findUnique({where:{id}});
        if(!product)
        {
            return NextResponse.json({success:"false",error:'Product not found'},{status:404});
        }
        const images=await prisma.productImage.findMany({where:{productId:id},orderBy:{displayOrder:'asc'}});
        return NextResponse.json({success:"true",data:images},{status:200});
    } catch (error) {
        console.error("Error fetching product images:", error);
        return NextResponse.json({success:"false",error:'Internal server error'},{status:500});
    }
}