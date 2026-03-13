import nodemailer from "nodemailer"

const transporter=nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
})

export async function sendVerificationEmail(email,firstName,token){
    const verifyUrl=`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
        from:`"MyShop" <no-reply@myshop.com>`,
        to:email,
        subject:"Verify Your email address",
        html:`
         <h2>Hi ${firstName},</h2>
            <p>Thanks for registering! Please verify your email by clicking the button below.</p>
            <a href="${verifyUrl}" style="
                background:#4F46E5;
                color:white;
                padding:12px 24px;
                border-radius:6px;
                text-decoration:none;
                display:inline-block;
            ">Verify Email</a>
            <p>This link expires in <strong>24 hours</strong>.</p>
            <p>If you didn't create an account, ignore this email.</p>`
    });
}