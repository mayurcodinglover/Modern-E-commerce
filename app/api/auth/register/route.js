import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { refreshCookieOptions, signAccessToken, signRefreshToken } from "../../../../lib/jwt";

export async function POST(request){
    try {
        const body=await request.json();
        const {firstName,lastName,email,password}=body;

        //Input Validation
        if(!firstName || !lastName || !email || !password)
        {
            return NextResponse.json({success:false,message:"All fields are required"},{status:400});
        }

        if(typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        {
            return NextResponse.json({success:false,message:"Invalid email format"},{status:400});
        }

        if(password.length <6)
        {
            return NextResponse.json({success:false,message:"Passwrord must be at least 6 characters"},{status:400});
        }

        //Check Duplicate Email in the Database
        const existingUser=await prisma.user.findUnique({
            where:{email:email.toLowerCase().trim()},
        });
        if(existingUser)
        {
            return NextResponse.json({success:false,message:"Email already in use"},{status:409});
        }
        //Hash the Password
        const passwordHash=await bcrypt.hash(password,10);

        const defaultRole=await prisma.role.findUnique({
            where:{name:"user"}
        });
        if(!defaultRole)
        {
            return NextResponse.json({success:false,message:"Default role not found"},{status:500});
        }

        //create User
        const User=await prisma.user.create({
            data:{
                firstName:firstName.trim(),
                lastName:lastName.trim(),
                email:email.toLocaleLowerCase().trim(),
                passwordHash,
                roleId:defaultRole.id,
            },
            select:{
                id:true,
                firstName:true,
                lastName:true,
                email:true,
                emailVerified:true,
                isActive:true,
                createdAt:true,
                role:{
                    select:{
                        name:true
                    }
                }
            },
        });

        const tokenPayload={
            id:User.id,
            email:User.email,
            role:User.role.name,
        };

        const accessToken=signAccessToken(tokenPayload);

        const refreshToken=signRefreshToken({id:User.id});

        const response=NextResponse.json({
            success:true,
            message:"User registered successfully",
           data:{
            User,
            accessToken,
           },
        },{status:201});

        response.cookies.set("refreshToken",refreshToken,refreshCookieOptions);

        return response;
    } catch (error) {
        console.error("Registration error:",error);
        return NextResponse.json({success:false,message:"Internal Server Error"},{status:500});
    }
}