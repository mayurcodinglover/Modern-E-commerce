import nodemailer from "nodemailer"

const transporter=nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.PORT,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
})
