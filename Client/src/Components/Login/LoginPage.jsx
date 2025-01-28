import React, { useState } from "react";
import "./LoginPage.css";
import { FaBrain } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { login } from "../../Services/apiConnection";
import companylogo from "../../images/company_logo.jpeg";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      const data = await response.json();

      if (!response.ok) {
        setErrors({ apiError: data.message || "Invalid login." });
      } else {
        console.log("Login response:", data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("userId", data.userId);
        navigate("/landingpage");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrors({ apiError: "Something went wrong. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = () => {
    navigate("/register");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="main-login-container">
      {/* Branding Icon */}
      {/* Branding Icon */}
      <div className="login-logo">
        <img src={companylogo} alt="" />
      </div>

      {/* Login Form */}
      <form className="login-form" onSubmit={handleLogin} noValidate>
        <h2 className="form-title">Get Started</h2>

        {/* Email Input */}
        <div className="input-group">
          <input
            type="email"
            id="email"
            className={`input-field ${errors.email ? "input-error" : ""}`}
            placeholder="✉️ Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        {/* Password Input */}
        <div className="input-group">
          <input
            type="password"
            id="password"
            className={`input-field ${errors.password ? "input-error" : ""}`}
            placeholder="🔑 Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        {/* API Error */}
        {errors.apiError && <div className="api-error">{errors.apiError}</div>}

        {/* Forgot Password */}
        <div className="forgot-password">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="forgot-button"
          >
            Forget Password?
          </button>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "SUBMIT"}
        </button>

        {/* Signup Link */}
        <div className="signup-link">
          <span>New User! Create Account - </span>
          <button
            type="button"
            onClick={handleSignup}
            className="signup-button"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
