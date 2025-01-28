import React from "react";
import "./EducationNavbar.css";
import { FaUserCircle, FaBell } from "react-icons/fa";

const EducationNavbar = () => {
  return (
    <nav className="education-navbar">
      <div className="navbar-left">
        <h1>BFSI Education</h1>
      </div>
      <div className="navbar-right">
        <div className="profile-dropdown">
          <FaUserCircle className="profile-icon" aria-label="User Profile" role="button" tabIndex={0} />
          <div className="dropdown-content">
            <a href="/profile">View Profile</a>
            <a href="/settings">Settings</a>
            <a href="/logout">Logout</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default EducationNavbar;
