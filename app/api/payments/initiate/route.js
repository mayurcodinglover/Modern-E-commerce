import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorPay=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
});

const initiateSchema=z.object({
    orderId:z.string().min(1),
    method:z.string().min(1)
});

export async function POST(req){
    try{
        const body=await req.json();
        const parsed=initiateSchema.safeParse(body);

        if(!parsed.success)
        {
            return NextResponse.json({
                success:false,
                errors:parsed.error.errors
            },{status:400});
        }
        const {orderId,method}=parsed.data;

        const order=await prisma.order.findUnique({
            where:{id:orderId},
        });
        if(!order)
        {
            return NextResponse.json({success:false,message:"Order not found"},{status:404});
        }
        //block if already paid
        const existingPayment=await prisma.payment.findUnique({
            where:{orderId}
        });
        if(existingPayment && existingPayment.status==="paid")
        {
            return NextResponse.json({success:false,message:"Order already paid"},{status:400});
        }
        //create Razorpay order
        const razorpayOrder=await razorPay.orders.create({
            amount:Math.round(Number(order.totalAmount)*100), //in paise
            currency:"INR",
            receipt:orderId,
        });
        //create or update payment record
        const payment=await prisma.payment.upsert({
            where:{orderId},
            create:{
                orderId,
                userId:order.userId,
                amount:order.totalAmount,
                currency:"INR",
                method,
                status:"pending",
                gateway:"razorpay",
                transactionId:razorpayOrder.id
            },
            update:{
                method,
                status:"pending",
                transactionId:razorpayOrder.id
            },
        });
        return NextResponse.json({
            success:true,
            message:"Payment initiated",
            data:{
                payment,
                razorpayOrderId:razorpayOrder.id,
                amount:razorpayOrder.amount,
                currency:razorpayOrder.currency,
                keyId:process.env.RAZORPAY_KEY_ID
            },
        },{status:201});
    }
    catch(error)
    {
        console.error("Error initiating payment:",error);
        return NextResponse.json({success:false,message:"Failed to initiate payment"},{status:500});
    }
}