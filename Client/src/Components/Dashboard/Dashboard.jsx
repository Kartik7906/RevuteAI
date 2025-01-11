import React from "react";
import "./Dashboard.css";
import { FaBook } from "react-icons/fa";

const Dashboard = () => {
  return (
    <>
      <div className="dashboard-container">
        <div className="Error-caption">
          <FaBook size={60} style={{ opacity: 0.2 }} />
          <h2 className="error-status-text">Your learning journey awaits! ⏳</h2>
          <p className="marketing-msg">
            Explore our diverse course library and unlock your potential. Click
            'Buy Now' to get started
          </p>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
