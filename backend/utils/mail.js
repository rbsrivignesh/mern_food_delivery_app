import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
});

export const sendOtpMail = async (to, otp) => {

    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "Reset Your Password",
        html: `<p> your otp for password reset is <b>${otp}</b>. It expires in 5 minutes . </p>`

    })

}
export const sendDeliveryOtpMail = async (email, otp) => {
    console.log("sendotpworks")
    console.log(email)
    console.log(otp)

    await transporter.sendMail({
        from: process.env.EMAIL,
        to : email,
        subject: "Your OTP for delivery",
        html: `<p> your otp for delivery is <b>${otp}</b>. It expires in 5 minutes . </p>`

    })

}
