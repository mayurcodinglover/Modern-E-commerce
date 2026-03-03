import { NextResponse } from "next/server";

import { verifyRefreshToken, signAccessToken, refreshCookieOptions, signRefreshToken } from "../../../../lib/jwt";

export async function POST(request){
    try{
        const refreshToken=request.cookies.get("refreshToken")?.value;
        if(!refreshToken)
        {
            return NextResponse.json({success:false,message:"Refresh token missing"},{status:401});
        }

        let decoded;
        try {
            decoded=verifyRefreshToken(refreshToken);
        } catch (error) {
            const message=error.name==="TokenExpiredError" ? "Refresh token expired Please login again" : "Invalid refresh token Please login again";
            const response=NextResponse.json({success:false,message},{status:401});
            response.cookies.delete("refreshToken",refreshCookieOptions);
            return response;
        }
        const user=await prisma.user.findUnique({where:{id:decoded.id},select:{
            id:true,
            email:true,
            isActive:true,
            role:{select:{name:true}},
        }});

        if(!user || !user.isActive)
        {
            const response=NextResponse.json({success:false,message:"User Not found or account deactivated Please log in again"})
            response.cookies.delete("refreshToken");
            return response;
        }
        const tokenPayload={
            id:user.id,
            email:user.email,
            role:user.role.name
        }
        const newAccessToken=signAccessToken(tokenPayload);
        const newRefreshToken=signRefreshToken({id:user.id});

        const response=NextResponse.json({
            success:true,
            message:"Token refreshed successfully",
            data:{
                accessToken:newAccessToken
            }
        },{status:200});

        response.cookies.set("refreshToken",newRefreshToken,refreshCookieOptions);
        return response;
    }
    catch(error)
    {
        console.error("Internal server Error",error);
        return NextResponse.json({success:false,message:"Internal server Error"},{status:500});
    }
}