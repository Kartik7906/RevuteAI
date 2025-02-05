import React, { useState } from 'react';
import './Navbar_Landingpage.css';
import { HashLink } from 'react-router-hash-link';
import company_logo from '../../images/company_logo.jpeg';
import { useNavigate } from 'react-router-dom';

const Navbar_Landingpage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbarHomepage-container">
      <div className="companyHomepage-logo">
        <HashLink to="/" className="logo-link">
          <img src={company_logo} alt="Company Logo" />
        </HashLink>
      </div>
      <div className="menu-icon" onClick={toggleMenu} aria-label="Toggle Menu">
        <div className={isMenuOpen ? "bar open" : "bar"}></div>
        <div className={isMenuOpen ? "bar open" : "bar"}></div>
        <div className={isMenuOpen ? "bar open" : "bar"}></div>
      </div>
      <nav
        className={`userHomepage-navigator-div ${
          isMenuOpen ? "menu-active" : ""
        }`}
      >
        <span
          onClick={() => navigate('/learnmore')}
          className="loginHomepage-container"
        >
          RolePlays
        </span>
        <HashLink to="/#footer" className="loginHomepage-container" onClick={() => setIsMenuOpen(false)}>
          Contact Us
        </HashLink>
        <span
          onClick={() => navigate('/creditianls')}
          className="loginHomepage-container"
        >
          Log In
        </span>
        <button
          className="demoHomepage-container"
          onClick={() => navigate('/requestdemo')}
        >
          Request Demo
        </button>
      </nav>
    </div>
  );
};

export default Navbar_Landingpage;
