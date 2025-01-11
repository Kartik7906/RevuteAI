import React from "react";
import "./AnnouncementSidebar.css";

const AnnouncementSidebar = ({ setSection }) => {
  return (
    <aside className="announcement-sidebar">
      <div className="announcement-section">
        <h3>Announcements</h3>
        <ul>
          <li>Trimester 1 Updates</li>
          <li>New Dashboard Features</li>
          <li>Meeting Schedule</li>
        </ul>
        <p className="view-all-text" onClick={() => setSection("announcements")}>View All</p>
      </div>

      <div className="new-updates-section">
        <h3>What's New</h3>
        <ul>
          <li>Product Update: Access all new features of RevuteAI</li>
        </ul>
        <p className="view-all-text" onClick={() => setSection("announcements")}>
          View All
        </p>
      </div>
    </aside>
  );
};

export default AnnouncementSidebar;
