import React from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
function BackButton() {
    const navigate = useNavigate()
  return (
    <div>
 <button className='back-btn' onClick={() => navigate(-1)}><IoArrowBack /></button>
    </div>
  )
}

export default BackButton