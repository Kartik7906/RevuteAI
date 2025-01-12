import React, { useState } from 'react';
import './RegisterPage.css';
import { FaBrain } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { register } from '../../Services/apiConnection';

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState(false);

  // This will control whether to show the "choose role" popup
  const [showRolePopup, setShowRolePopup] = useState(false);

  // This will store the selected role
  const [role, setRole] = useState('user'); // default role can be "user"

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // First submission to verify passwords
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError(true);
      alert("Passwords do not match!");
      return;
    }

    setError(false);
    // If passwords match, show the role selection popup
    setShowRolePopup(true);
  };

  // Handle role selection and final registration
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call the register API
      const response = await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role, 
      });

      alert("User registered successfully!");
      navigate('/login');
    } catch (err) {
      console.error("Error during registration:", err);
      alert("Registration failed, please try again.");
    }
  };

  // Handle navigation to login page
  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <FaBrain size={40} />
          <h2>RevuteAI</h2>
          <p>New User! Kindly Sign Up to proceed</p>
        </div>

        {/* STEP 1: The initial form */}
        <form className="register-form" onSubmit={handleFormSubmit}>
          <input
            type="email"
            name="email"
            className="input-field"
            placeholder="✉️ Enter Email Address"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <input
            type="text"
            name="username"
            className="input-field"
            placeholder="👤 Enter User Name"
            value={formData.username}
            onChange={handleInputChange}
            required
          />

          <input
            type="password"
            name="password"
            className="input-field"
            placeholder="🔑 Enter Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            className="input-field"
            placeholder="🔑 Re-Enter Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />

          <p className="terms-text">
            By submitting, I accept the <span className="terms">terms and conditions</span>
          </p>

          <button type="submit" className="submit-btn">
            SUBMIT
          </button>
        </form>

        <p className="existing-text">
          Existing User? <span className="login-link" onClick={handleSignIn}>Sign In</span>
        </p>
      </div>

      {/* STEP 2: Popup to choose the role */}
      {showRolePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Choose Your Role</h2>
            <form onSubmit={handleRoleSubmit}>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span>User</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span>Admin</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="superadmin"
                  checked={role === 'superadmin'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span>Super Admin</span>
              </label>

              <button type="submit" className="submit-btn">Confirm</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
