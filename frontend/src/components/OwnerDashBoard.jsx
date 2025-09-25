import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaPenToSquare } from "react-icons/fa6";
import OwnerItemCard from './OwnerItemCard';

const OwnerDashBoard = () => {

  const { myShopData } = useSelector(state => state.owner);
  const navigate = useNavigate();
  
  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex flex-col items-center' >
      <Nav />

      {!myShopData &&
        <div className='flex justify-center items-center p-4 sm:p-6'>
          <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 '>
            <div className='flex flex-col items-center text-center'>
              <FaUtensils className='text-[#ff4d2d] sm:w-20 sm:h-20 mb-4 w-16 h-16' />
              <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>Add Your Restaurant</h2>
              <p className='text-gray-600 mb-4 text-sm sm:text-base'> Join Our Food Delivery Platform and reach thousands of hungry customers every day</p>
              <button onClick={()=> navigate("/create-edit-shop")} className='bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200'>Get Started</button>
            </div>
          </div>


        </div>

      }
      {myShopData && 
      
      <div className='w-full flex flex-col items-center gap-6 px-4 sm:px-6'>
          <h1 className='text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8' ><FaUtensils className='text-[#ff4d2d] w-14 h-14' /> Welcome to {myShopData.name}</h1>

          <div className='bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative'>
            <div  onClick={()=> navigate("/create-edit-shop")} className='absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer'>
        <FaPenToSquare/>
            </div>
            <img className='w-full h-48 sm:h-64 object-cover' src={myShopData.image} alt={myShopData.name} />
               <div className='p-4 sm:p-6'>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>{myShopData.name}</h1>
            <p>{myShopData.city}</p>
            <p>{myShopData.address}</p>
          </div>


          </div>

          {myShopData.items.length ==0 &&  <div className='flex justify-center items-center p-4 sm:p-6'>
          <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 '>
            <div className='flex flex-col items-center text-center'>
              <FaUtensils className='text-[#ff4d2d] sm:w-20 sm:h-20 mb-4 w-16 h-16' />
              <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>Add Your Food Items</h2>
              <p className='text-gray-600 mb-4 text-sm sm:text-base'> Share Your delicious creations by adding them to the menu</p>
              <button onClick={()=> navigate("/add-item")} className='bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200'>Add Food</button>
            </div>
          </div>


        </div>
}

{myShopData.items.length >0 && <div className='flex flex-col items-center gap-4 w-full max-w-3xl'>
  {myShopData.items.map((item,index)=>(
    <OwnerItemCard data={item} key={index}/>
  ))}
  
  </div>}
       
        </div>}


    </div>
  )
}

export default OwnerDashBoard