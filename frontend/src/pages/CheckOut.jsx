import React, { useEffect, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { FaLocationCrosshairs } from "react-icons/fa6";
import { TbLocationSearch } from "react-icons/tb";
import { MdLocationSearching } from "react-icons/md";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import axios from 'axios';
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileAlt } from "react-icons/fa";
import { FaRegCreditCard } from "react-icons/fa";
import { serverUrl } from '../App';
import { addMyOrder } from '../redux/userSlice';

function RecenterMap({location}){
    if(location?.lat && location?.lon){

        const map = useMap();
        map.setView([location?.lat,location?.lon],16,{animate:true})

    }
    return null;

}



const CheckOut = () => {
    const {location, address} = useSelector(state=> state.map);
    const {cartItems,totalAmount,userData}=useSelector(state=> state.user);
    const dispatch = useDispatch();
    const [addressInput, setAddressInput] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const deliveryFee = totalAmount >500 ? 0 : 40;
    const AmountWithDeliveryFee = totalAmount + deliveryFee;
        const handlePlaceOrder = async()=>{
            try {
                
                const result = await axios.post(`${serverUrl}/api/order/place-order`,{
                    paymentMethod,
                    deliveryAddress : {
                        text : addressInput,
                        latitude : location?.lat,
                        longitude : location?.lon
                    },
                    totalAmount: AmountWithDeliveryFee,
                    cartItems

                },{withCredentials:true});

                console.log(result.data)
                if(paymentMethod == "COD"){

                    dispatch(addMyOrder(result.data));
                    navigate("/order-placed");
                }else{
                    const orderId = result.data.orderId;
                    const razorOrder = result.data.razorOrder;

openRazorpayWindow(orderId,razorOrder);
                }
            } catch (error) {
                console.log(error)
            }
        }
const openRazorpayWindow = (orderId,razorOrder)=>{
    const options = {
        key : import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount : razorOrder.amount,
        currency : "INR",
        name : "Vingo",
        description : "Food Delivery Website",
        order_id : razorOrder.id,
        handler: async (response)=>{
            try {
                const result = await axios.post(`${serverUrl}/api/order/verify-payment`,{
                    razorpay_payment_id : response.razorpay_payment_id,
                    orderId
                },{withCredentials : true   })
                 dispatch(addMyOrder(result.data));
                    navigate("/order-placed");
                
            } catch (error) {
                console.log(error)
            }
        }

    }
   const rzp=  new window.Razorpay(options);
   rzp.open();
}
    const onDragEnd = (e)=>{
       try{
            console.log(e.target._latlng);
        const {lat,lng} = e.target._latlng;
        dispatch(setLocation({lat , lon : lng}));
        getAddressByLatLng(lat,lng)}
        catch(error){
            console.log(error)
        }

    
    }
    const getAddressByLatLng = async(lat,lng)=>{
        try {
            if(!lat || !lng){
                return;}
             const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${import.meta.env.VITE_GEOAPIKEY}`);

             dispatch(setAddress(result?.data?.results[0].address_line2))

            // console.log(result?.data?.results[0].address_line2);

            
        } catch (error) {
            console.log(error);
        }
    }

    const getCurrentLocation = ()=>{

          try{
                const latitude = userData?.location.coordinates[1];
            const longitude = userData?.location.coordinates[0];
            dispatch(setLocation({lat :latitude, lon : longitude}))
            
            getAddressByLatLng(latitude,longitude)
          }catch(error){
              console.log(error)}
        

          

    }

    const getLatLngByAddress = async ()=>{

        try {
            const result =await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&format=json&apiKey=${import.meta.env.VITE_GEOAPIKEY}`);

          const {lat,lon} = result.data.results[0];
          console.log({lat,lon})
            if(!lat || !lon){
                return;}
          dispatch(setLocation({lat,lon}))
          dispatch(setAddress(addressInput))
            
        } catch (error) {
            console.log(error);
        }

    }
   
    const navigate = useNavigate();

    useEffect(()=>{
        setAddressInput(address);
    },[address])

    
    return (
        { location && 
        (  <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6'>
            <div className='absolute top-[20px] left-[20px] z-[10] '>

                <FaArrowLeft onClick={() => navigate("/")} size={35} className='text-[#ff4d2d]' />
            </div>

            <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6'>
                <h1 className='text-2xl font-bold text-gray-800'>CheckOut</h1>
                <section>
                    <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'><FaLocationCrosshairs size={16} className='text-[#ff4d2d]' />Delivery Location </h2>
                    <div className='flex gap-2 mb-3'>
                        <input className='flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-[#ff4d2d] focus:ring-2' type="text" 
                        placeholder='Enter your delivery Address....' value={addressInput} onChange={(e)=> setAddressInput(e.target.value)}/>
                        <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center' onClick={getLatLngByAddress}><TbLocationSearch size={17}/></button>
                        <button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center' onClick={getCurrentLocation} ><MdLocationSearching size={17}/></button>
                    </div>

                    <div className='rounded-xl border overflow-hidden'>
                        <div className='h-64 w-full flex items-center justify-center'>
                            <MapContainer className={'w-full h-full'}
                            center={[location?.lat, location?.lon]}
                            zoom={16}

                            >
                                <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  /> 
                                {location &&                        
  <RecenterMap location={location}/> }
  <Marker position={[location?.lat, location?.lon]} draggable eventHandlers={{dragend : onDragEnd}}/>

                            </MapContainer>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className='text-lg font-semibold mb-3 text-gray-800 '>Payment Method</h2>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        
                    <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "COD" ? 'border-[#ff4d2d] bg-orange-50 shadow' : 'border-gray-200 hover:border-gray-300'}`} onClick={()=>setPaymentMethod("COD")}>
                        <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100'><MdDeliveryDining className='text-green-600 text-xl'/></span>
                        <div>
                            <p className='font-medium text-gray-800'>Cash On Delivery</p>
                            <p className='text-xs text-gray-500'>Pay When Your food Arrives</p>
                        </div>
                    </div>
                    <div  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "ONLINE" ? 'border-[#ff4d2d] bg-orange-50 shadow' : 'border-gray-200 hover:border-gray-300'}`} onClick={()=>setPaymentMethod("ONLINE")}>
                        <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100'><FaMobileAlt className='text-purple-700 text-lg'/></span>
                        <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'><FaRegCreditCard className='text-blue-700 text-lg'/></span>
                        <div>
                            <p className='font-medium text-gray-800'>UPI / Credit / Debit Card</p>
                            <p className='text-xs text-gray-500'>Pay Securely Online</p>
                        </div>
                    </div>
                    </div>

                </section>

                <section>
                    <h2 className='text-lg font-semibold mb-3 text-gray-800'>Order Summary</h2>
                    <div className='rounded-xl border bg-gray-50 p-4 space-y-2'>
                        {cartItems?.map((item,index)=>(
                            <div key={index} className='flex justify-between text-sm text-gray-700'>
                                <span>{item.name} X {item.quantity}</span>
                                <span>Rs. {item.price * item.quantity}</span>
                            </div>
                        ))}
                        <hr className='border-gray-200 my-2' />
                        <div className='flex justify-between font-medium text-gray-800'>
                            <span>SubTotal</span>
                            <span>Rs. {totalAmount}</span>
                        </div>
                        <div  className='flex justify-between font-medium text-gray-700'>
                            <span>Delivery Fee</span>
                            <span>{deliveryFee === 0 ? "Free" : "Rs. "+deliveryFee}</span>
                        </div>
                        <div  className='flex justify-between font-bold text-lg text-[#ff4d2d]'>
                            <span>Total Amount</span>
                            <span>Rs. {AmountWithDeliveryFee}</span>
                        </div>


                    </div>
                </section>

                <button onClick={handlePlaceOrder} className='cursor-pointer w-full bg-[#ff4d2d] hover: bg-[#e64526] text-white py-3 rounded-xl font-semibold'>{paymentMethod === "COD" ?"Place Order" : "Pay & Place Order"}</button>

            </div>
        </div>
  )
        }
    
        )
}

export default CheckOut
