import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa';
import {useSelector} from 'react-redux'
import CartItemCard from '../components/CartItemCard';


const CartPage = () => {
    const navigate = useNavigate();
    const {cartItems,totalAmount} = useSelector(state => state.user);
    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6'>
            <div className='w-full max-w-[800px]'>
               <div className='flex items-center gap-[20px] mb-6 relative'>
                 <div className='z-[10] mb-[10px]'>

                    <FaArrowLeft onClick={() => navigate("/")} size={35} className='text-[#ff4d2d]' />
                </div>
                <h1 className='text-2xl font-bold text-start'>Your Cart</h1>

               </div>
               {cartItems?.length ==0 ? 
               <p className='text-gray-500 text-lg text-center'>Your Cart is Empty</p>
            :
           ( <><div className='space-y-4'>
                {cartItems?.map((item,index)=>(
                    <CartItemCard key={index} data={item} />
                ))}
                
                </div>
                <div className='mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border'>
                    <h1 className='text-lg font-semibold'>Total Amount</h1>
                    <span className='text-xl font-bold text-[#ff4d2d]' >Rs.{totalAmount}</span>

                </div>
                <div className='mt-4 flex justify-end'>
                    <button onClick={()=> navigate("/checkout")} className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer'>Proceed To CheckOut</button>
                </div>
                </>
                
            
            )
                
            }



            </div>
        </div>
    )
}

export default CartPage