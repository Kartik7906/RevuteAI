import React from 'react';
import './Navbar_Landingpage.css';
import { useNavigate } from 'react-router-dom';
import company_logo from '../../images/company_logo.jpeg';

const Navbar_Landingpage = () => {
    const navigate = useNavigate();
    const handleloginhere = ()=>{
      navigate('/login')
    }

  return (
    <div className='navbar-container'>
      <div className='company-logo'>
        <img src={company_logo} alt="Company Logo" />
      </div>
      <div className='user-navigator-div'>
        <span onClick={handleloginhere} className='login-container'>Log In</span>
        <button className='demo-container'>Book a Demo</button>
      </div>
    </div>
  );
}

export default Navbar_Landingpage;
