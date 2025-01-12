import React from 'react'
import './Task1.css'

const Task1 = () => {
  const handleStart = () => {
    console.log('Start Assessment triggered.')
  }

  const handleStartRecord = () => {
    console.log('Start Test triggered.')
  }

  return (
    <div className="task1-wrapper">
      {/* Main Box / Assessment Header */}
      <div className="box">
        <br />
        <center>
          <p className="self">Candidate Assessment</p>
          <div className="intro"></div>
        </center>
        <br />
        <br />
        <br />

        <div className="steps-container">
          <div className="steps">
            <span className="circle active">1</span>
            <span className="circle">2</span>
            <span className="circle">3</span>
            <div className="progress-bar">
              <span className="indicator"></span>
            </div>
          </div>
        </div>
      </div>

      <br />
      <br />
      <br />

      {/* Assessment Instructions */}
      <center>
        <div className="asses1" id="asses1">
          <div className="intro_text">
            <p>
              Can you give us a brief introduction about yourself in the next 2
              minutes? Feel free to cover your personal background, education,
              work experience, or anything you feel is relevant.
            </p>
          </div>
          <br />
          <br />
          <button className="record" id="start" onClick={handleStart}>
            Start Assessment
          </button>
          <br />
          <br />
        </div>

        {/* Recording Section */}
        <div id="recordings" className="recordings">
          <center>
            <p className="self">Self-Introduction</p>
            <br />
            <br />
            <div className="intro_text">
              <p>
                Can you give us a brief introduction about yourself in the next
                2 minutes? Feel free to cover your personal background,
                education, work experience, or anything you feel is relevant.
              </p>
            </div>
          </center>
          <br />
          <br />
          <video id="video" className="video" autoPlay muted></video>
          <br />
          <br />
          <div id="timer" className="timer"></div>
          <br />
          <button
            className="record_start"
            id="start_record"
            onClick={handleStartRecord}
          >
            Start Test
          </button>
          <br />
          <br />
        </div>
      </center>

      <br />
      <br />

      {/* Placeholder for the end or next steps */}
      <div className="end" id="end"></div>
    </div>
  )
}

export default Task1
