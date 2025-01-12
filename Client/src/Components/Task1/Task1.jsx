import React from 'react';
import './Task1.css';

const Task1 = () => {
  const handleStart = () => {
    console.log('Start Assessment triggered.');
  };

  const handleStartRecord = () => {
    console.log('Start Test triggered.');
  };

  return (
    <div className="task1-wrapper">
      <div className="boost-skills-section">
        <div className="skills-container">
          <h1 className="boost-title">Boost Your Skills</h1>
          <p className="boost-text">
            Enhance your IT knowledge and expertise with our specialized training programs.
          </p>
          <button className="explore-button">Explore</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="row">
        {/* Candidate Assessment Section */}
        <div className="col">
          <div className="box">
            <p className="self">Candidate Assessment</p>
            <div className="intro"></div>
          </div>
        </div>

        {/* Assessment Instructions */}
        <div className="col">
          <div className="asses1" id="asses1">
            <p className="intro_text">
              Can you give us a brief introduction about yourself in the next 2 minutes? Feel free to cover your personal background, education, work experience, or anything you feel is relevant.
            </p>
            <button className="record" id="start" onClick={handleStart}>
              Start Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Recording Section */}
      <div className="recordings" id="recordings">
        <p className="self">Self-Introduction</p>
        <p className="intro_text">
          Can you give us a brief introduction about yourself in the next 2 minutes? Feel free to cover your personal background, education, work experience, or anything you feel is relevant.
        </p>
        <video id="video" className="video" autoPlay muted></video>
        <div id="timer" className="timer"></div>
        <button className="record_start" id="start_record" onClick={handleStartRecord}>
          Start Test
        </button>
      </div>
    </div>
  );
};

export default Task1;
