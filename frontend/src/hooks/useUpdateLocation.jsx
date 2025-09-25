import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import {serverUrl} from '../App'
import { useDispatch, useSelector } from 'react-redux'



function useUpdateLocation(){
    const dispatch = useDispatch();
    const {userData} = useSelector(state => state.user);
  

    useEffect(()=>{
      const updateLocation  = async (lat,lon)=>{
        const result = await axios.post(`${serverUrl}/api/user/update-location`,{lat,lon},{withCredentials : true});
        console.log(result)
      };

      navigator.geolocation.watchPosition((pos)=>{
        updateLocation(pos.coords.latitude,pos.coords.longitude);
      })


    },[userData]);


}

export default useUpdateLocation