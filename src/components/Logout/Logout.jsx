import React from 'react'
import { useNavigate } from 'react-router-dom'
function Logout() {
  const navigate = useNavigate()
  const handleLogout = ()=>{
    localStorage.clear()
    navigate('/')
  }
  return (
    <div onClick={handleLogout}>Logout</div>
  )
}

export default Logout