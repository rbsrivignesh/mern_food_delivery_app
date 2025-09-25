import React, { useRef, useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';

const CreateEditShop = () => {
    const navigate = useNavigate();
    const { myShopData } = useSelector(state => state.owner);
    const { currentCity,currentState,currentAddress } = useSelector(state => state.user);


    const [name, setName] = useState(myShopData?.name || "");
    const [address, setAddress] = useState(myShopData?.address || currentAddress);
    const [City, setCity] = useState(myShopData?.city || currentCity);
    const [State, setState] = useState(myShopData?.state || currentState);

    const [frontEndImage,setFrontEndImage] = useState(myShopData?.image || null);
    const [backEndImage,setBackEndImage] = useState(null);
    const [loading, setLoading] = useState(false)
    const handleImage =  (e)=>{
        const file = e.target.files[0];
        setBackEndImage(file);
        setFrontEndImage(URL.createObjectURL(file));
    }

    const dispatch = useDispatch();
    const handleSubmit = async(e)=>{
        e.preventDefault();
        try {
            setLoading(true)
            const formData = new FormData();
            formData.append("name",name);
            formData.append("city",City);
            formData.append("state",State);
            formData.append("address",address);
            if(backEndImage){
                formData.append("image",backEndImage);
            }
            const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData,{withCredentials: true});

            dispatch(setMyShopData(result.data));
            console.log(result.data);
              setLoading(true)
              navigate("/")


            
        } catch (error) {
            console.log(error)
              setLoading(true)
            
        }

    }

  
   
    return (
        <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen'
        >

            <div className='absolute top-[20px] left-[20px] z-[10] mb-[10px]'>

                <FaArrowLeft onClick={() => navigate("/")} size={35} className='text-[#ff4d2d]' />
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-orange-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#ff4d2d] w-16 h-16' />
                    </div>
                    <div className='text-3xl font-extrabold text-gray-900'>
                        {myShopData ? "Edit Shop" : "Add Shop"}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className='space-y-5' >
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                            <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full px-4 py-2 border rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-orange-500' type="text" placeholder='Enter Shop Name' />
                        
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Shop Image</label>
                            <input className='w-full px-4 py-2 border rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-orange-500' type="file" accept='image/*' placeholder='Choose shop image' onChange={handleImage} />
            {frontEndImage && 
            
                            <div className='mt-4'>
                                <img src={frontEndImage} className='w-full h-48 object-cover rounded-lg border' alt="" />
                            </div>}
                        
                    </div>
                   <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>City</label>
                            <input onChange={(e)=>setCity(e.target.value)} value={City} className='w-full px-4 py-2 border rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-orange-500' type="text" placeholder=' City' />
                        
                    </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>State</label>
                            <input onChange={(e)=>setState(e.target.value)} value={State} className='w-full px-4 py-2 border rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-orange-500' type="text" placeholder='State' />
                        
                    </div>
                    
                   </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                            <input onChange={(e)=>setAddress(e.target.value)} value={address} className='w-full px-4 py-2 border rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-orange-500' type="text" placeholder='Enter shop address' />
                        
                    </div>
                    <button className=' w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer' disabled={loading}>
                       {loading? <ClipLoader size={20} color='white'/> : "Save"} 
                    </button>

                </form>

            </div>


        </div>
    )
}

export default CreateEditShop