import axios from 'axios';
import React, { useState } from 'react'
import { BsFillTelephoneFill } from "react-icons/bs";
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../redux/userSlice';

const OwnerOrderCard = ({data}) => {
  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch()

  const handleUpdateStatus = async (orderId, shopId,status)=>{
    try {
      const result = await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`,{status},{withCredentials:true});
      dispatch(updateOrderStatus({orderId,shopId,status}));
      setAvailableBoys(result.data.availableBoys)
      

      console.log(result.data);

      
    } catch (error) {
      console.log(error)
      
    }

  }
  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
     <div>
       <h2 className='text-lg font-semibold text-gray-800'>{data.user.fullName}</h2>
      <p className='text-sm text-gray-500'>{data.user.email}</p>
      <p className='flex items-center gap-2 text-sm text-gray-600 mt-1' ><BsFillTelephoneFill/> <span>{data.user.mobile}</span></p>
      {data.paymentMethod == "ONLINE" ? <p className='gap-2 text-sm text-gray-600'> payment : {data.payment? "True":"False"} </p> : <p className='gap-2 text-sm text-gray-600'>Payment Method : {data.paymentMethod}</p>}
      
     </div>
     <div>
      <div className='flex items-start gap-2 flex-col text-gray-600 text-sm'>
        <p>{data?.deliveryAddress?.text}</p>
    
        <p className='text-xs text-gray-500'>Lat : {data?.deliveryAddress?.latitude} , Lon : {data?.deliveryAddress?.longitude}</p>
      </div>

      
     </div>

      <div className='flex space-x-4 overflow-x-auto pb-2'>
            {data.shopOrders.shopOrderItems.map((item,indexs)=>(
              <div className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white' key={indexs}>
                <img className='w-full h-24 object-cover rounded' src={item.item.image} alt="" />
                <p className='font-semibold text-sm mt-1'>{item.name}</p>
                <p className='font-semibold text-xs '> Qty:{item.quantity} X Rs.{item.price}</p>
              </div>
            ))}
          </div>

          <div className='flex justify-between items-center mt-auto pt-3 border-t border-gray-100'>
            <span className='text-sm'>status : <span className='font-semibold capitalize text-[#ff4d2d]'>{data.shopOrders.status}</span> </span>

            <select onChange={(e)=> handleUpdateStatus(data._id,data.shopOrders.shop._id,e.target.value)} className='rounded-md border px-3 py-1 text-sm focus:outline-none foucs:ring-2 border-[#ff4d2d]' value={data.shopOrders.status}>
            <option value="">Change</option>
            <option value="pending">PENDING</option>
            <option value="preparing">PREPARING</option>
            <option value="out for delivery">OUT FOR DELIVERY</option>
            </select>

            

          </div>
          {data.shopOrders.status == "out for delivery" && (
            <div className='mt-3 p-2 border rounded-lg text-sm bg-orange-50'> 
            {data.shopOrders.assignedDeliveryBoy? <p>Assigned Delivery Boy :</p> :
            <p>Available Delivery Boys</p> }
            {availableBoys?.length >0 ? (
              availableBoys.map((b,index)=>(
                <div className='text-gray-500'> {b.fullName}-{b.mobile}</div>
              ))
            ) : data.shopOrders.assignedDeliveryBoy ?<div>
              {data.shopOrders.assignedDeliveryBoy.fullName}-{data.shopOrders.assignedDeliveryBoy.mobile}
            </div> : <div> Waiting for Delivery Boys to Accept</div>}
            
            </div>
          )}

          <div className='text-right font-bold text-gray-800 text-sm'>
          Total : Rs.{ data.shopOrders.subTotal}
          </div>



    </div>
  )
}

export default OwnerOrderCard