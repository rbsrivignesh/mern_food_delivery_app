import React from 'react'

const CategoryCard = ({name,image,onClick}) => {
  return (
    <div onClick={onClick} className='w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-2xl border-2 border-[#ff4d2d] shrink-0 overflow-hidden bg-white shadow-xl shadow-gray-200 hover:shadow-lg transition-shadow relative cursor-pointer'>
        <img className='w-full h-full object-cover transform hover:scale-110 transition-transform duration-300' src={image} alt="" />
        <div className='absolute bottom-0 w-full left-0 bg-[#ffffff96] bg-opacity-95 px-3 py-1 rounded-t-xl text-center shadow text-sm font-medium text-gray-800 backdrop-blur-lg'>
{name}
        </div>
    </div>
  )
}

export default CategoryCard