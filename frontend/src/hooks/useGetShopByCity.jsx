import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'

import { setMyShopData } from '../redux/ownerSlice'
import { setShopInMyCity } from '../redux/userSlice'

function useGetShopByCity() {
  const dispatch = useDispatch();
  const { currentCity } = useSelector(state => state.user)

  useEffect(() => {
    const fetchShopByCity = async () => {
      try {
        //  const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`, {withCredentials: true});
        //  dispatch(setShopInMyCity(result.data));
        const result = await axios.get(`${serverUrl}/api/shop/get-by-city/Salem`, { withCredentials: true });
        dispatch(setShopInMyCity(result.data));




      } catch (error) {
        console.log(error);

      }
    }

    fetchShopByCity();

  }, [currentCity]);


}

export default useGetShopByCity