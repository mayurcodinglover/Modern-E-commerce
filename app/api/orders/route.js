import {NextResponse} from 'next/server'
import prisma from '../../../../lib/prisma';
import {z} from 'zod'

export async function GET(req){
    try {
        const {searchParams}=new URL(req.url);
        const userId=searchParams.get('userId');
        const status=searchParams.get('status') || "";
        

        if(!userId)
        {
            return NextResponse.json({error:'userId query parameter is required'}, {status:400});
        }
        const where={
            userId,
            ...(status && {status}),
        };

        const [order,total]=await Promise.all([
            prisma.order.findMany({
                where,
                include:{
                    items:{
                        include:{
                            productVariant:{
                                include:{
                                    product:{select :{id:true,name:true}},
                                    size:{select:{name:true}},
                                    color:{select:{name:true,hexCode:true}}
                                },
                            },
                        },
                    },
                    address:true,
                    coupon:{select:{code:true}},
                    payment:{select:{status:true,method:true}}
                },
                orderBy:{createdAt:'desc'},
            }),
            prisma.order.count({where}),
        ]);
        return NextResponse.json({
            success:true,
            data:order,
            total:total,
        },{status:200});

    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({error: 'Failed to fetch orders'}, {status: 500});
    }
}