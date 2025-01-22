import React from 'react';
import './CoursesPage.css';

const CoursesPage = () => {
  return (
    <div className="course-container">
      <div className="course-header">
        <h1 className="course-title">Skillful Selling</h1>
        <ul className="course-list">
          <li className="course-item">Learn Proven Sales Strategies</li>
          <li className="course-item">Become a Sales Expert</li>
          <li className="course-item">Get Certified with Our Courses</li>
        </ul>
        <button className="course-button">Buy Now</button>
      </div>
      <div className="course-grid">
        <div className="course-card course-mastery">
          <div className="course-icon course-icon-mastery"></div>
          <h2 className="course-subtitle">Sales Mastery</h2>
          <p className="course-description">Explore diverse courses to enhance your sales skills and achieve success in your career.</p>
        </div>
        <div className="course-card course-advanced">
          <div className="course-icon course-icon-advanced"></div>
          <h2 className="course-subtitle">Advanced Techniques</h2>
          <p className="course-description">Take your sales game to the next level with our advanced strategies and techniques.</p>
        </div>
        <div className="course-card course-essential">
          <div className="course-icon course-icon-essential"></div>
          <h2 className="course-subtitle">Essential Skills</h2>
          <p className="course-description">Boost your sales skills with our dynamic courses tailored for success.</p>
        </div>
        <div className="course-card course-certification">
          <div className="course-icon course-icon-certification"></div>
          <h2 className="course-subtitle">Sales Certification</h2>
          <p className="course-description">Boost your sales skills with our dynamic courses tailored for success.</p>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
