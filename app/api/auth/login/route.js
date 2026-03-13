import {NextResponse} from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken, refreshCookieOptions } from "../../../../lib/jwt";

export async function POST(request){
    try {
        const body=await request.json();
        const {email,password}=body

        //Input Validation
        if(!email || !password)
        {
            return NextResponse.json({success:false,message:"Email and password are required"},{status:400});
        }
        if(typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        {
            return NextResponse.json({success:false,message:"Invalid email format"},{status:400});
        }

        const existingUser=await prisma.user.findUnique({
            where:{email:email.toLowerCase().trim()},
            select:{
                id:true,
                firstName:true,
                lastName:true,
                email:true,
                passwordHash:true,
                isActive:true,
                emailVerified:true,
                profileImageUrl:true,
                createdAt:true,
                role:{select:{name:true}}
            }
        });
        if(!existingUser){
            return NextResponse.json({success:false,message:"Invalid email or password"},{status:401});
        }
        if(!existingUser.isActive)
        {
            return NextResponse.json({success:false,message:"Your account has been deactivated Please contact Support"},{status:403})
        }
        const passwordMatch=await bcrypt.compare(password,existingUser.passwordHash);
        if(!passwordMatch)
        {
            return NextResponse.json({success:false,message:"Invalid email or password"},{status:401});
        }
        if(!existingUser.emailVerified)
        {
            return NextResponse.json({success:false,message:"Please verify your email before logging in. Check your inbox."},{status:403});
        }
        const tokenPayload={
            id:existingUser.id,
            email:existingUser.email,
            role:existingUser.role.name
        }
        const accessToken=signAccessToken(tokenPayload);
        const refreshToken=signRefreshToken({id:existingUser.id});

        const response=NextResponse.json({success:true,accessToken},{status:200});
        response.cookies.set("refreshToken",refreshToken,refreshCookieOptions);
        return response;
    } catch (error) {
        console.error("Login error:",error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}