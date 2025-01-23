import React from "react";
import "./CoursesPage.css";

const CoursesPage = () => {
  return (
    <div className="courses-container">
      {/* Left Section */}
      <div className="left-section">
        <h1 className="main-heading">Skillful Selling</h1>
        <ul className="points-list">
          <li>Learn Proven Sales Strategies</li>
          <li>Become a Sales Expert</li>
          <li>Get Certified with Our Courses</li>
        </ul>
        <button className="buy-btn">Buy Now</button>
      </div>

      {/* Right Section (2x2 course cards) */}
      <div className="right-section">
        <div className="course-box mastery">
          <div className="course-icon icon-mastery"></div>
          <h2 className="box-title">Sales Mastery</h2>
          <p className="box-desc">
            Explore diverse courses to enhance your sales skills and achieve
            success in your career.
          </p>
        </div>

        <div className="course-box advanced">
          <div className="course-icon icon-advanced"></div>
          <h2 className="box-title">Advanced Techniques</h2>
          <p className="box-desc">
            Take your sales game to the next level with our advanced strategies
            and techniques.
          </p>
        </div>

        <div className="course-box essential">
          <div className="course-icon icon-essential"></div>
          <h2 className="box-title">Essential Skills</h2>
          <p className="box-desc">
            Boost your sales skills with our dynamic courses tailored for
            success.
          </p>
        </div>

        <div className="course-box certification">
          <div className="course-icon icon-certification"></div>
          <h2 className="box-title">Sales Certification</h2>
          <p className="box-desc">
            Boost your sales skills with our dynamic courses tailored for
            success.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
