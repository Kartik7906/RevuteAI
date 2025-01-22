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
    <div className='navbarHomepage-container'>
      <div className='companyHomepage-logo'>
        <img src={company_logo} alt="Company Logo" />
      </div>
      <div className='userHomepage-navigator-div'>
      <span onClick={handleloginhere} className='loginHomepage-container'>Courses</span>
      <span onClick={handleloginhere} className='loginHomepage-container'>About Us</span>
      <span onClick={handleloginhere} className='loginHomepage-container'>Contact Us</span>
        <span onClick={handleloginhere} className='loginHomepage-container'>Log In</span>
        <button className='demoHomepage-container'>Book a Demo</button>
      </div>
    </div>
  );
}

export default Navbar_Landingpage;
