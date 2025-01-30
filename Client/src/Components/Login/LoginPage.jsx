import React, { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import { login } from "../../Services/apiConnection";
import companylogo from "../../images/company_logo.jpeg";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // **Added: Admin and SuperAdmin credentials**
  const adminCredentials = {
    email: "kartik@revute.ai",
    password: "revute@790",
  };

  const superAdminCredentials = {
    email: "nayanshree@revute.ai",
    password: "revute@790",
  };
  // **End of Added Credentials**

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

    // **Added: Check for Admin credentials**
    if (email === adminCredentials.email && password === adminCredentials.password) {
      navigate("/admin"); // Navigate to Admin component
      return;
    }

    // **Added: Check for SuperAdmin credentials**
    if (email === superAdminCredentials.email && password === superAdminCredentials.password) {
      navigate("/superadmin"); // Navigate to SuperAdmin component
      return;
    }
    // **End of Admin/SuperAdmin Check**

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
      <div className="login-logo" onClick={() => navigate("/")}>
        <img src={companylogo} alt="" />
      </div>

      <form className="login-form" onSubmit={handleLogin} noValidate>
        <h2 className="form-title">Get Started</h2>

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

        {errors.apiError && <div className="api-error">{errors.apiError}</div>}

        <div className="forgot-password">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="forgot-button"
          >
            Forget Password?
          </button>
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "SUBMIT"}
        </button>

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
