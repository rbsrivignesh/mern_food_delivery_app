import React, { useState } from 'react'
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import {ClipLoader } from 'react-spinners'
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

const SignUp = () => {

    const primaryColor = "#ff4d2d";
    const hoverColor = "#e64323"
    const bgColor = "#fff9f6"
    const borderColor = "#ddd"
    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState("user");
    const navigate = useNavigate();
    const [fullName, setFullName ] = useState("")
    const [email, setEmail ] = useState("")
    const [password, setPassword ] = useState("")
    const [mobile, setMobile ] = useState("")
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch();

    const handleSignUp = async()=>{
        setLoading(true)
        try {
            
            const result = await axios.post(`${serverUrl}/api/auth/signup`, {
                fullName,email, password,mobile, role
            }, {withCredentials: true})

           dispatch(setUserData(result.data));
            setLoading(false)
            setError("");
        } catch (error) {
           setError(error?.response?.data?.message);
            console.log(error)
              setLoading(false)
            
        }
    }

    const handleGoogleAuth = async()=>{
        setLoading(true)
        try {
            if(!mobile){
                return setError("Mobile no is required");
            }
            const provider = new GoogleAuthProvider();
            const results = await signInWithPopup(auth,provider);
            console.log(results);
            const {data} = await axios.post(`${serverUrl}/api/auth/google-auth`,{
                fullName : results.user.displayName,
                email : results.user.email,
                mobile, 
                role
            
            },{
                withCredentials:true
            });

              dispatch(setUserData(data));
            

            setLoading(false)
            console.log(data)

            
          } catch (error) {
            console.log(error)
              setLoading(false)
            
        }}

    
  
    return (
        <div className='min-h-screen flex items-center justify-center p-4 w-full' style={{ backgroundColor: bgColor }} >
            <div
                className={`bg-white rounded-xl shadow-lg w-full max-w-md p-8 `} style={{ border: `1px solid ${borderColor}` }}

            >
                <h1 className={`text-3xl font-bold mb-2`} style={{ color: primaryColor }}>Vingo</h1>
                <p className='text-gray-600 mb-8'>Create your account to get started with delicious food</p>

                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1' htmlFor="fullname">Full Name</label>
                    <input required id='fullname' value={fullName} onChange={(e)=> setFullName(e.target.value)} className='w-full border rounded-lg px-3 py-2 focus:outline-none ' type="text" placeholder='Enter your full name' style={{ border: `1px solid ${borderColor}` }} />


                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1' htmlFor="email">Email</label>
                    <input required  id='email' value={email} onChange={(e)=> setEmail(e.target.value)} className='w-full border rounded-lg px-3 py-2 focus:outline-none ' type="email" placeholder='Enter your email' style={{ border: `1px solid ${borderColor}` }} />


                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1' htmlFor="mobile">mobile</label>
                    <input required  id='mobile' value={mobile} onChange={(e)=> setMobile(e.target.value)} className='w-full border rounded-lg px-3 py-2 focus:outline-none ' type="text" placeholder='Enter your mobile number' style={{ border: `1px solid ${borderColor}` }} />


                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1' htmlFor="password">password</label>
                    <div className='relative'>
                        <input required  id='password' value={password} onChange={(e)=> setPassword(e.target.value)} className='w-full border rounded-lg px-3 py-2 focus:outline-none ' type={showPassword ? "text" : "password"} placeholder='Enter your password' style={{ border: `1px solid ${borderColor}` }} />
                        <button onClick={() => setShowPassword(prev => !prev)} className='cursor-pointer absolute right-3 top-[14px] text-gray-500'>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>


                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 font-medium mb-1' htmlFor="role">Role</label>
                    <div className='flex gap-2'>
                        {["user", "owner", "deliveryBoy"].map((r) => (
                            <button className='flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer' onClick={() => setRole(r)} style={
                                role === r ?
                                    { backgroundColor: primaryColor, color: 'white' } :
                                    { border: `1px solid ${primaryColor}`, color: '#333' }


                            }>{r}</button>
                        ))}
                    </div>





                </div>
                        
                       
                <button onClick={handleSignUp} className={`w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer `} >
                    
                  {
                            loading ? <ClipLoader color = 'white' size={20}/> :  "Sign Up" }</button>
                
{ error && 

                <p className='text-red-500 text-center my-[10px]'>*{error}</p>
}

                <button onClick={handleGoogleAuth} className=' cursor-pointer w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2  transition duration-200 border-gray-400 hover:bg-gray-200'><FcGoogle size={20}/><span>Sign Up With Google</span></button>
                <p onClick={()=> navigate("/signin")} className='text-center cursor-pointer mt-2'>Already have an account ? 
                <span className='text-[#ff4d2d]'> Sign In</span></p>
                


            </div>


        </div>
    )
}

export default SignUp