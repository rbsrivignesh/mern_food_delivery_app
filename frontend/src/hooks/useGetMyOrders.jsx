import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import {serverUrl} from '../App'
import { useDispatch, useSelector } from 'react-redux'

import { setMyShopData } from '../redux/ownerSlice'
import { setMyOrders } from '../redux/userSlice'

function useGetMyOrders(){
    const dispatch = useDispatch();
    const {userData} = useSelector(state => state.user);

    useEffect(()=>{
        const fetchMyOrders = async()=>{
           try {
             const result = await axios.get(`${serverUrl}/api/order/get-orders`, {withCredentials: true});
            //  dispatch(setMyShopData(result.data));
            console.log(result.data)
            dispatch(setMyOrders(result.data));


      
            
           } catch (error) {
            console.log(error);
            
           }
        }

        fetchMyOrders();

    },[userData]);


}

export default useGetMyOrders