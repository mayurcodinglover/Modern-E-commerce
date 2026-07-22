import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import cuid from "cuid";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const passwordHash =
  "$2a$10$ObZ2WCMKqKsJE4fHEQIGz.8yNoQPmf6EJexBImdhqNOGledE06HdC";

const roles = ["admin", "user"];

const users = [
  {
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
  },
  {
    email: "shalini@example.com",
    firstName: "Shalini",
    lastName: "Kapoor",
    role: "user",
    profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
  },
  {
    email: "rahul@example.com",
    firstName: "Rahul",
    lastName: "Mehta",
    role: "user",
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
  },
  {
    email: "aisha@example.com",
    firstName: "Aisha",
    lastName: "Khan",
    role: "user",
    profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
  },
];

const catalog = [
  {
    name: "Ethnic Wear",
    slug: "ethnic-wear",
    description: "Festive kurtas, sarees, lehengas, and everyday Indian wear.",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&h=700&fit=crop",
    subcategories: [
      { name: "Kurtas", slug: "kurtas" },
      { name: "Sarees", slug: "sarees" },
      { name: "Lehengas", slug: "lehengas" },
    ],
  },
  {
    name: "Western Wear",
    slug: "western-wear",
    description: "Dresses, co-ords, tops, denim, and smart casual styles.",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=700&fit=crop",
    subcategories: [
      { name: "Dresses", slug: "dresses" },
      { name: "Tops", slug: "tops" },
      { name: "Jeans", slug: "jeans" },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Jewellery, handbags, footwear, and finishing touches.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&h=700&fit=crop",
    subcategories: [
      { name: "Jewellery", slug: "jewellery" },
      { name: "Bags", slug: "bags" },
      { name: "Footwear", slug: "footwear" },
    ],
  },
];

const sizes = ["XS", "S", "M", "L", "XL", "Free Size"];

const colors = [
  { name: "Ivory", hexCode: "#F8F1E7" },
  { name: "Rose Pink", hexCode: "#D96C8C" },
  { name: "Emerald", hexCode: "#0F8A5F" },
  { name: "Indigo", hexCode: "#283593" },
  { name: "Maroon", hexCode: "#7B1E3A" },
  { name: "Black", hexCode: "#111827" },
  { name: "Tan", hexCode: "#B7791F" },
];

const products = [
  {
    name: "Aarohi Embroidered Kurta Set",
    title: "Soft cotton kurta set with delicate thread embroidery",
    description:
      "A breathable three-piece kurta set with tonal embroidery, straight pants, and a light dupatta. Designed for festive office days and relaxed family gatherings.",
    categorySlug: "ethnic-wear",
    subcategorySlug: "kurtas",
    basePrice: 3299,
    discountPrice: 2799,
    images: [
      "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&h=1100&fit=crop",
    ],
    variants: [
      { size: "S", color: "Ivory", stock: 18, extraPrice: 0 },
      { size: "M", color: "Rose Pink", stock: 24, extraPrice: 0 },
      { size: "L", color: "Emerald", stock: 14, extraPrice: 150 },
    ],
  },
  {
    name: "Noor Silk Blend Saree",
    title: "Lightweight silk blend saree with zari border",
    description:
      "A graceful drape with a subtle sheen and detailed zari edging. Includes blouse fabric and works beautifully for weddings, receptions, and puja looks.",
    categorySlug: "ethnic-wear",
    subcategorySlug: "sarees",
    basePrice: 5499,
    discountPrice: 4699,
    images: [
      "https://images.unsplash.com/photo-1610189011646-88e9b2fcf8d1?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=900&h=1100&fit=crop",
    ],
    variants: [
      { size: "Free Size", color: "Maroon", stock: 12, extraPrice: 0 },
      { size: "Free Size", color: "Indigo", stock: 9, extraPrice: 0 },
    ],
  },
  {
    name: "Mira Floral Midi Dress",
    title: "Flowy floral midi dress with tie waist",
    description:
      "A flattering day-to-evening dress with soft lining, a relaxed sleeve, and an adjustable waist tie for an easy custom fit.",
    categorySlug: "western-wear",
    subcategorySlug: "dresses",
    basePrice: 2899,
    discountPrice: 2299,
    images: [
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&h=1100&fit=crop",
    ],
    variants: [
      { size: "XS", color: "Rose Pink", stock: 10, extraPrice: 0 },
      { size: "M", color: "Emerald", stock: 21, extraPrice: 0 },
      { size: "XL", color: "Black", stock: 7, extraPrice: 100 },
    ],
  },
  {
    name: "Everyday High Rise Jeans",
    title: "Stretch denim jeans with a tapered straight fit",
    description:
      "Comfortable high-rise denim with clean pockets and a modern tapered leg. Built for repeat wear without losing shape.",
    categorySlug: "western-wear",
    subcategorySlug: "jeans",
    basePrice: 2499,
    discountPrice: 1999,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=900&h=1100&fit=crop",
    ],
    variants: [
      { size: "S", color: "Indigo", stock: 16, extraPrice: 0 },
      { size: "M", color: "Indigo", stock: 20, extraPrice: 0 },
      { size: "L", color: "Black", stock: 11, extraPrice: 0 },
    ],
  },
  {
    name: "Pearl Drop Earrings",
    title: "Gold-tone pearl drop earrings for festive styling",
    description:
      "Lightweight statement earrings with pearl drops and a polished gold-tone finish. Comfortable enough for long events.",
    categorySlug: "accessories",
    subcategorySlug: "jewellery",
    basePrice: 899,
    discountPrice: 699,
    images: [
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=900&h=1100&fit=crop",
    ],
    variants: [
      { size: "Free Size", color: "Ivory", stock: 40, extraPrice: 0 },
      { size: "Free Size", color: "Tan", stock: 35, extraPrice: 0 },
    ],
  },
  {
    name: "Urban Sling Bag",
    title: "Compact structured sling bag with adjustable strap",
    description:
      "A compact sling bag with gold hardware, internal pockets, and a smooth adjustable strap for errands, brunch, and travel.",
    categorySlug: "accessories",
    subcategorySlug: "bags",
    basePrice: 1899,
    discountPrice: 1499,
    images: [
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=900&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&h=1100&fit=crop",
    ],
    variants: [
      { size: "Free Size", color: "Black", stock: 25, extraPrice: 0 },
      { size: "Free Size", color: "Tan", stock: 22, extraPrice: 100 },
    ],
  },
];

const coupons = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 999,
    maxUses: 200,
    usedCount: 18,
    expiresAt: new Date("2027-12-31T23:59:59.000Z"),
  },
  {
    code: "FESTIVE500",
    discountType: "fixed",
    discountValue: 500,
    minOrderAmount: 2999,
    maxUses: 80,
    usedCount: 11,
    expiresAt: new Date("2027-11-15T23:59:59.000Z"),
  },
  {
    code: "EXPIRED20",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 1999,
    maxUses: 50,
    usedCount: 50,
    isActive: false,
    expiresAt: new Date("2025-01-01T00:00:00.000Z"),
  },
];

function seededId(prefix: string, key: string) {
  return `seed_${prefix}_${key.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`;
}

async function resetGeneratedDemoData() {
  await prisma.review.deleteMany({ where: { id: { startsWith: "seed_" } } });
  await prisma.payment.deleteMany({ where: { id: { startsWith: "seed_" } } });
  await prisma.orderItem.deleteMany({ where: { id: { startsWith: "seed_" } } });
  await prisma.order.deleteMany({ where: { id: { startsWith: "seed_" } } });
  await prisma.cart.deleteMany({ where: { id: { startsWith: "seed_" } } });
  await prisma.whishlist.deleteMany({ where: { id: { startsWith: "seed_" } } });
}

async function main() {
  console.log("Seeding ecommerce demo data...");
  await resetGeneratedDemoData();

  const roleByName = new Map<string, { id: string }>();
  for (const name of roles) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { id: cuid(), name },
    });
    roleByName.set(name, role);
  }

  const userByEmail = new Map<string, { id: string }>();
  for (const demoUser of users) {
    const role = roleByName.get(demoUser.role);
    if (!role) throw new Error(`Role ${demoUser.role} was not seeded`);

    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        roleId: role.id,
        isActive: true,
        emailVerified: true,
        profileImageUrl: demoUser.profileImageUrl,
      },
      create: {
        id: cuid(),
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        email: demoUser.email,
        passwordHash,
        roleId: role.id,
        isActive: true,
        emailVerified: true,
        profileImageUrl: demoUser.profileImageUrl,
      },
    });
    userByEmail.set(demoUser.email, user);
  }

  const categoryBySlug = new Map<string, { id: string }>();
  const subcategoryBySlug = new Map<string, { id: string; categoryId: string }>();

  for (const item of catalog) {
    const category = await prisma.category.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        isActive: true,
      },
      create: {
        id: cuid(),
        name: item.name,
        slug: item.slug,
        description: item.description,
        imageUrl: item.imageUrl,
        isActive: true,
      },
    });
    categoryBySlug.set(item.slug, category);

    for (const subcategoryItem of item.subcategories) {
      const subcategory = await prisma.subcategory.upsert({
        where: { slug: subcategoryItem.slug },
        update: {
          name: subcategoryItem.name,
          categoryId: category.id,
          isActive: true,
        },
        create: {
          id: cuid(),
          name: subcategoryItem.name,
          slug: subcategoryItem.slug,
          categoryId: category.id,
          isActive: true,
        },
      });
      subcategoryBySlug.set(subcategoryItem.slug, subcategory);
    }
  }

  const sizeByName = new Map<string, { id: string }>();
  for (const name of sizes) {
    const size = await prisma.size.upsert({
      where: { name },
      update: {},
      create: { id: cuid(), name },
    });
    sizeByName.set(name, size);
  }

  const colorByName = new Map<string, { id: string }>();
  for (const colorItem of colors) {
    const color = await prisma.color.upsert({
      where: { name: colorItem.name },
      update: { hexCode: colorItem.hexCode },
      create: { id: cuid(), name: colorItem.name, hexCode: colorItem.hexCode },
    });
    colorByName.set(colorItem.name, color);
  }

  const productByName = new Map<string, { id: string; discountPrice: unknown; basePrice: unknown }>();
  const variantBySku = new Map<string, { id: string; productId: string }>();

  for (const productItem of products) {
    const category = categoryBySlug.get(productItem.categorySlug);
    const subcategory = subcategoryBySlug.get(productItem.subcategorySlug);
    if (!category || !subcategory) {
      throw new Error(`Missing category or subcategory for ${productItem.name}`);
    }

    const product = await prisma.product.upsert({
      where: { id: seededId("product", productItem.name) },
      update: {
        name: productItem.name,
        title: productItem.title,
        description: productItem.description,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        basePrice: productItem.basePrice,
        discountPrice: productItem.discountPrice,
        isActive: true,
      },
      create: {
        id: seededId("product", productItem.name),
        name: productItem.name,
        title: productItem.title,
        description: productItem.description,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        basePrice: productItem.basePrice,
        discountPrice: productItem.discountPrice,
        isActive: true,
      },
    });
    productByName.set(productItem.name, product);

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (const [index, imageUrl] of productItem.images.entries()) {
      await prisma.productImage.create({
        data: {
          id: seededId("image", `${productItem.name}-${index + 1}`),
          productId: product.id,
          imageUrl,
          altText: `${productItem.name} image ${index + 1}`,
          isPrimary: index === 0,
          displayOrder: index + 1,
        },
      });
    }

    for (const variantItem of productItem.variants) {
      const size = sizeByName.get(variantItem.size);
      const color = colorByName.get(variantItem.color);
      if (!size || !color) {
        throw new Error(`Missing size or color for ${productItem.name}`);
      }

      const sku = `${productItem.name
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .toUpperCase()}-${variantItem.size.replace(/\s+/g, "").toUpperCase()}-${variantItem.color
        .replace(/\s+/g, "")
        .toUpperCase()}`;

      const variant = await prisma.productVariant.upsert({
        where: { sku },
        update: {
          productId: product.id,
          sizeId: size.id,
          colorId: color.id,
          stockQuantity: variantItem.stock,
          extraPrice: variantItem.extraPrice,
          isActive: true,
        },
        create: {
          id: seededId("variant", sku),
          productId: product.id,
          sizeId: size.id,
          colorId: color.id,
          sku,
          stockQuantity: variantItem.stock,
          extraPrice: variantItem.extraPrice,
          isActive: true,
        },
      });
      variantBySku.set(sku, variant);
    }
  }

  const couponByCode = new Map<string, { id: string }>();
  for (const couponItem of coupons) {
    const coupon = await prisma.coupon.upsert({
      where: { code: couponItem.code },
      update: couponItem,
      create: { id: cuid(), isActive: true, ...couponItem },
    });
    couponByCode.set(couponItem.code, coupon);
  }

  const addressByKey = new Map<string, { id: string }>();
  const addresses = [
    {
      key: "shalini-home",
      email: "shalini@example.com",
      addressLine1: "A-120 Lakeview Residency",
      addressLine2: "Near Lotus Park",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560048",
      country: "India",
      isDefault: true,
    },
    {
      key: "rahul-home",
      email: "rahul@example.com",
      addressLine1: "42 Green Avenue",
      addressLine2: "Sector 18",
      city: "Gurugram",
      state: "Haryana",
      postalCode: "122015",
      country: "India",
      isDefault: true,
    },
    {
      key: "aisha-home",
      email: "aisha@example.com",
      addressLine1: "Flat 9C, Sea Breeze Towers",
      addressLine2: "Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400050",
      country: "India",
      isDefault: true,
    },
  ];

  for (const addressItem of addresses) {
    const user = userByEmail.get(addressItem.email);
    if (!user) throw new Error(`Missing user for ${addressItem.email}`);
    const address = await prisma.address.upsert({
      where: { id: seededId("address", addressItem.key) },
      update: {
        userId: user.id,
        addressLine1: addressItem.addressLine1,
        addressLine2: addressItem.addressLine2,
        city: addressItem.city,
        state: addressItem.state,
        postalCode: addressItem.postalCode,
        country: addressItem.country,
        isDefault: addressItem.isDefault,
      },
      create: {
        id: seededId("address", addressItem.key),
        userId: user.id,
        addressLine1: addressItem.addressLine1,
        addressLine2: addressItem.addressLine2,
        city: addressItem.city,
        state: addressItem.state,
        postalCode: addressItem.postalCode,
        country: addressItem.country,
        isDefault: addressItem.isDefault,
      },
    });
    addressByKey.set(addressItem.key, address);
  }

  const variantList = [...variantBySku.values()];
  await prisma.cart.createMany({
    data: [
      { id: seededId("cart", "shalini-1"), userId: userByEmail.get("shalini@example.com")!.id, productVariantId: variantList[0].id, quantity: 1 },
      { id: seededId("cart", "shalini-2"), userId: userByEmail.get("shalini@example.com")!.id, productVariantId: variantList[4].id, quantity: 2 },
      { id: seededId("cart", "rahul-1"), userId: userByEmail.get("rahul@example.com")!.id, productVariantId: variantList[8].id, quantity: 1 },
    ],
  });

  await prisma.whishlist.createMany({
    data: [
      { id: seededId("wishlist", "shalini-saree"), userId: userByEmail.get("shalini@example.com")!.id, productId: productByName.get("Noor Silk Blend Saree")!.id },
      { id: seededId("wishlist", "shalini-bag"), userId: userByEmail.get("shalini@example.com")!.id, productId: productByName.get("Urban Sling Bag")!.id },
      { id: seededId("wishlist", "rahul-dress"), userId: userByEmail.get("rahul@example.com")!.id, productId: productByName.get("Mira Floral Midi Dress")!.id },
      { id: seededId("wishlist", "aisha-earrings"), userId: userByEmail.get("aisha@example.com")!.id, productId: productByName.get("Pearl Drop Earrings")!.id },
    ],
  });

  const orders = [
    {
      key: "shalini-delivered",
      email: "shalini@example.com",
      addressKey: "shalini-home",
      status: "delivered",
      couponCode: "WELCOME10",
      paymentStatus: "paid",
      paymentMethod: "razorpay",
      items: [
        { variantIndex: 1, quantity: 1, unitPrice: 2799 },
        { variantIndex: 10, quantity: 1, unitPrice: 699 },
      ],
    },
    {
      key: "rahul-processing",
      email: "rahul@example.com",
      addressKey: "rahul-home",
      status: "processing",
      couponCode: "FESTIVE500",
      paymentStatus: "paid",
      paymentMethod: "upi",
      items: [
        { variantIndex: 3, quantity: 1, unitPrice: 4699 },
        { variantIndex: 13, quantity: 1, unitPrice: 1499 },
      ],
    },
    {
      key: "aisha-pending",
      email: "aisha@example.com",
      addressKey: "aisha-home",
      status: "pending",
      couponCode: null,
      paymentStatus: "pending",
      paymentMethod: "cod",
      items: [
        { variantIndex: 6, quantity: 1, unitPrice: 2299 },
        { variantIndex: 9, quantity: 1, unitPrice: 1999 },
      ],
    },
  ];

  for (const orderItem of orders) {
    const user = userByEmail.get(orderItem.email)!;
    const address = addressByKey.get(orderItem.addressKey)!;
    const subtotal = orderItem.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discountAmount = orderItem.couponCode === "WELCOME10" ? subtotal * 0.1 : orderItem.couponCode === "FESTIVE500" ? 500 : 0;
    const shippingAmount = subtotal > 2999 ? 0 : 99;
    const taxAmount = Math.round((subtotal - discountAmount) * 0.05);
    const totalAmount = subtotal - discountAmount + shippingAmount + taxAmount;

    const order = await prisma.order.create({
      data: {
        id: seededId("order", orderItem.key),
        userId: user.id,
        addressId: address.id,
        status: orderItem.status,
        subtotal,
        discountAmount,
        shippingAmount,
        taxAmount,
        totalAmount,
        couponId: orderItem.couponCode ? couponByCode.get(orderItem.couponCode)!.id : null,
        notes: "Demo order created by prisma seed.",
        items: {
          create: orderItem.items.map((item, index) => ({
            id: seededId("order_item", `${orderItem.key}-${index + 1}`),
            productVariantId: variantList[item.variantIndex].id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.payment.create({
      data: {
        id: seededId("payment", orderItem.key),
        orderId: order.id,
        userId: user.id,
        amount: totalAmount,
        currency: "INR",
        method: orderItem.paymentMethod,
        status: orderItem.paymentStatus,
        gateway: orderItem.paymentMethod === "cod" ? null : "razorpay",
        transactionId: orderItem.paymentStatus === "paid" ? `seed_txn_${orderItem.key}` : null,
        paidAt: orderItem.paymentStatus === "paid" ? new Date() : null,
      },
    });
  }

  await prisma.review.createMany({
    data: [
      {
        id: seededId("review", "shalini-kurta"),
        userId: userByEmail.get("shalini@example.com")!.id,
        productId: productByName.get("Aarohi Embroidered Kurta Set")!.id,
        orderId: seededId("order", "shalini-delivered"),
        rating: 5,
        title: "Beautiful fit and fabric",
        body: "The embroidery looks premium and the kurta is comfortable for all-day wear.",
        isVerified: true,
      },
      {
        id: seededId("review", "shalini-earrings"),
        userId: userByEmail.get("shalini@example.com")!.id,
        productId: productByName.get("Pearl Drop Earrings")!.id,
        orderId: seededId("order", "shalini-delivered"),
        rating: 4,
        title: "Lightweight and pretty",
        body: "Looks exactly like the photos and does not feel heavy.",
        isVerified: true,
      },
      {
        id: seededId("review", "rahul-saree"),
        userId: userByEmail.get("rahul@example.com")!.id,
        productId: productByName.get("Noor Silk Blend Saree")!.id,
        orderId: seededId("order", "rahul-processing"),
        rating: 5,
        title: "Great festive gift",
        body: "The zari border has a rich finish and the packing was neat.",
        isVerified: true,
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@example.com / password");
  console.log("Customer logins: shalini@example.com, rahul@example.com, aisha@example.com / password");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
