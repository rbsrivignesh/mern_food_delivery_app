import React from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { LuReceiptIndianRupee } from "react-icons/lu";
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import { serverUrl } from '../App';
import { setSearchItems, setUserData } from '../redux/userSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Nav = () => {
    const navigate = useNavigate();
    const [query,setQuery]= useState("");

    const { userData ,myOrders} = useSelector(state => state.user)
    const { currentCity } = useSelector(state => state.user)
    const {myShopData} = useSelector(state => state.owner);
    const [showInfo, setShowInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false)
    const {cartItems} = useSelector(state => state.user)
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {

            const result = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
            dispatch(setUserData(null))


        } catch (error) {
            console.log(error)

        }
    }

    
  const handleSearchItems = async()=>{
try {
//   console.log(query)
  const result =  await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,{withCredentials : true});

dispatch(setSearchItems(result.data))
// console.log(result.data)

} catch (error) {
  console.log(error)
}
  }

  useEffect(()=>{
    if(query){

        handleSearchItems()
    }
    else{
        dispatch(setSearchItems(null));
    }
},[query]);


    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible'>

            {showSearch && userData.role === "user" && <div className='w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden'>
                <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                    <FaLocationDot className='w-[25px] h-[25px] text-[#ff4d2d]' />
                    <div className='w-[80%] truncate text-gray-600'>
                        {currentCity}
                    </div>

                </div>
                <div className='w-[80%] flex items-center gap-[10px]'>
                    <FaSearch size={25} className='text-[#ff4d2d]' />
                    <input value={query} onChange={(e)=>setQuery(e.target.value)} className='px-[10px] text-gray-700 outline-0 w-full' type="text" placeholder='Search Delicious food....' />
                </div>
            </div>}
            <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>
                Vingo
            </h1>

            {userData.role === "user" &&
                <div className=' md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] md:flex hidden'>
                    <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                        <FaLocationDot className='w-[25px] h-[25px] text-[#ff4d2d]' />
                        <div className='w-[80%] truncate text-gray-600'>
                            {currentCity}
                        </div>

                    </div>
                    <div className='w-[80%] flex items-center gap-[10px]'>
                        <FaSearch size={25} className='text-[#ff4d2d]' />
                        <input value={query} onChange={(e)=>setQuery(e.target.value)}  className='px-[10px] text-gray-700 outline-0 w-full' type="text" placeholder='Search Delicious food....' />
                    </div>
                </div>
            }



            <div className='flex items-center gap-4'>
                {userData.role === "user" && (showSearch ? <RxCross2 onClick={() => setShowSearch(false)} size={25} className='text-[#ff4d2d] md:hidden' /> :

                    <FaSearch onClick={() => setShowSearch(true)} size={25} className='text-[#ff4d2d] md:hidden' />)
                }


                {userData.role === "owner" ?
                    <>
                    {myShopData && 
                     <>
                        <button onClick={()=>navigate("/add-item")} className='hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]'>
                            <FaPlus size={20} />
                            <span>Add Food Item</span>
                        </button>
                        <button onClick={()=>navigate("/add-item")} className='md:hidden flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]'>
                            <FaPlus size={20} />

                        </button>
</>
                         }


                        <div className='hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={()=>{navigate("/my-orders")}}>
                            <LuReceiptIndianRupee size={20}/>
                            <span>My Orders</span>
                            <span className='absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]'>{myOrders?.length}</span>
                        </div>
                         <div className='md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium' onClick={()=>{navigate("/my-orders")}}>
                            <LuReceiptIndianRupee size={20}/>
                           
                            <span className='absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]'>{myOrders?.length}</span>
                        </div>


                    </>
                    :
                    (
                        <>
                            {userData.role == "user" && (
                                <div onClick={()=>{navigate("/cart")}} className='relative cursor-pointer'>
                                <FaShoppingCart size={25} className='text-[#ff4d2d]' />
                                <span className='absolute right-[-9px] top-[-12px] text-[#ff4d2d]'>{cartItems.length}</span>

                            </div>
                            )}

 
                            <button onClick={()=>{navigate("/my-orders")}}  className='hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium'>My Orders</button>

                        </>
                    )


                }




                <div onClick={() => setShowInfo(prev => !prev)} className='w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer'>
                    {userData?.fullName.slice(0, 1)}
                </div>

                {showInfo &&
                    <div className={`fixed top-[80px] right-[10px]  ${userData.role == "deliveryBoy" ? " md:right-[20%] lg:right-[40%] " :" md:right-[10%] lg:right-[25%] " }w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999]`}>
                        <div className='text-[17px] font-semibold'>{userData.fullName}</div>

                        {userData.role === "user" &&   <div onClick={()=>{navigate("/my-orders")}}className='md:hidden text-[#ff4d2d] font-semibold cursor-pointer'>My Orders</div>}
                      
                        <div onClick={handleLogout} className='text-[#ff4d2d] font-semibold cursor-pointer'>Log Out</div>
                    </div>
                }
            </div>

        </div>
    )
}

export default Nav