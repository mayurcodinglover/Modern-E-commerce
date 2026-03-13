import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request)
{
    try {
        const {searchParams}=new URL(request.url);
        const token=searchParams.get("token");

        if(!token)
        {
            return NextResponse.json({success:false,message:"Token is missing"},{status:400});
        }
        const user=await prisma.user.findFirst({
            where:{emailVerificationToken:token},
        });
        if(!user)
        {
            return NextResponse.json({success:false,message:"Invalid token"},{status:400});
        }
        if(user.emailVerified)
        {
            return NextResponse.json({success:false,message:"Email Already Verified"},{status:400})
        }
        if(new Date() > new Date(user.emailVerificationExpiresAt))
        {
            return NextResponse.json({success:false,message:"Token Expired Please request a new Verification Email"},{status:410})
        }
        await prisma.user.update({
            where:{id:user.id},
            data:{
                 emailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpiresAt: null,
            },
        })
        return NextResponse.json({success:true,message:"Email Verified successfully Now You can Login."},{status:200});
    } catch (error) {
        console.error("Verify Email Error",error)
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}