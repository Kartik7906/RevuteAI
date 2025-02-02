import React from 'react';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import companyLogo from '../../images/company_logo.jpeg';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo" onClick={() => navigate('/')}>
        <img src={companyLogo} alt="Company Logo" />
      </div>

      <div className="navbar__menu">
        <div className="navbar__notification" onClick={handleProfile}>
          <FaBell />
        </div>
        <button className="navbar__btn" onClick={handleLogout}>
          Logout
        </button>
        <div className='profileContainer' onClick={handleProfile}>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;