import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ClipLoader } from 'react-spinners'

const DeliveryBoy = () => {
  const { userData, socket } = useSelector(state => state.user)
  const [currentOrder, setCurrentOrder] = useState(null);
  const [availableAssignments, setAvailableAssigments] = useState(null)
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("")

  useEffect(() => {

    if (!socket || userData.role !== "deliveryBoy") {
      return;
    }

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setDeliveryBoyLocation({ lat: latitude, lon: longitude })
        socket.emit('update-location', {
          latitude, longitude, userId: userData._id
        })
      }), (error) => { console.log(error) }, { enableHighAccuracy: true }
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);

      }

    }


  }, [socket])

  const acceptOrder = async (assignmentId) => {
    try {
    
      const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { withCredentials: true })

      await getCurrentOrder();


    } catch (error) {
      console.log(error)
    }
  }
  const sendOtp = async () => {

    try {
      setLoading(true)
      const result = await axios.post(`https://mern-food-delivery-app-psi.vercel.app/api/order/send-delivery-otp`, { orderId: currentOrder?._id, shopOrderId: currentOrder?.shopOrder._id }, { withCredentials: true });

      console.log(result.data);
       setLoading(false)
      setShowOtpBox(true)




    } catch (error) {
       setLoading(false)
      console.log(error)

    }
  }
  const verifyOtp = async () => {
    try {
       setLoading(true)
       setMessage("");
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, { otp, orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id }, { withCredentials: true });
setLoading(false)
      setMessage(result.data.message);

      console.log(result.data);
      location.reload();
      




    } catch (error) {
      setLoading(false)
      setMessage(error.response.data.message)
      console.log(error.response.data.message)
    }
  }
  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true });

      console.log(result.data);
      setTodayDeliveries(result.data)




    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true });
      setCurrentOrder(result.data);
      console.log(result.data)



    } catch (error) {
      console.log(error)
    }
  }
  const getAssignment = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true });
      // console.log(result.data);
      setAvailableAssigments(result.data);

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    socket?.on("new-assignment", (data) => {
      if (data.sendTo == userData._id) {
        setAvailableAssigments(prev => [...prev, data]);
      }
    })

    return () => {
      socket?.off("new-assignment");
    }
  }, [socket]);
  const handleSendOtp = (e) => {

  }

  useEffect(() => { getAssignment(); getCurrentOrder(); handleTodayDeliveries() }, [userData])
  const ratePerDelivery = 50;
  const totalEarning = todayDeliveries.reduce ((sum,d)=> sum + d.count * ratePerDelivery, 0);
  return (

    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>


      <Nav />

      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center'>
        <div className='bg-white rounded-2xl shadow-md p-5 flex  flex-col justify-start items-center w-[90%] border border-orange-100'>
          <h1 className='text-xl font-bold text-[#ff4d2d]   gap-2 text-center'>Welcome, {userData?.fullName} </h1>
          <p className='text-[#ff4d2d]'> <span className='font-semibold'>Latitude :</span> {deliveryBoyLocation?.lat}, <span className='font-semibold'>Longitude :</span> {deliveryBoyLocation?.lon},</p>
        </div>

        <div className='bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100'>
          <h1 className='text-[#ff4d2d] text-lg font-bold'>Today Deliveries</h1>
          <ResponsiveContainer width="100%" height={200}>
        <BarChart data= {todayDeliveries}>
    <CartesianGrid strokeDasharray="3 3"/>
    <XAxis dataKey="hour" tickFormatter={(h)=> `${h}:00`}/>
      <YAxis dataKey="count" allowDecimals={false} />
      <Tooltip labelFormatter={(label)=> `${label}:00`} formatter={(value)=>[value,"orders"]} />

        <Bar dataKey="count" fill='#ff4d2d' />
        </BarChart>

          </ResponsiveContainer>

          <div className='max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center'>
<h1 className='text-xl font-semibold text-gray-800 mb-2'>Today's Earnings</h1>
<span className='text-3xl font-bold text-green-600'>Rs. {totalEarning}</span>
          </div>
        </div>

        {!currentOrder && (
          <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
            <h1 className='text-lg font-bold mb-4 flex items-center gap-2'>Available Orders</h1>
            <div className='space-y-4'>
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div className='border rounded-lg p-4 justify-between flex items-center' key={index}>

                    <div>
                      <p className='text-sm font-semibold'>{a?.shopName}</p>
                      <p className='text-sm text-gray-500'><span className='font-semibold'>Delivery Adderss :</span>{a?.deliveryAddress?.text}</p>
                      <p className='text-sm text-gray-500'>{a.items.length} items | {a.subTotal}</p>
                    </div>
                    <button onClick={() => acceptOrder(a.assignmentId)} className='cursor-pointer bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600'>Accept</button>

                  </div>
                ))
              ) : <p className='text-sm text-gray-400'> No Available Orders</p>}
            </div>

          </div>
        )}

        {currentOrder && (
          <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
            <h2 className='text-lg font-bold mb-3'>📦Current Order</h2>
            <div>
              <p className='font-semibold text-sm'>{currentOrder.shop.name}</p>
              <p className='text-sm text-gray-500'>{currentOrder?.deliveryAddress.text}</p>
              <p className='text-xs text-gray-400'>{currentOrder.shopOrder.shopOrderItems.length} items | Rs.{currentOrder.shopOrder.subTotal}</p>

            </div>
            <DeliveryBoyTracking data={{
              deliveryBoyLocation: deliveryBoyLocation || {
                lat: userData.location.coordinates[1],
                lon: userData.location.coordinates[0]
              },
              customerLocation: {
                lat: currentOrder.deliveryAddress.latitude,
                lon: currentOrder.deliveryAddress.longitude
              }
            }} />
            {!showOtpBox ? (
              <button onClick={sendOtp} className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200 cursor-pointer' disabled={loading}>
              {loading ?<ClipLoader size={20} color='white'/>:" Mark As Delivered" } 
              </button>
            ) :
              (
                <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
                  <p className='text-sm font-semibold mb-2'>Enter Otp sent to <span className='text-orange-500'>{currentOrder.user.fullName}</span></p>
                  <input onChange={(e) => setOtp(e.target.value)} type="text" value={otp} className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus: ring-orange-400' placeholder='Enter Otp' />
                  {message && <p className='text-center text-green-400'>{message}</p>}
                  
                  <button onClick={verifyOtp} className='cursor-pointer w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all'>Submit Otp</button>
                </div>

              )}
          </div>
        )}

      </div>
    </div>
  )
}

export default DeliveryBoy
