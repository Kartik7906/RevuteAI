import React, { useState } from 'react';
import './Navbar_Landingpage.css';
import { useNavigate } from 'react-router-dom';
import company_logo from '../../images/company_logo.jpeg';

const Navbar_Landingpage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <div className="navbarHomepage-container">
      <div className="companyHomepage-logo">
        <img src={company_logo} alt="Company Logo" />
      </div>
      <div className="menu-icon" onClick={toggleMenu}>
        {/* Hamburger icon */}
        <div className={isMenuOpen ? "bar open" : "bar"}></div>
        <div className={isMenuOpen ? "bar open" : "bar"}></div>
        <div className={isMenuOpen ? "bar open" : "bar"}></div>
      </div>
      <div
        className={`userHomepage-navigator-div ${
          isMenuOpen ? "menu-active" : ""
        }`}
      >
        <span
          onClick={() => handleNavigation('/course')}
          className="loginHomepage-container"
        >
          Courses
        </span>
        <span
          onClick={() => handleNavigation('/pricing')}
          className="loginHomepage-container"
        >
          Pricing
        </span>
        <span
          onClick={() => handleNavigation('/about')}
          className="loginHomepage-container"
        >
          About Us
        </span>
        <span
          onClick={() => handleNavigation('/contactus')}
          className="loginHomepage-container"
        >
          Contact Us
        </span>
        <span
          onClick={() => handleNavigation('/login')}
          className="loginHomepage-container"
        >
          Log In
        </span>
        <button
          className="demoHomepage-container"
          onClick={() => handleNavigation('/book-demo')}
        >
          Book a Demo
        </button>
      </div>
    </div>
  );
};

export default Navbar_Landingpage;
