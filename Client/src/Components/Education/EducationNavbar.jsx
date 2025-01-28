import React from "react";
import "./EducationNavbar.css";
import { FaUserCircle, FaBell } from "react-icons/fa";
import company_logo from '../../images/company_logo.jpeg';
import { useNavigate } from "react-router-dom";

const EducationNavbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="education-navbar">
      <div className="navbar-left companyHomepage-logo">
        <img src={company_logo} alt="" />
      </div>
      <div className="navbar-right" onClick={() => {navigate('/profile')}}>
        <div className="profile-dropdown">
          <FaUserCircle className="profile-icon" aria-label="User Profile" role="button" tabIndex={0} />
        </div>
      </div>
    </nav>
  );
};

export default EducationNavbar;
