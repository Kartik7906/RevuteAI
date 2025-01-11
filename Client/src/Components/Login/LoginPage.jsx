import React from 'react';
import './LoginPage.css';
import { FaBrain } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/landingpage');
  };

  const handleSignup = () => {
    navigate('/register');
  };

  const handleForgotPassword = () => {
    alert('Forgot password clicked!');
  };

  return (
    <div className="main-container">
      {/* Left Section */}
      <div className="left-section">
        <div className="login-box">
          <div className="text-center">
            <p className="greeting-words">Get Started</p>

            <input
              type="email"
              className="email"
              id="email"
              placeholder="✉️ Enter Email Address"
            />
            <br /><br />

            <input
              type="password"
              className="password"
              id="password"
              placeholder="🔑 Enter Password"
            />
            <br /><br />

            <a className="forget" onClick={handleForgotPassword}>Forget Password?</a>
            <br /><br />

            <button className="submit" onClick={handleLogin}>SUBMIT</button>
            <br /><br />

            <a className="new_account">
              New User! Create Account -
              <span className="sign_up" onClick={handleSignup}>Sign Up</span>
            </a>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="right-section-middlepart">
          <p className="welcome-statement">Welcome To</p>
          <FaBrain size={70} color='white'/>
          <h4 className="title">RevuteAI</h4>
          <a className="welcome">Kindly Login to proceed!</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
