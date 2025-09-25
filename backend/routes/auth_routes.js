import express, { Router } from 'express'
import { googleAuth, resetPassword, sendOtp, sendOtpMails, signIn, signOut, signUp, verifyOtp } from '../controllers/auth_controller.js';

const authRouter = express.Router();


authRouter.post("/signup",signUp);
authRouter.post("/signin",signIn);
authRouter.get("/logout",signOut);
authRouter.post("/send-otp",sendOtp);
authRouter.post("/send-otps",sendOtpMails);
authRouter.post("/verify-otp",verifyOtp);
authRouter.post("/reset-password",resetPassword);
authRouter.post("/google-auth",googleAuth);

export default authRouter
