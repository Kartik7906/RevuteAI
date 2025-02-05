import React, { useState } from "react";
import "./RequestDemo.css";
import { motion } from "framer-motion";
import emailjs from "emailjs-com"; 

const RequestDemo = () => {
  const [formData, setFormData] = useState({
    name: "",           
    companyName: "",    
    companyEmail: "",
    companyContact: "",
    salesTeamSize: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const serviceId = "service_ln8bn75";
    const templateId = "template_93zgpkg";
    const userId = "poMf6cchtrjyXo1ei";

    emailjs
      .send(serviceId, templateId, formData, userId)
      .then((response) => {
        console.log("SUCCESS!", response.status, response.text);
        alert("Your message has been sent successfully!");

        setFormData({
          name: "",
          companyName: "",
          companyEmail: "",
          companyContact: "",
          salesTeamSize: "",
        });
      })
      .catch((error) => {
        console.error("Failed to send the message:", error);
        alert("Failed to send the message. Please try again.");
      });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="requestdemo-wrapper"
      >
        <div className="requestdemo-banner">
          <h2 className="requestdemo-heading">
            Connect with our team to discover how we can help enhance your sales
            team performance.
          </h2>
        </div>

        <form className="requestdemo-form" onSubmit={handleSubmit}>
          {/* 1. Name Field */}
          <div className="requestdemo-formgroup">
            <label className="requestdemo-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="requestdemo-input"
              required
            />
          </div>

          {/* 2. Company Name Field */}
          <div className="requestdemo-formgroup">
            <label className="requestdemo-label">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
              className="requestdemo-input"
              required
            />
          </div>

          {/* 3. Company Email Field */}
          <div className="requestdemo-formgroup">
            <label className="requestdemo-label">Company Email</label>
            <input
              type="email"
              name="companyEmail"
              value={formData.companyEmail}
              onChange={handleChange}
              placeholder="Enter your company email"
              className="requestdemo-input"
              required
            />
          </div>

          {/* 4. Contact Field */}
          <div className="requestdemo-formgroup">
            <label className="requestdemo-label">Contact</label>
            <input
              type="tel"
              name="companyContact"
              value={formData.companyContact}
              onChange={handleChange}
              placeholder="Enter contact number"
              className="requestdemo-input"
              required
            />
          </div>

          {/* 5. Sales Team Size Select */}
          <div className="requestdemo-formgroup">
            <label className="requestdemo-label">Sales Team Size</label>
            <select
              name="salesTeamSize"
              value={formData.salesTeamSize}
              onChange={handleChange}
              className="requestdemo-input"
              required
            >
              <option value="" disabled>
                Select Sales Team Size
              </option>
              <option value="less than 100">Less than 100</option>
              <option value="100-500">100-500</option>
              <option value="greater than 500">Greater than 500</option>
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" className="requestdemo-submit">
            Submit
          </button>
        </form>
      </motion.div>
    </>
  );
};

export default RequestDemo;
