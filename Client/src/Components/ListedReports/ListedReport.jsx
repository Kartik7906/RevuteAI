import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import "./ListedReport.css";

const ListedReport = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [backendProgress, setBackendProgress] = useState(0);
  const [overallScore, setOverallScore] = useState(0);

  const navigateToReport = (reportType) => {
    switch (reportType) {
      case "education":
        navigate(`/education/${userId}`);
        break;
      case "roleplay":
        navigate(`/roleplay/${userId}`);
        break;
      case "tcm-bot":
        navigate(`/tcm-bot/${userId}`);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    fetchUserProgress();
  }, [userId, navigate]);

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/module/${userId}`);
      if (!response.data || !response.data.modules) return;
      setBackendProgress(response.data.progress || 0);
      setOverallScore(response.data.overallScore || 0);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  return (
    <div className="listedreportpage">
      <h1 className="title">Listed Reports</h1>
      <div className="report-menu">
        <div 
          className="report-menu-item"
          onClick={() => navigateToReport("education")}
        >
          Education Report
          <div className="ProgressBar">
            <div
              className="ProgressCompleted"
              style={{ width: `${backendProgress}%` }}
            />
          </div>
          <p className="ProgressText">{backendProgress}% complete</p>
          <p className="OverallScoreText">Overall Score: {overallScore}</p>
        </div>
        <div 
          className="report-menu-item"
          onClick={() => navigateToReport("roleplay")}
        >
          RolePlay Report
        </div>
        <div 
          className="report-menu-item"
          onClick={() => navigateToReport("tcm-bot")}
        >
          TCM BotReport
        </div>
      </div>
    </div>
  );
};

export default ListedReport;
