import React from 'react';
import './ReportPage.css';
import Navbar from '../Navbar/Navbar';
import { FaDownload, FaSignOutAlt } from 'react-icons/fa';

const ReportPage = () => {
  const downloadPDF = () => {
    console.log('Download PDF clicked');
  };

  return (
    <div className="report-page" id="html-content">
      <Navbar />

      <div className="top-nav-actions">
        <button 
          type="button" 
          className="action-button" 
          onClick={downloadPDF}
        >
          <FaDownload style={{ marginRight: '5px' }} />
          Download
        </button>
        
        <button 
          type="button" 
          className="action-button"
        >
          <FaSignOutAlt style={{ marginRight: '5px' }} />
          Logout
        </button>
      </div>

      <div className="report-container">
        
        {/* Welcome Section */}
        <div className="welcome-section">
          <h5 className="welcome" id="welcome">
            👋 Welcome Username
          </h5>
          <p className="report-info">
            Please find your personalised report for the Introduction and Role-Play scenarios.
          </p>
        </div>

        {/* Introduction Section */}
        <div className="report-section">
          <h5 className="section-header">Introduction</h5>
          <hr />
          <h6><b>Transcribed Text:</b></h6>
          <p id="intro_text" className="transcribed-text" />

          {/* WPM Analysis */}
          <div className="analysis-row highlight-bg">
            <div className="analysis-col">
              <h2 id="wpm_number">34</h2>
              <p id="wpm"><b>Normal</b></p>
              <h6><b>Average Words Per Minute (WPM)</b></h6>
            </div>
            <div className="analysis-col">
              <p className="analysis-hint">🔵 Slow - Less than 100 WPM</p>
              {/* ↓↓↓ Use HTML entities for ≤ and < ↓↓↓ */}
              <p className="analysis-hint">🟢 Normal - 100 &#8804; WPM &lt; 150</p>
              <p className="analysis-hint">🔴 Fast - Greater than 150 WPM</p>
            </div>
          </div>

          {/* Emotion Analysis */}
          <div className="analysis-row">
            <h5><b>Emotion Analysis</b></h5>
          </div>
          <div className="analysis-row">
            <div className="chart-col">
              <canvas id="myChart" />
            </div>
            <div className="chart-col">
              <canvas id="myChart1" />
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="analysis-row highlight-bg">
            <div className="analysis-col">
              <p id="sentiments"><b>Normal</b></p>
              <h6><b>🗣️ Sentiment Analysis</b></h6>
            </div>
            <div className="analysis-col">
              <p className="analysis-hint">
                🟢 Positive - Reflects favorable, optimistic, or happy sentiment.
              </p>
              <p className="analysis-hint">
                🟠 Neutral - Balanced or indifferent, neither explicitly positive nor negative.
              </p>
              <p className="analysis-hint">
                🔴 Negative - Reflects unfavorable, critical, or unhappy sentiment.
              </p>
            </div>
          </div>

          {/* Grammar Score */}
          <div className="analysis-row">
            <div className="analysis-col">
              <p id="grammar_score" />
              <h6><b>✍️ Grammar Score (10)</b></h6>
            </div>
            <div className="analysis-col">
              <h6><b>Recommendations</b></h6>
              <p id="rec" className="recommendations" />
            </div>
          </div>

          {/* Tone Assessment */}
          <div className="analysis-row highlight-bg tone-container">
            <h5><b>Tone Assessment</b></h5>
            <div className="analysis-col">
              <p id="accuracy_score1" />
              <h6><b>🎯 Accuracy Score (100)</b></h6>
            </div>
            <div className="analysis-col">
              <p id="fluency_score1" />
              <h6><b>🔑 Fluency Score (100)</b></h6>
            </div>
            <div className="analysis-col">
              <p id="Completeness_score1" />
              <h6><b>⌚ Completeness Score (100)</b></h6>
            </div>
          </div>
        </div>

        {/* Role-Play Scenarios */}
        <div className="report-section">
          <h5 className="section-header">Role-Play Scenarios</h5>
          <hr />
          <h6><b>Transcribed Text:</b></h6>
          <p id="intro_text1" className="transcribed-text" />

          {/* WPM Analysis */}
          <div className="analysis-row highlight-bg">
            <div className="analysis-col">
              <h2 id="wpm_number1">34</h2>
              <p id="wpm1"><b>Normal</b></p>
              <h6><b>Average Words Per Minute (WPM)</b></h6>
            </div>
            <div className="analysis-col">
              <p className="analysis-hint">🔵 Slow - Less than 100 WPM</p>
              <p className="analysis-hint">🟢 Normal - 100 &#8804; WPM &lt; 150</p>
              <p className="analysis-hint">🔴 Fast - Greater than 150 WPM</p>
            </div>
          </div>

          {/* Emotion Analysis */}
          <div className="analysis-row">
            <h5><b>Emotion Analysis</b></h5>
          </div>
          <div className="analysis-row">
            <div className="chart-col">
              <canvas id="myChart2" />
            </div>
            <div className="chart-col">
              <canvas id="myChart3" />
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="analysis-row highlight-bg">
            <div className="analysis-col">
              <p id="sentiments1"><b>Normal</b></p>
              <h6><b>🗣️ Sentiment Analysis</b></h6>
            </div>
            <div className="analysis-col">
              <p className="analysis-hint">
                🟢 Positive - Reflects favorable, optimistic, or happy sentiment.
              </p>
              <p className="analysis-hint">
                🟠 Neutral - Balanced or indifferent.
              </p>
              <p className="analysis-hint">
                🔴 Negative - Reflects unfavorable or critical sentiment.
              </p>
            </div>
          </div>

          {/* Tone & Text Assessment */}
          <div className="analysis-row tone-container">
            <h5><b>Tone & Text Assessment</b></h5>
            <div className="analysis-col">
              <p id="accuracy_score2" />
              <h6><b>🎯 Accuracy Score (100)</b></h6>
            </div>
            <div className="analysis-col">
              <p id="fluency_score2" />
              <h6><b>🔑 Fluency Score (100)</b></h6>
            </div>
            <div className="analysis-col">
              <p id="Completeness_score2" />
              <h6><b>⌚ Completeness Score (100)</b></h6>
            </div>
          </div>

          {/* Grammar / Confidence / Negotiation */}
          <div className="analysis-row">
            <div className="analysis-col">
              <p id="grammar_score1" />
              <h6><b>✍️ Grammar Score (10)</b></h6>
            </div>
            <div className="analysis-col">
              <p id="confidence_score1" />
              <h6><b>⚡ Confidence Score (10)</b></h6>
            </div>
            <div className="analysis-col">
              <p id="negotiation_score1" />
              <h6><b>👜 Negotiation Score (10)</b></h6>
            </div>
          </div>

          {/* Recommendations */}
          <div className="analysis-row highlight-bg recommendations-row">
            <h6><b>Recommendations</b></h6>
            <p id="rec1" className="recommendations" />
          </div>
        </div>

        {/* Timestamp */}
        <div className="time-section">
          <p id="time" />
        </div>

      </div>
    </div>
  );
};

export default ReportPage;
