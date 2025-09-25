import axios from 'axios';
import React, { useState } from 'react'
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { ClipLoader } from 'react-spinners';

const ForgotPassword = () => {

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [otp, setOtp] = useState("")
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        try {

            setLoading(true)
            const result = await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true });
            console.log(result);
            setStep(2);
            setError("");
            setLoading(false)

        } catch (error) {
            setError(error?.response?.data?.message);
            console.log(error)
            setLoading(false)

        }
    }

    const handleVerifyOtp = async () => {
        try {

            setLoading(true)
            const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });
            console.log(result);
            setStep(3);
            setError("")
            setLoading(false)

        } catch (error) {
            setError(error?.response?.data?.message);
            console.log(error)
            setLoading(false)

        }
    }

    const handleResetPassword = async () => {


        if (newPassword != confirmPassword || !newPassword) {
            setLoading(false)
            setError("Passwords dont match")
            return null;
        }
        try {
            setLoading(true)

            const result = await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true });
            console.log(result);
            navigate("/signin")
            setError("")
            setLoading(false)

        } catch (error) {
            setError(error?.response?.data?.message);
            console.log(error)
            setLoading(false)

        }
    }
    return (
        <div className='flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]'
        >
            <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8'>

                <div onClick={() => navigate("/signin")} className='flex items-center gap-4 mb-4'>
                    <IoMdArrowBack size={30} className='text-[#ff4d2d]' />

                    <h1 className='text-[#ff4d2d] text-2xl font-bold text-center '>Forgot Password</h1>
                </div>

                {step === 1 &&
                    <div>


                        <div className='mb-6'>
                            <label className='block text-gray-700 font-medium mb-1' htmlFor="emails">Email</label>
                            <input id='emails' value={email} onChange={(e) => setEmail(e.target.value)} className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none ' type="email" placeholder='Enter your email' />


                        </div>

                        <button onClick={handleSendOtp} className={`w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer `} >{
                            loading ? <ClipLoader color = 'white' size={20} /> : "Send OTP"}</button>
                        {error &&

                            <p className='text-red-500 text-center my-[10px]'>*{error}</p>
                        }

                    </div>}

                {step === 2 &&
                    <div>


                        <div className='mb-6'>
                            <label className='block text-gray-700 font-medium mb-1' htmlFor="otp">Enter OTP</label>
                            <input id='otp' value={otp} onChange={(e) => setOtp(e.target.value)} className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none ' type="number" placeholder='Enter your OTP' />


                        </div>

                        <button onClick={handleVerifyOtp} className={`w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer `} >{
                            loading ? <ClipLoader color = 'white' size={20} /> : "Verify"}</button>
                        {error &&

                            <p className='text-red-500 text-center my-[10px]'>*{error}</p>
                        }

                    </div>}


                {step === 3 &&
                    <div>


                        <div className='mb-6'>
                            <label className='block text-gray-700 font-medium mb-1' htmlFor="newpassword">New Password</label>
                            <input id='newpassword' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none ' type="password" placeholder='Enter new password' />


                        </div>
                        <div className='mb-6'>
                            <label className='block text-gray-700 font-medium mb-1' htmlFor="newpassword">Confirm Password</label>
                            <input id='newpassword' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none ' type="password" placeholder='Enter confirm password' />


                        </div>

                        <button onClick={handleResetPassword} className={`w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer `} >{
                            loading ? <ClipLoader color = 'white' size={20} /> : "Reset Password"}</button>
                        {error &&

                            <p className='text-red-500 text-center my-[10px]'>*{error}</p>
                        }
                    </div>}

            </div>




        </div>
    )
}

export default ForgotPassword