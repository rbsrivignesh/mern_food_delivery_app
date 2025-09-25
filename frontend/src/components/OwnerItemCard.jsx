import React from 'react'
import { FaPenToSquare } from 'react-icons/fa6'
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';


const OwnerItemCard = ({data}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleDeleteItem = async()=>{
    try {
      
      const result = await axios.get(`${serverUrl}/api/item/delete-item/${data._id}`,{withCredentials : true});

      dispatch(setMyShopData(result.data));


    } catch (error) {
      console.log(error)
    }
  }
  
  return (
    <div className='flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl'>
        <div className='w-36 h-36 shrink-0 bg-gray-50'>
            <img className='w-full h-full object-cover' src={data.image} alt="" />
        </div>
        <div className='flex flex-col justify-between p-3 flex-1'>
            <div >
                <h2 className='text-base font-semibold text-[#ff4d2d]'>{data.name}</h2>
                <p>
                   <span  className='font-medium text-gray-700'> Category :</span> {data.category}</p>
                <p> <span  className='font-medium text-gray-700'> Food Type :</span>{data.foodType}</p>
               

            </div>
            <div className='flex items-center justify-between'>
             <div className='text-[#ff4d2d] font-bold'>
              <span> Price :</span> {data.price}
             </div>
          <div className='flex items-center gap-2'>
            <div className='p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer' onClick={()=>navigate(`/edit-item/${data._id}`)}>
              <FaPenToSquare size={16}/>
             
            </div>
            <div onClick={handleDeleteItem} className='p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d] cursor-pointer'>
        
              <FaTrashAlt size={16}/>
            </div>
          </div>
            
              </div>
        </div>
    </div>
  )
}

export default OwnerItemCard