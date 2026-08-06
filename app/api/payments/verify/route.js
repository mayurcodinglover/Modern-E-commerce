import {NextResponse} from "next/server";
import prisma from "../../../../lib/prisma"
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Verify payment body:", body);

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    } = body;

    // Check all required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required payment fields",
          received: { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId },
        },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpaySignature);

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Check order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Update payment + order in transaction
    await prisma.$transaction([
      prisma.payment.upsert({
        where: { orderId },
        create: {
          orderId,
          userId: order.userId,
          amount: order.totalAmount,
          currency: "INR",
          method: "razorpay",
          status: "paid",
          gateway: "razorpay",
          transactionId: razorpayPaymentId,
          paidAt: new Date(),
        },
        update: {
          status: "paid",
          transactionId: razorpayPaymentId,
          paidAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "confirmed" },
      }),
    ]);

    // Fetch updated order to return
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        items: {
          include: {
            productVariant: {
              include: {
                product: { select: { id: true, name: true } },
                size: { select: { name: true } },
                color: { select: { name: true } },
              },
            },
          },
        },
        address: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        data: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}