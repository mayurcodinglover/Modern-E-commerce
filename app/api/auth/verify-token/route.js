import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Token missing",
                },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];

        // Verify JWT
        const payload = verifyAccessToken(token);

        // Check database
        const user = await prisma.user.findUnique({
            where: {
                id: payload.id,
            },
            select: {
                id: true,
                isActive: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Account deactivated",
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid or expired token",
            },
            { status: 401 }
        );
    }
}