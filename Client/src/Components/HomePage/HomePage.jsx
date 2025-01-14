import React from 'react'
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const handleloginhere = ()=>{
    navigate('/login')
  }
  return (
    <div>
      <button onClick={handleloginhere}>login here</button>
    </div>
  )
}

export default HomePage
