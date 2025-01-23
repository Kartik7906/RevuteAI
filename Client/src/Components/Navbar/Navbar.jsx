import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import companyLogo from '../../images/company_logo.jpeg';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleProfile = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      {/* Logo Section */}
      <div className="navbar__logo">
        <img src={companyLogo} alt="Company Logo" />
      </div>

      {/* Hamburger Toggle */}
      <button 
        className="navbar__toggle" 
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span className="navbar__toggle-bar" />
        <span className="navbar__toggle-bar" />
        <span className="navbar__toggle-bar" />
      </button>

      {/* Nav Items (mobile menu) */}
      <div className={`navbar__menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="navbar__notification">
          <FaBell />
        </div>
        <button className="navbar__btn" onClick={handleProfile}>
          Profile
        </button>
        <button className="navbar__btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
