import User from "../models/user_model.js";
import bcrypt from 'bcryptjs'
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

export const signUp = async (req, res) => {
    try {

        const { fullName, email, password, mobile, role } = req.body;


        if (!email || !password || !fullName || !mobile || !role) {



            return res.status(400).json({ message: "All Fields are mandatory" });




        }
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "User already Exists" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "password must be atleast six characters" });
        }
        if (mobile.length < 10) {
            return res.status(400).json({ message: "mobile number must be 10 digits" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(hashedPassword);

        user = await User.create({
            fullName,
            email,
            mobile,
            role,
            password: hashedPassword
        });

        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true

        });

        return res.status(201).json(user);





    } catch (error) {

        return res.status(500).json(`sign up error ${error}`);

    }
}

export const signIn = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({ message: "All Fields are mandatory" });

        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User does not Exists" });
        }


        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Credentials" });

        }



        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true

        });

        return res.status(200).json(user);





    } catch (error) {

        return res.status(500).json(`sign In error ${error}`);

    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Sign out done successfully" });

    } catch (error) {
        return res.status(500).json(`sign out error ${error}`);


    }

}


export const sendOtp = async (req, res) => {
    try {

        const { email } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not Exists" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;

        await user.save();
        await sendOtpMail(email, otp);

        return res.status(200).json({ message: "OTP Sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: `send otp error ${error}` });

    }
}

export const verifyOtp = async (req, res) => {

    try {
        const { email, otp } = req.body;
        let user = await User.findOne({ email });
        if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid / Expired OTP" });
        }

        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;

        await user.save();

        return res.status(200).json({ message: "OTP Verified Successfully" })






    } catch (error) {
        return res.status(400).json({ message: `verify otp error : ${error}` });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: "Please enter your password" });
        }


        let user = await User.findOne({ email });
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "OTP verification required" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(hashedPassword);

        user.password = hashedPassword;
        user.isOtpVerified = false;

        await user.save();
        return res.status(200).json({ message: "Password reset is Successfull" })




    } catch (error) {
        return res.status(400).json({ message: `Reset password error : ${error}` });
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile, role } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                fullName, email, mobile, role
            });

        }
        const token = await genToken(user._id);
        res.cookie("token", token, {
          secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true

        });
        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({ message: `Google Authentication error : ${error}` });
    }
}
