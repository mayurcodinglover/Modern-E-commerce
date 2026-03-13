import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { sendVerificationEmail } from "../../../../lib/email";
import crypto from "crypto"

export async function POST(request){
    try {
        const {email}=await request.json();
        if(!email)
        {
            return NextResponse.json({success:false,message:"Email is required"},{status:400});
        }
        const user=await prisma.user.findUnique({where:{email:email.toLowerCase().trim()}});
        if(!user || user.emailVerified){
            return NextResponse.json({success:false,message:"If this email exists and is unverified then  a new link has been sent"},{status:200});
        }
        //rate limit block if last token was sent less than 1 minute ago
        const oneMinuteAgo=new Date(Date.now()-60*1000);
        if(user.emailVerificationExpiresAt){
            const tokenCreatedApprox=new Date(user.emailVerificationExpiresAt-24*60*60*1000);
            if(tokenCreatedApprox>oneMinuteAgo){
                return NextResponse.json({
                    success:false,
                    message:"Plelase wait 1 Minute before requasting another email"
                },{status:429})
            }
        }

        const newToken=crypto.randomBytes(32).toString("hex");
        const newExpiry=new Date(Date.now()+24*60*60*1000);

        await prisma.user.update({
            where:{id:user.id},
            data:{
                 emailVerificationToken: newToken,
                emailVerificationExpiresAt: newExpiry,
            }
        });

        sendVerificationEmail(user.email,user.firstName,newToken).catch((err)=>console.error("Resend Email Failed",err));

        return NextResponse.json({success:true,message:"If this email exist and is unverified a new link has been sent"},{status:200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}