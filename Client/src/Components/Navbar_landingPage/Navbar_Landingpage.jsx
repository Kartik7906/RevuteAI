import React, { useState, useRef, useEffect } from 'react';
import './Navbar_Landingpage.css';
import { useNavigate } from 'react-router-dom';
import company_logo from '../../images/company_logo.jpeg';

const Navbar_Landingpage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [popupModal, setPopupModal] = useState(false);
  const modalRef = useRef();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleClickEnterprise = () => {
    setPopupModal(!popupModal);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setPopupModal(false);
    }
  };

  useEffect(() => {
    if (popupModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupModal]);

  return (
    <div className="navbarHomepage-container">
      <div className="companyHomepage-logo">
        <img src={company_logo} alt="Company Logo" />
      </div>
      <div className="menu-icon" onClick={toggleMenu}>
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
          onClick={handleClickEnterprise}
          className="loginHomepage-container"
        >
          Enterprise
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
          onClick={() => handleNavigation('/contactus')}
        >
          Request Demo
        </button>
      </div>

      {popupModal && (
        <div className="popup-modal-overlay">
          <div className="popup-modal" ref={modalRef}>
            <ul>
              <li onClick={() => handleNavigation('/business')}>Business</li>
              <li onClick={() => handleNavigation('/education')}>Education</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar_Landingpage;