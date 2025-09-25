import React, { useEffect, useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';

import { ClipLoader } from 'react-spinners';

const EditItem = () => {
    const [currentItem, setCurrentItem]=useState(null)
    const navigate = useNavigate();
    const { myShopData } = useSelector(state => state.owner);
    
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState("");
    const [foodType,setFoodType] = useState("veg");
    const [frontEndImage,setFrontEndImage] = useState(null);
    const categories = ["Snacks", "Main Course", "Desserts", "Pizza", "Burgers", "Sandwiches", "South Indian", "North Indian", "Chinese", "Fast Food", "Others"];
    const [backEndImage,setBackEndImage] = useState(null);
    const {itemId} = useParams();
    const [loading, setLoading] = useState(false);
    

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
            formData.append("category",category);
            formData.append("foodType",foodType);
            formData.append("price",price);
       
           
            if(backEndImage){
                formData.append("image",backEndImage);
            }
            const result = await axios.post(`${serverUrl}/api/item/edit-item/${currentItem._id}`, formData,{withCredentials: true});

            dispatch(setMyShopData(result.data));
            console.log(result.data);
            setLoading(false)
            navigate("/");


            
        } catch (error) {
            console.log(error)
            setLoading(false)
            
        }

    }
    useEffect(()=>{

        const handleGetItemById = async ()=>{
            try {
                
                const result = await axios.get(`${serverUrl}/api/item/get-item/${itemId}`,{withCredentials: true});
                console.log(itemId);
                console.log(result.data)
                setCurrentItem(result.data);
              
                
            } catch (error) {
                console.log(error)
                
            }

        }

        handleGetItemById();
    },[itemId]);

    useEffect(()=>{
setName(currentItem?.name || "");
    setPrice(currentItem?.price || 0);
    setCategory(currentItem?.category || "");
    setFoodType(currentItem?.foodType || "veg");
    setFrontEndImage(currentItem?.image || null);
    },[currentItem])
  
   
    return currentItem && (
       
        <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen'
        >
            <div>{itemId}</div>
            <div className='absolute top-[20px] left-[20px] z-[10] mb-[10px]'>

                <FaArrowLeft onClick={() => navigate("/")} size={35} className='text-[#ff4d2d]' />
            </div>

            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-orange-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#ff4d2d] w-16 h-16' />
                    </div>
                    <div className='text-3xl font-extrabold text-gray-900'>
                        Edit Food
                    </div>
                </div>
                <form onSubmit={handleSubmit} className='space-y-5' >
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                            <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full px-4 py-2 border rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-orange-500' type="text" placeholder='Enter Food Name' />
                        
                    </div>
                    
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Food Image</label>
                            <input className='w-full px-4 py-2 border rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-orange-500' type="file" accept='image/*' placeholder='Choose Food image' onChange={handleImage} />
            {frontEndImage && 
            
                            <div className='mt-4'>
                                <img src={frontEndImage} className='w-full h-48 object-cover rounded-lg border' alt="" />
                            </div>}
                        
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Price</label>
                            <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-4 py-2 border rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-orange-500' type="number" placeholder='0' />
                        
                    </div>
                     <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Select Category</label>
                            <select onChange={(e)=>setCategory(e.target.value)} value={category} className='w-full px-4 py-2 border rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-orange-500'>
                                <option value="">Select Category</option>
                                {categories.map((cate,index)=>(
                                    <option value={cate} key={index}>{cate}</option>
                                ))}
                        
                            </select>
                        

                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Select Food Type</label>
                            <select onChange={(e)=>setFoodType(e.target.value)} value={foodType} className='w-full px-4 py-2 border rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-orange-500'>
                                <option value="veg">Veg</option>
                                <option value="non veg">Non-Veg</option>
                                
                        
                            </select>
                        
                    </div>


                  
                    <button  className=' w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer' disabled={loading}>
                       {loading? <ClipLoader size={20} color='white'/> : "Save"} 
                    </button>

                </form>

            </div>


        </div>
    )
}

export default EditItem