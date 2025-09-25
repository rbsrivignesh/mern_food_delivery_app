import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import {serverUrl} from '../App'
import { useDispatch, useSelector } from 'react-redux'


import { setItemInMyCity } from '../redux/userSlice'

function useGetItemByCity(){
    const dispatch = useDispatch();
    const {currentCity} = useSelector(state => state.user)

    useEffect(()=>{
        const fetchItemByCity = async()=>{
           try {
            //  const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`, {withCredentials: true});
            //  dispatch(setItemInMyCity(result.data));
               const result = await axios.get(`${serverUrl}/api/item/get-by-city/salem`, {withCredentials: true});
             dispatch(setItemInMyCity(result.data));


      
            
           } catch (error) {
            console.log(error);
            
           }
        }

        fetchItemByCity();

    },[currentCity]);


}

export default useGetItemByCity