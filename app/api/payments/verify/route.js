import {NextResponse} from "next/server";
import prisma from "../../../../lib/prisma"
import {success, z} from "zod";
import crypto from "crypto"

const verifySchema=z.object({
    razorpayOrderId:z.string().min(1),
    razorpayPaymentId:z.string().min(1),
    razorpaySignature:z.string().min(1),
    orderId:z.string().min(1),
});

export async function POST(req){
    try {
        const body=await req.json();
        const parsed=verifySchema.safeParse(body);

        if(!parsed.success)
        {
            return NextResponse.json({success:false,errors:parsed.error.errors},{status:400});
        }
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            orderId
        }=parsed.data;

        const expectedSignature=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

        if(expectedSignature!==razorpaySignature)
        {
            return NextResponse.json({
                success:false,message:"Invalid payment signature"
            },{status:400});
        }

        await prisma.$transaction([
            prisma.payment.update({
                where:{orderId},
                data:{
                    status:"paid",
                    transactionId:razorpayPaymentId,
                    paidAt:new Date(),
                },
            }),
            prisma.order.update({
                where:{id:orderId},
                data:{status:"confirmed"}
            }),
        ]);
        const updatedOrder=await prisma.order.findUnique({
            where:{id:orderId},
            include:{payment:true,items:true}
        });
        return NextResponse.json({
            success:true,
            message:"payment verified successfully ",
            data:updatedOrder
        },{status:200})
    } catch (error) {
        console.error(error);
        return NextResponse.json({success:false,message:"Internal server error"},{status:500});
    }
}