import React from 'react'
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaTrashAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';

const CartItemCard = ({ data }) => {
    const dispatch = useDispatch()
    const handleIncrease = (id,currentQty)=>{
        dispatch(updateQuantity({id,quantity :currentQty+1}));
    }
    const handleDecrease = (id,currentQty)=>{
        if(currentQty >1){

            dispatch(updateQuantity({id,quantity :currentQty-1}));
        }
        if(currentQty ==1){
            dispatch(removeCartItem(id));
        }

    }
    
    return (
        <div className='flex items-center justify-between bg-white p-4 rounded-xl shadow border'>
            <div className='flex items-center gap-4'>
                <img className='w-20 h-20 object-cover rounded-lg' src={data.image} alt="" />
                <div>
                    <h1 className='font-medium text-gray-800'>{data.name}</h1>
                    <p className='text-sm text-gray-500'>Rs.{data.price} X {data.quantity}</p>
                    <p className='text-sm text-gray-900'>Rs.{data.price * data.quantity}</p>
                </div>


            </div>

            <div className='items-center gap-3 flex' >
                <button className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer' onClick={()=>handleDecrease(data.id, data.quantity)}><FaMinus size={12} /></button>
                <span>{data.quantity}</span>
                <button  onClick={()=>handleIncrease(data.id, data.quantity)} className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer'><FaPlus size={12} /></button>

                <button onClick={()=>dispatch(removeCartItem(data.id))} className='p-2 bg-gray-100 rounded-full hover:bg-red-200 text-red-600'><FaTrashAlt size={18} /></button>


            </div>


        </div>
    )
}

export default CartItemCard