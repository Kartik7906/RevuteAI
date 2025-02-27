import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPannel.css";
import companyLogo from "../../images/company_logo.jpeg";
import { useNavigate } from "react-router-dom";

const AdminPannel = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [users, setUsers] = useState([]);
  const [username, setUserName] = useState("Admin");
  const [showDailyReports, setShowDailyReports] = useState(false);
  const [selectedModuleReportUser, setSelectedModuleReportUser] =
    useState(null);
  const [moduleReportData, setModuleReportData] = useState([]);

  const toggleDailyReports = () => {
    setShowDailyReports(!showDailyReports);
  };

  useEffect(() => {
    if (activeSection === "Users") {
      fetchingUsers();
    }
  }, [activeSection]);

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (user) {
      setUserName(user);
    }
  }, [username]);

  const HandleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const viewModuleReport = async (userId) => {
    if (selectedModuleReportUser && selectedModuleReportUser.userId === userId) {
      setSelectedModuleReportUser(null);
      setModuleReportData([]);
      return;
    }
    try {
      const user = users.find((u) => u.userId === userId);
      setSelectedModuleReportUser(user);
      const response = await axios.get(
        `http://localhost:8000/api/admin/fetchUser/moduleReports/${userId}`
      );
      setModuleReportData(response.data);
    } catch (error) {
      console.error("Error fetching module report data:", error);
    }
  };

  const viewTopicReport = (topicId) => {
    console.log("View report for topic:", topicId);
    // Additional logic to display detailed report can be added here.
  };

  const fetchingUsers = async () => {
    setActiveSection("Users");
    try {
      const response = await fetch(
        "http://localhost:8000/api/admin/fetchUsers",
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const showLeaderBoard = async () => {
    setActiveSection("LeaderBoard");
    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/fetchUser/leaderboard"
      );
      // The response now includes 'username', 'overallScore', 'topicsCompleted', and 'rank'
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
  };

  return (
    <div className="adminPannel-conatiner">
      <div className="adminPannel-sidebarContainer">
        {/* <img src={companyLogo} alt="" className="adminPannel-sidebarContainer-logo"/> */}

        <div className="adminPannel-sidebarContainer-menu">
          <div
            className="adminPannel-sidebarContainer-menu-item"
            onClick={() => setActiveSection("Dashboard")}
          >
            Dashboard
          </div>
          <div
            className="adminPannel-sidebarContainer-menu-item"
            onClick={fetchingUsers}
          >
            Users
          </div>
          <div
            className="adminPannel-sidebarContainer-menu-item"
            onClick={showLeaderBoard}
          >
            LeaderBoard
          </div>
          <div
            className="adminPannel-sidebarContainer-menu-item"
            onClick={() => setActiveSection("Settings")}
          >
            Settings
          </div>
          <div
            className="adminPannel-sidebarContainer-menu-item"
            onClick={HandleLogout}
          >
            Logout
          </div>
        </div>
      </div>
      <div className="adminPannel-contentArea-section">
        <div className="adminPannel-contentArea-section-header">
          <div className="AdminInfo-section">
            <div className="AdminInfo-section-name">Hi, {username}</div>
            <div className="AdminInfo-section-quote">
              Ready to Start your day with some Pitch deck?
            </div>
          </div>
        </div>

        <div className="adminPannel-contentArea-section-body">
          {activeSection === "Dashboard" && (
            <div id="dashboardSection-adminPannel" className="section">
              <h2 className="adminPannel-heading">Dashboard</h2>
              <div>this is dashboard area</div>
            </div>
          )}
          {activeSection === "Users" && (
            <div id="usersSection" className="section">
              <h2 className="adminPannel-heading">Users</h2>
              <div className="user-tracker-container">
                <p>List of all existing users will appear here.</p>
                <div className="user-tracker-container">
                  {users.length > 0 ? (
                    <ul>
                      {users.map((user) => (
                        <li key={user._id}>
                          {user.username} - {user.email}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No users found.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeSection === "LeaderBoard" && (
            <div id="leaderboardSection" className="section leaderboard">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Topics Completed</th>
                    <th>Score</th>
                    <th>Daily Report</th>
                    <th>Module Report</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td>{user.rank}</td>
                      <td>{user.username}</td>
                      <td>{user.topicsCompleted}</td>
                      <td>{user.overallScore}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={toggleDailyReports}
                        >
                          View
                        </button>
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => viewModuleReport(user.userId)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === "Settings" && (
            <div id="settingsSection-adminPannel" className="section">
              <h2>Settings</h2>
              <div>this is settings area</div>
            </div>
          )}

          {showDailyReports && (
            <div className="daily-report-section">
              <div className="filter-container">
                <h3>Daily Reports</h3>
                <div className="filter-controls">
                  <label htmlFor="start-date">From:</label>
                  <input type="date" id="start-date" name="start-date" />
                  <label htmlFor="end-date">To:</label>
                  <input type="date" id="end-date" name="end-date" />
                  <button className="filter-btn">Filter</button>
                </div>
              </div>
              <table className="daily-report-table">
                <thead>
                  <tr>
                    <th>Date of Report Submission</th>
                    <th>Time of Report Submission</th>
                    <th>Modules Completed</th>
                    <th>Progress Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2025-02-27</td>
                    <td>10:00 AM</td>
                    <td>3</td>
                    <td>80%</td>
                  </tr>
                  <tr>
                    <td>2025-02-26</td>
                    <td>09:30 AM</td>
                    <td>2</td>
                    <td>60%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}


          {selectedModuleReportUser && (
  <div className="module-report-section">
    <h3>Module Reports for {selectedModuleReportUser.username}</h3>
    <table className="module-report-table">
      <thead>
        <tr>
          <th>Serial Number</th>
          <th>Topic Name</th>
          <th>View Report</th>
        </tr>
      </thead>
      <tbody>
        {moduleReportData.length > 0 ? (
          moduleReportData.map((topic, index) => (
            <tr key={topic.topicId || index}>
              <td>{index + 1}</td>
              <td>{topic.topicName}</td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => viewTopicReport(topic.topicId)}
                >
                  View Report
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3">No completed topics found</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}


        </div>
      </div>
    </div>
  );
};

export default AdminPannel;
