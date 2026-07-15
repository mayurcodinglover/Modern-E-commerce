import {NextResponse} from 'next/server'
import prisma from '../../../../lib/prisma';
import {z} from 'zod'

const placeOrderSchema=z.object({
    userId:z.string().min(1),
    addressId:z.string().min(1),
    couponCode:z.string().optional().nullable(),
    notes:z.string().optional().nullable(),
    shippingAmount:z.number().min(0).default(0),
    taxAmount:z.number().min(0).default(0),
});

export async function POST(req) {
  try {
    const body = await req.json();

    const parsed = placeOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      userId,
      addressId,
      couponCode,
      notes,
      shippingAmount,
      taxAmount,
    } = parsed.data;

    const userExist = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExist) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const addressExist = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!addressExist) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                discountPrice: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    for (const item of cartItems) {
      if (
        !item.productVariant.product.isActive ||
        !item.productVariant.isActive
      ) {
        return NextResponse.json(
          {
            error: `Product ${item.productVariant.product.name} is not available`,
          },
          { status: 400 }
        );
      }

      if (item.productVariant.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${item.productVariant.product.name}`,
          },
          { status: 400 }
        );
      }
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const unitPrice =
        (item.productVariant.product.discountPrice ??
          item.productVariant.product.basePrice) +
        item.productVariant.extraPrice;

      return sum + unitPrice * item.quantity;
    }, 0);

    let couponId = null;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (!coupon || !coupon.isActive) {
        return NextResponse.json(
          { error: "Invalid or inactive coupon code" },
          { status: 400 }
        );
      }

      if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        return NextResponse.json(
          { error: "Coupon has expired" },
          { status: 400 }
        );
      }

      if (
        coupon.minOrderAmount &&
        subtotal < coupon.minOrderAmount
      ) {
        return NextResponse.json(
          {
            error: `Minimum order amount is ${coupon.minOrderAmount}`,
          },
          { status: 400 }
        );
      }

      couponId = coupon.id;

      discountAmount =
        coupon.discountType === "percentage"
          ? (subtotal * coupon.discountValue) / 100
          : coupon.discountValue;
    }

    const totalAmount =
      subtotal -
      discountAmount +
      shippingAmount +
      taxAmount;

    const orderItemsData = cartItems.map((item) => {
      const unitPrice =
        (item.productVariant.product.discountPrice ??
          item.productVariant.product.basePrice) +
        item.productVariant.extraPrice;

      return {
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          couponId,
          notes: notes ?? null,
          subtotal,
          discountAmount,
          shippingAmount,
          taxAmount,
          totalAmount,
          status: "pending",
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
          address: true,
          coupon: {
            select: {
              code: true,
              discountType: true,
              discountValue: true,
            },
          },
        },
      });

      for (const item of cartItems) {
        await tx.productVariant.update({
          where: {
            id: item.productVariantId,
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cart.deleteMany({
        where: {
          userId,
        },
      });

      return newOrder;
    });

    return NextResponse.json(
      {
        message: "Order placed successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to place order",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            include: {
              productVariant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { imageUrl: true },
                      },
                    },
                  },
                  size: { select: { name: true } },
                  color: { select: { name: true, hexCode: true } },
                },
              },
            },
          },
          address: true,
          coupon: { select: { code: true } },
          payment: {
            select: {
              status: true,
              method: true,
              transactionId: true,
              paidAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}