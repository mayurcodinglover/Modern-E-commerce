import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = {};
    for (const field of ["firstName", "lastName", "email", "roleId"]) {
      if (typeof body[field] === "string" && body[field].trim()) data[field] = body[field].trim();
    }
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (body.password?.trim()) data.passwordHash = await bcrypt.hash(body.password.trim(), 12);
    const user = await prisma.user.update({ where: { id }, data, include: { role: true } });
    const { passwordHash, emailVerificationToken, ...safeUser } = user;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    console.error("Admin user PUT error", error);
    return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const user = await prisma.user.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true, data: { id: user.id } });
  } catch (error) {
    console.error("Admin user DELETE error", error);
    return NextResponse.json({ success: false, message: "Failed to deactivate user" }, { status: 400 });
  }
}
