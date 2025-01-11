import React, { useState, useEffect, useRef } from 'react'
import { FaBell } from 'react-icons/fa'
import { FaBrain } from "react-icons/fa6";
import './Navbar.css'

const Navbar = () => {
  // this state is to keep track of dropdown in mobile responsive:
  const [showDropdown, setShowDropdown] = useState(false)

  // Ref to detect clicks outside the dropdown
  const dropdownRef = useRef(null)

  // handle dropdown when user click on profile icon here:
  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev)
  }

  // this useeffect hook is used to decide to close the dropdown menu when user click outside the dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <FaBrain />
        <span>RevuteAI</span>
      </div>

      <div className="navbar-actions">
        <div className="notification-bell">
          <FaBell />
        </div>

        <div className="profile-container" ref={dropdownRef}>
          <div className="profile-circle" onClick={handleProfileClick}>
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
  )
}

export default Navbar
