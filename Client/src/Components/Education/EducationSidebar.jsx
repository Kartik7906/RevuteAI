import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./EducationSidebar.css";
import { FaBars, FaTimes } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const EducationSidebar = ({ scores, currentDay }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const days = [
    { day: 1, title: "Day 1" },
    { day: 2, title: "Day 2" },
    { day: 3, title: "Day 3" },
    { day: 4, title: "Day 4" },
    { day: 5, title: "Day 5" },
    { day: 6, title: "Day 6" },
    { day: 7, title: "Day 7" },
  ];

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>
      <aside className={`education-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <h3 className="sidebar-title">Progress Tracker</h3>
        <nav className="days-list">
          {days.map((dayObj) => {
            const score = scores[dayObj.day - 1];
            const isActive = currentDay === dayObj.day;

            return (
              <Link
                key={dayObj.day}
                to={`#day${dayObj.day}`}
                className={`day-link ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="progressbar-container">
                  <CircularProgressbar
                    value={score}
                    text={`${score}%`}
                    styles={buildStyles({
                      textSize: "24px",
                      pathColor: "#3498db",
                      textColor: "#3498db",
                      trailColor: "#d6e9f8",
                    })}
                  />
                </div>
                <span className="day-title">{dayObj.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default EducationSidebar;