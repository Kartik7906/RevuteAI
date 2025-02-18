import React from "react";
import "./Dashboard.css";
import { FaBookOpen, FaRegCheckCircle, FaChalkboardTeacher, FaClock } from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="hero-section">
        <FaBookOpen className="hero-icon" />
        <h2>Your learning journey awaits</h2>
        {/* <p className="subtitle">
          Join 500,000+ professionals already advancing their careers
        </p> */}
        
        <div className="value-propositions">
          <div className="value-item">
            <FaRegCheckCircle className="value-icon" />
            <span>Learn On demand skills</span>
          </div>
          <div className="value-item">
            <FaChalkboardTeacher className="value-icon" />
            <span>Practice what you learn</span>
          </div>
          <div className="value-item">
            <FaClock className="value-icon" />
            <span>Get instant feedback</span>
          </div>
        </div>

        <button className="cta-button">
          Start Learning Free
        </button>
      </div>
    </div>
  );
};

export default Dashboard;