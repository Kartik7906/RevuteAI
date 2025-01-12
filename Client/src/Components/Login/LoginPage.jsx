import React, { useState } from 'react';
import './LoginPage.css';
import { FaBrain } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { login } from '../../Services/apiConnection'; 

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); 

    try {
      const response = await login({ email, password });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Invalid login');
      } else {
        console.log('Login response:', data);
        localStorage.setItem('token', data.token);
        navigate('/landingpage');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Something went wrong');
    }
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
            {/* Wrap form elements in a <form> */}
            <form onSubmit={handleLogin}>
              <p className="greeting-words">Get Started</p>

              <input
                type="email"
                className="email"
                id="email"
                placeholder="✉️ Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <br /><br />

              <input
                type="password"
                className="password"
                id="password"
                placeholder="🔑 Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <br /><br />

              <a className="forget" onClick={handleForgotPassword}>
                Forget Password?
              </a>
              <br /><br />

              <button className="submit" type="submit">
                SUBMIT
              </button>
              <br /><br />

              <a className="new_account">
                New User! Create Account -
                <span className="sign_up" onClick={handleSignup}> Sign Up</span>
              </a>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="right-section-middlepart">
          <p className="welcome-statement">Welcome To</p>
          <FaBrain size={70} color="white" />
          <h4 className="title">RevuteAI</h4>
          <a className="welcome">Kindly Login to proceed!</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
