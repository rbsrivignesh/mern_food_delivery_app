import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category.js'
import CategoryCard from './CategoryCard'
import { FaChevronCircleRight } from "react-icons/fa";
import { FaChevronCircleLeft } from "react-icons/fa";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App.jsx';
const UserDashboard = () => {
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const [showLeftButton,setShowLeftButton]= useState(false);
  const [showRightButton,setShowRightButton]= useState(true);
  const [showShopLeftButton,setShowShopLeftButton]= useState(false);
  const [showShopRightButton,setShowShopRightButton]= useState(true);
  const {currentCity,shopInMyCity,itemInMyCity,searchItems} = useSelector(state => state.user);
  const navigate = useNavigate();

  const [updatedItemsList,setUpdatedItemsList] = useState([]);

  const handleFilterByCategory = (category)=>{
    if(category == "All"){
      setUpdatedItemsList(itemInMyCity);
    }
    else{
      const filteredList = itemInMyCity?.filter(i => i.category === category);
      setUpdatedItemsList(filteredList);
      // console.log(filteredList)
    }


  }
  const scrollHandler = (ref, direction)=>{

    if(ref.current){

      // console.log(ref.current);
      ref.current.scrollBy(
        {
          left: direction =="left" ? -200 : 200,
          behavior : "smooth"
        }
      )
    }

  }

  const updateButton = (ref,setShowLeftButton, setShowRightButton)=>{
    const element = ref.current;

    if(element){
    
      setShowLeftButton( element.scrollLeft>0);
      setShowRightButton( (element.scrollLeft + element.clientWidth) < element.scrollWidth);
    }
  }
  useEffect(()=>{setUpdatedItemsList(itemInMyCity)},[itemInMyCity])
 useEffect(()=>{

  if(cateScrollRef.current){
    updateButton(cateScrollRef,setShowLeftButton, setShowRightButton);
    updateButton(shopScrollRef,setShowShopLeftButton, setShowShopRightButton);
    cateScrollRef.current.addEventListener('scroll',()=>{
      updateButton(cateScrollRef,setShowLeftButton, setShowRightButton);
    })
    shopScrollRef.current.addEventListener('scroll',()=>{
      updateButton(shopScrollRef,setShowShopLeftButton, setShowShopRightButton);
    })
 

  return ()=>{
     cateScrollRef?.current?.removeEventListener('scroll',()=>{
      updateButton(cateScrollRef,setShowLeftButton, setShowRightButton);
    });
    shopScrollRef?.current?.removeEventListener('scroll',()=>{
      updateButton(shopScrollRef,setShowShopLeftButton, setShowShopRightButton);
    })
   }
  }
 },[categories,shopInMyCity])
  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>


    <Nav/>
{searchItems && searchItems.length > 0 && <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4'>
<h1 className='text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2'>Search Results</h1>

<div className='w-full h-auto flex flex-wrap gap-6 justify-center'>
  {searchItems.map((item,index)=>(
    <FoodCard data={item} key={index}/>
  ))}
</div>
    </div>}
    
    <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
      <h1 className='text-gray-800 text-2xl sm:text-3xl'>
        Inspiration for your first Order
        </h1>
        <div className='w-full relative'>
          {/* scrollbar-thin scrollbar-thumb-[#ff4d2d] scroll-track-transparent scroll-smooth */}
        {showLeftButton ? 
         ( <button className='absolute left-0 top-1/2  -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10' onClick={()=>scrollHandler(cateScrollRef,"left")}>
<FaChevronCircleLeft/>
          </button>): <></>
            
          }
          <div ref={cateScrollRef} className='w-full flex overflow-x-auto gap-4 pb-2 '>
            {categories.map((item,index)=>
            (<CategoryCard name={item.category} image={item.image} key={index} onClick = {()=>handleFilterByCategory(item.category)}/>)
          )}
          </div>
          {showRightButton && 
         ( <button className='absolute right-0 top-1/2  -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10' onClick={()=>scrollHandler(cateScrollRef,"right")}>
<FaChevronCircleRight/>
          </button>)
          }
        </div>
      
    </div>

    <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
      <h1 className='text-gray-800 text-2xl sm:text-3xl'>
       Best Shop in {currentCity}
        </h1>
         <div className='w-full relative'>
          {/* scrollbar-thin scrollbar-thumb-[#ff4d2d] scroll-track-transparent scroll-smooth */}
        {showShopLeftButton ? 
         ( <button className='absolute left-0 top-1/2  -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10' onClick={()=>scrollHandler(shopScrollRef,"left")}>
<FaChevronCircleLeft/>
          </button>): <></>
            
          }
          <div ref={shopScrollRef} className='w-full flex overflow-x-auto gap-4 pb-2 '>
            {shopInMyCity?.map((item,index)=>
            (<CategoryCard name={item.name} image={item.image} key={index} onClick={()=>navigate(`/shop/${item._id}`)}/>)
          )}
          </div>
          {showShopRightButton && 
         ( <button className='absolute right-0 top-1/2  -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10' onClick={()=>scrollHandler(shopScrollRef,"right")}>
<FaChevronCircleRight/>
          </button>)
          }
        </div>
    </div>

     <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
      <h1 className='text-gray-800 text-2xl sm:text-3xl'>
      Suggested Food Items
        </h1>

        <div className='w-full h-auto flex flex-wrap gap-[20px] justify-center'>
          {updatedItemsList?.map((item,index)=>(
            <FoodCard key={index} data={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard