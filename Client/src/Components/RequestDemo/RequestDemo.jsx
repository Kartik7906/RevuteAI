import React, { useState } from "react";
import "./RequestDemo.css";

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
    <div className="request-demo-container">
      <h2 className="request-demo-heading">Request a Demo</h2>
      <form className="request-demo-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
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
            required
          />
        </div>

        <div className="form-group">
          <label>Company Contact</label>
          <input
            type="tel"
            name="companyContact"
            value={formData.companyContact}
            onChange={handleChange}
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
            <option value="" disabled>Select Sales Team Size</option>
            <option value="less than 100">Less than 100</option>
            <option value="100-500">100-500</option>
            <option value="greater than 500">Greater than 500</option>
          </select>
        </div>

        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default RequestDemo;
