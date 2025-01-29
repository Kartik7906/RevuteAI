import React, { useState } from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../SideBar/Sidebar";
import AnnouncementSidebar from "../Announcement/AnnouncementSidebar";
import Dashboard from "../Dashboard/Dashboard";
import Announcement from "../Announcement/Announcement";
import Task1 from "../Task1/Task1";
import Task2 from "../Task2/Task2";
import './LandingPage.css'
import ListedReport from "../ListedReports/ListedReport";

const LandingPage = () => {
  const [section, setSection] = useState("dashboard");

  const renderSection = () => {
    switch (section) {
      case "dashboard":
        return <Dashboard />;
      case "announcements":
        return <Announcement />;
      case "task1":
        return <Task1 />;
      case "task2":
        return <Task2 />;
      case "reportlist":
        return <ListedReport/>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="layout-container">
      <Navbar />

      <div className="main-body">
        <Sidebar setSection={setSection} />
        <div className="center-content">{renderSection()}</div>
        <AnnouncementSidebar setSection={setSection} className="announcement-sidebar" />
      </div>
    </div>
  );
};

export default LandingPage;
