import jwt from "jsonwebtoken";

const Access_Secret=process.env.JWT_ACCESS_SECRET;
const Refresh_Secret=process.env.JWT_REFRESH_SECRET;
const Access_Expiration=process.env.JWT_ACCESS_EXPIRATION || "15m";
const Refresh_Expiration=process.env.JWT_REFRESH_EXPIRATION || "7d";


export const signAccessToken=(payLoad)=>{
    if(!Access_Secret) throw new Error("Access secret not defined");
    return jwt.sign(payLoad,Access_Secret,{expiresIn:Access_Expiration});
}

export const signRefreshToken=(payLoad)=>{
    if(!Refresh_Secret) throw new Error("Refresh secret not defined");
    return jwt.sign(payLoad,Refresh_Secret,{expiresIn:Refresh_Expiration});
}

export const verifyAccessToken=(token)=>{
    if(!Access_Secret) throw new Error("Access secret not defined");
    return jwt.verify(token,Access_Secret);
}

export const verifyRefreshToken=(token)=>{
    if(!Refresh_Secret) throw new Error("Refresh secret not defined");
    return jwt.verify(token,Refresh_Secret);
}

const isProd=process.env.NODE_ENV==="production";

export const refreshCookieOptions={
    httpOnly:true,
    secure:isProd,
    sameSite:"strict",
    path:"/api/auth",
    maxAge:7*24*60*60, // 7 days
};