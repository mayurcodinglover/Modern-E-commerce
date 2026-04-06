import {NextResponse} from 'next/server';
import prisma from "../../../../../lib/prisma";
import {z} from 'zod';

const validateProductUpdate=z.object({
    name:z.string().min(1,'Name cannot be empty').max(255).optional(),
    title:z.string().max(500).optional().nullable(),
    description:z.string().optional().nullable(),
    categoryId:z.string().optional(),
    subcategoryId:z.string().optional().nullable(),
    basePrice:z.number().positive().optional(),
    discountPrice:z.number().positive().optional().nullable()
});

export async function GET(req,{params})
{
    try {
        const {id}=await params;
        const product=await prisma.product.findUnique({
            where:{id},
            include:{
                category:{select:{id:true,name:true}},
                subcategory:{select:{id:true,name:true}},
                variants:{
                    include:{
                        size:{select:{id:true,name:true}},
                        color:{select:{id:true,name:true,hexCode:true}},
                    },
                    orderBy:{createdAt:"asc"},
                },
            images:{orderBy:{displayOrder:"asc"}},
            _count:{select:{variants:true,images:true}},
            },
        });
        if(!product){
            return NextResponse.json({success:false,error:'Product not found'},{status:404});
        }
        const finalPrice=product.discountPrice ?? product.basePrice;
        return NextResponse.json({success:true,data:{...product,finalPrice}},{status:200});
    } catch (error) {
        console.error('Error fetching product:',error);
        return NextResponse.json({error:'Failed to fetch product'},{status:500});
    }
}

export async function PUT(req,{params})
{
    try {
        const {id}=await params;
        const body=await req.json();
        const parsedData=validateProductUpdate.safeParse(body);
        if(!parsedData.success){
            return NextResponse.json({error:"Invalid input",errors:parsedData.error.errors},{status:400});
        }
        const {name,title,description,categoryId,subcategoryId,basePrice,discountPrice}=parsedData.data;
        const existing=await prisma.product.findUnique({where:{id}});
        if(!existing)
        {
            return NextResponse.json({error:'Product not found'},{status:404});
        }
        if(categoryId)
        {
            const category=await prisma.category.findUnique({where:{id:categoryId}});
            if(!category)
            {
                return NextResponse.json({error:"Category not found"},{status:404});
            }
            if(!category.isActive)
            {
                return NextResponse.json({error:"Category is inactive"},{status:400});
            }
        }
        if(subcategoryId)
        {
            const subcategory=await prisma.subcategory.findUnique({where:{id:subcategoryId}});
            if(!subcategory)
            {
                return NextResponse.json({error:"Subcategory not found"},{status:404});
            }
            if(!subcategory.isActive)
            {
                return NextResponse.json({error:"Subcategory is inactive"},{status:400});
            }
             const targetCategoryId=categoryId ?? existing.categoryId;
            if(subcategory.categoryId!==targetCategoryId)
            {
                return NextResponse.json({error:"Subcategory does not belong to the specified category"},{status:400});
            }
        }
        //validate discount price vs bas price
        const finalBasePrice=basePrice ?? Number(existing.basePrice);
        const finalDiscountPrice=discountPrice ?? Number(existing.discountPrice);
        if(finalDiscountPrice && finalDiscountPrice>=finalBasePrice)
        {
            return NextResponse.json({error:"Discount price must be less than base price"},{status:400});
        }
        const updated=await prisma.product.update({
            where:{id},
            data:parsedData.data,
            include:{
                category:{select:{id:true,name:true}},
                subcategory:{select:{id:true,name:true}},
            },
        });
        return NextResponse.json({message:"Product updated successfully",product:updated},{status:200});
    } catch (error) {
        console.error('Error updating product:',error);
        return NextResponse.json({error:'Failed to update product'},{status:500});
    }
}
