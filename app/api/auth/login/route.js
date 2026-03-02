import {NextResponse} from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken, refreshCookieOptions } from "../../../../lib/jwt";
import { sign } from "crypto";
import { refresh } from "next/cache";

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
            where:{email:email.toLowerCase().trim()}
        });
        if(!existingUser){
            return NextResponse.json({success:false,message:"Invalid email or password"},{status:401});
        }
        const passwordMatch=await bcrypt.compare(password,existingUser.passwordHash);
        if(!passwordMatch)
        {
            return NextResponse.json({success:false,message:"Invalid email or password"},{status:401});
        }

        const accessToken=signAccessToken(existingUser);
        const refreshToken=signRefreshToken(existingUser);

        const response=NextResponse.json({success:true,accessToken},{status:200});
        response.cookies.set("refreshToken",refreshToken,refreshCookieOptions);
        return response;
    } catch (error) {
        console.error("Login error:",error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
        
    }
}