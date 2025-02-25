import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPannel.css";
import companyLogo from "../../images/company_logo.jpeg";

const AdminPannel = () => {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (activeSection === "Users") {
      fetchingUsers();
    }
  }, [activeSection]);

  const fetchingUsers = async () => {
    setActiveSection("Users");
    try {
      const response = await fetch("http://localhost:8000/api/admin/fetchUsers", {
        method: "GET",
      });
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
      const response = await axios.get("http://localhost:8000/api/admin/fetchUser/leaderboard");
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
          <div className="adminPannel-sidebarContainer-menu-item">Logout</div>
        </div>
      </div>
      <div className="adminPannel-contentArea-section">
        <div className="adminPannel-contentArea-section-header">
          <div className="AdminInfo-section">
            <div className="AdminInfo-section-name">Hi, Admin</div>
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
            <div id="leaderboardSection" className="section">
              <h2>LeaderBoard</h2>
              <div className="leaderboard-container">
                {users.length > 0 ? (
                  <ul>
                    {users.map((user, index) => (
                      <li key={user._id}>
                        {index + 1}. {user.username} - Score: {user.overallScore}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No leaderboard data found.</p>
                )}
              </div>
            </div>
          )}
          {activeSection === "Settings" && (
            <div id="settingsSection-adminPannel" className="section">
              <h2>Settings</h2>
              <div>this is settings area</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPannel;
