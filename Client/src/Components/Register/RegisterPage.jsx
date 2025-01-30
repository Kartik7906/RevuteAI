import React, { useState } from "react";
import "./RegisterPage.css";
import { FaBrain, FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { register } from "../../Services/apiConnection";
import companylogo from '../../images/company_logo.jpeg'

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showRolePopup, setShowRolePopup] = useState(false);

  const [role, setRole] = useState("user"); 

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.username) {
      errors.username = "Username is required.";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "user",
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ apiError: data.message || "Registration failed." });
      } else {
        alert("User registered successfully!");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setErrors({ apiError: "Registration failed, please try again." });
    } finally {
      setIsSubmitting(false);
      setShowRolePopup(false);
    }

  };

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <div className="register-logo" onClick={() => navigate("/")}>
              <img src={companylogo} alt="" />
          </div>
          <p>New User! Kindly Sign Up to proceed</p>
        </div>

        <form className="register-form" onSubmit={handleFormSubmit} noValidate>
          {/* Email Input */}
          <div className="input-group">
            <input
              type="email"
              name="email"
              id="email"
              className={`input-field ${errors.email ? "input-error" : ""}`}
              placeholder="✉️ Enter Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Username Input */}
          <div className="input-group">
            <input
              type="text"
              name="username"
              id="username"
              className={`input-field ${errors.username ? "input-error" : ""}`}
              placeholder="👤 Enter Username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          {/* Password Input with Visibility Toggle */}
          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              className={`input-field ${errors.password ? "input-error" : ""}`}
              placeholder="🔑 Enter Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Confirm Password Input with Visibility Toggle */}
          <div className="input-group password-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              id="confirmPassword"
              className={`input-field ${errors.confirmPassword ? "input-error" : ""}`}
              placeholder="🔑 Re-Enter Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
            <span
              className="password-toggle-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Terms & Conditions */}
          <p className="terms-text">
            By submitting, I accept the{" "}
            <span className="terms">terms and conditions</span>
          </p>
          {errors.apiError && <div className="api-error">{errors.apiError}</div>}

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "SUBMIT"}
          </button>
        </form>

        {/* Existing Account Text */}
        <p className="existing-text">
          Existing User! Login to Account -{" "}
          <span className="login-link" onClick={handleSignIn}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;