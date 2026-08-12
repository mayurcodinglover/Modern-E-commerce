import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    const since = new Date(); since.setMonth(since.getMonth() - 11); since.setDate(1); since.setHours(0, 0, 0, 0);
    const [orders, users, products, reviews] = await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, totalAmount: true, status: true, items: { select: { quantity: true, productVariant: { select: { product: { select: { name: true } } } } } } } }),
      prisma.user.count(), prisma.product.count({ where: { isActive: true } }), prisma.review.count(),
    ]);
    const months = Array.from({ length: 12 }, (_, index) => { const date = new Date(since); date.setMonth(since.getMonth() + index); return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleString("en-IN", { month: "short" }), revenue: 0, orders: 0 }; });
    const status = {};
    const top = {};
    for (const order of orders) { const month = months.find((item) => item.key === `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`); if (month) { month.orders++; month.revenue += Number(order.totalAmount); } status[order.status] = (status[order.status] || 0) + 1; for (const item of order.items) { const name = item.productVariant.product.name; top[name] = (top[name] || 0) + item.quantity; } }
    return NextResponse.json({ success: true, data: { months: months.map(({ label, revenue, orders }) => ({ label, revenue: Math.round(revenue), orders })), status, topProducts: Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, quantity]) => ({ name, quantity })), totals: { users, products, reviews, revenue: Math.round(orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)), orders: orders.length } } });
  } catch (error) { console.error("Analytics error", error); return NextResponse.json({ success: false, message: "Failed to load analytics" }, { status: 500 }); }
}
