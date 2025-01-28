import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import "./ListedReport.css";

const ListedReport = () => {
  const { userId } = useParams(); 
  const [showIntroductionReports, setShowIntroductionReports] = useState(false); 
  const [reports, setReports] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) return; 

      try {
        const response = await fetch(`http://localhost:8000/api/report/${userId}`); 
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const data = await response.json();
        setReports(data.reports); 
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, [userId]); 

  return (
    <div className="listedreportpage">
      <h1 className="title">Listed Reports</h1>

      <div className="section">
        <div
          className="header"
          onClick={() => setShowIntroductionReports(!showIntroductionReports)} 
        >
          <span className="icon">📄</span>
          <h2 className="section-title">Introduction Reports</h2>
          <span className="toggle-icon">{showIntroductionReports ? "▲" : "▼"}</span>
        </div>
        {showIntroductionReports && (
          <div className="content">
            {reports.length > 0 ? (
              reports.map((report, index) => (
                <div
                  key={report._id || index}
                  className="report-item"
                  onClick={() => navigate(`/report`)} 
                >
                  <p>Report {index + 1}: {report.reportData.title || "Untitled Report"}</p>
                  {}
                </div>
              ))
            ) : (
              <p>No reports found.</p>
            )}
          </div>
        )}
      </div>

      {/* Other Sections */}
      <div className="section">
        <div className="header">
          <span className="icon">🤖</span>
          <h2 className="section-title">Bot Reports</h2>
          <span className="toggle-icon">▼</span>
        </div>
        <div className="content">
          <p>Sample Bot Report Content...</p>
        </div>
      </div>
    </div>
  );
};

export default ListedReport;
