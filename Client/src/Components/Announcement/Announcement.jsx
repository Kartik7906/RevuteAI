import React from 'react';
import './Announcement.css';

const Announcement = () => {
  const announcements = [
    {
      title: "System Maintenance",
      date: "March 15, 2024",
      description: "Planned maintenance window from 2:00 AM to 5:00 AM UTC. Services might be temporarily unavailable during this period."
    },
    {
      title: "New Feature Launch",
      date: "March 20, 2024",
      description: "Introducing advanced analytics dashboard with real-time metrics and custom reporting capabilities."
    },
    {
      title: "Security Update",
      date: "March 25, 2024",
      description: "Critical security patches deployed. Please ensure you're using the latest version of our client software."
    }
  ];

  return (
    <div className="announcement-container">
      <h2 className="announcement-header">Latest Announcements 📢</h2>
      <div className="announcement-grid">
        {announcements.map((announcement, index) => (
          <div 
            key={index}
            className="announcement-card"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="card-header">
              <h3>{announcement.title}</h3>
              <span className="announcement-date">{announcement.date}</span>
            </div>
            <p className="announcement-description">{announcement.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcement;