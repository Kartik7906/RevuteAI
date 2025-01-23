import React, { useState, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import './Navbar.css';
import company_logo from '../../images/company_logo.jpeg';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  // Using React's `onBlur` to handle outside clicks
  return (
    <nav className="navbar">
      <div className="companyHomepage-logo">
        <img src={company_logo} alt="Company Logo" />
      </div>

      <div className="navbar-actions">
        <div className="notification-bell">
          <FaBell />
        </div>

        <div
          className="profile-container"
          ref={dropdownRef}
          onBlur={handleClickOutside}
          tabIndex={0} // Enables focus for onBlur to work
        >
          <div
            className="profile-circle"
            onClick={toggleDropdown}
            role="button"
            aria-haspopup="true"
            aria-expanded={showDropdown}
          >
            <span>ME</span>
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              <ul>
                <li>Edit Profile</li>
                <li>Support</li>
                <li>Logout</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
