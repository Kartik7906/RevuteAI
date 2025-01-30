import React, { useState } from "react";
import "./RequestDemo.css";
import { motion } from "framer-motion";

const RequestDemo = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    companyContact: "",
    salesTeamSize: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted", formData);
    alert("Demo request submitted successfully!");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="request-demo-wrapper"
      >
        <h2 className="request-demo-heading">
          Connect with our team to discover how we can help enhance your sales
          team performance.
        </h2>
        <div className="request-demo-container">
          <form className="request-demo-form" onSubmit={handleSubmit}>
          <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div className="form-group">
              <label>Company Email</label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="Enter your company email"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact</label>
              <input
                type="tel"
                name="companyContact"
                value={formData.companyContact}
                onChange={handleChange}
                placeholder="Enter contact number"
                required
              />
            </div>

            <div className="form-group">
              <label>Sales Team Size</label>
              <select
                name="salesTeamSize"
                value={formData.salesTeamSize}
                onChange={handleChange}
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

            <button type="submit" className="submit-button">
              Submit
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default RequestDemo;