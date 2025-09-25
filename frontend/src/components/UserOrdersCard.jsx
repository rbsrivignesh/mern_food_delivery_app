import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';

const UserOrdersCard = ({data}) => {

  const [selectedRating, setSelectedRating] = useState({});
  const navigate = useNavigate()

  const formatDate = (dateString)=>{
    const date = new Date(dateString);
    return date.toLocaleString('en-GB',{
      day : '2-digit',
      month : "short",
      year : 'numeric'
    })
  }

  const handleRating = async(itemId, rating)=>{
    try {
      const result = await axios.post(`${serverUrl}/api/item/rating`,{itemId,rating},{withCredentials : true});
      setSelectedRating(prev => ({...prev, [itemId]: rating}));
      console.log(result.data);
      
      
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      <div className=' flex justify-between border-b pb-2'>
    <div>
    <p className='font-semibold '>
      order #{data?._id.slice(-6)}
    </p>
    <p className='text-sm text-gray-500'>
    Date : {formatDate(data?.createdAt)}
    </p>
    </div>
    <div className='text-right'>
      {data.paymentMethod == "COD" ?   <p className='text-sm text-gray-500'>{data?.paymentMethod}</p> : <p className='text-sm text-gray-500'>Payment : {data?.payment ? "True":"False"}</p>
      }
  
    <p  className='text-sm font-medium text-blue-600'>{data?.shopOrders?.[0].status}</p>
    </div>
      </div>

      {data?.shopOrders.map((shopOrder,index)=>(
        <div key={index} className='border rounded-lg p-3 bg-[#fffaf7] space-y-3'>
          <p>{shopOrder?.shop.name}</p>
          <div className='flex space-x-4 overflow-x-auto pb-2'>
            {shopOrder?.shopOrderItems?.map((item,indexs)=>(
              <div className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white' key={indexs}>
                <img className='w-full h-24 object-cover rounded' src={item.item.image} alt="" />
                <p className='font-semibold text-sm mt-1'>{item.name}</p>
                <p className='font-semibold text-xs '> Qty:{item.quantity} X Rs.{item.price}</p>

                {shopOrder?.status == "delivered" && <div className='flex space-x-1 mt-2'>
                    { [1,2,3,4,5].map((star)=> (
                      <button onClick={()=> handleRating(item.item._id,star)} className={`text-lg ${selectedRating[item.item._id] >= star ? 'text-yellow-400' : 'text-gray-400'}`}>★</button>
                    ))}
                  </div>}

              </div>
            ))}
          </div>

          <div className='flex justify-between items-center border-t pt-2'>
            <p className='font-semibold'>Subtotal : {shopOrder.subTotal}</p>
           <span className='text-sm font-medium text-blue-600'>{shopOrder.status}</span>

          </div>

        </div>
      ))}

      <div className='flex justify-between items-center border-t pt-2'>
        <p className='font-semibold'> Total : Rs.{data.totalAmount}</p>
        <button onClick={ ()=> navigate(`/track-order/${data._id}`) } className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm'>Track Order</button>
      </div>
    </div>
  )
}

export default UserOrdersCard