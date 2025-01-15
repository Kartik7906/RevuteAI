import React, { useState, useEffect, useRef } from 'react';
import './ReportPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faDownload, faFileCode } from '@fortawesome/free-solid-svg-icons';
import { Pie, Line, Radar } from 'react-chartjs-2';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
} from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale
);

const ReportPage = () => {
  const [reportData, setReportData] = useState(null);
  const [happyScore, setHappyScore] = useState(null);
  const [nervousScore, setNervousScore] = useState(null);
  const [neutralScore, setNeutralScore] = useState(null);
  const [annoyedScore, setAnnoyedScore] = useState(null);
  const [transcript, setTranscript] = useState('');

  // NEW: State to store Gemini suggestions
  const [geminiRecommendations, setGeminiRecommendations] = useState([]);

  // New state for Overall Score
  const [overallScore, setOverallScore] = useState(null);

  // New state for Emotion Pie Chart Data
  const [emotionPieData, setEmotionPieData] = useState({});

  const reportRef = useRef(null);

  // Helper function to generate random integer between min and max (inclusive)
  const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Fetch transcript from localStorage
  useEffect(() => {
    const storedTranscript = localStorage.getItem('transcript');
    if (storedTranscript) {
      // Parse and format the transcript (merging duplicates, etc.)
      const parsedTranscript = JSON.parse(storedTranscript);
      const formattedTranscript = [...new Set(parsedTranscript.map(text => text.trim()))].join(' ');
      setTranscript(formattedTranscript);
    }
  }, []);

  // NEW: Once transcript is set, send it to the backend for analysis
  useEffect(() => {
    if (transcript) {
      fetch('http://localhost:8000/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.suggestions) {
            setGeminiRecommendations(data.suggestions);
          }
        })
        .catch(error => {
          console.error('Error fetching Gemini suggestions:', error);
        });
    }
  }, [transcript]);

  // Load report data and generate random mock scores
  useEffect(() => {
    // Retrieve report data from localStorage
    const data = localStorage.getItem('reportData');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setReportData(parsedData);
        console.log('Report Data Loaded:', parsedData);

        // Generate Tone Analysis Scores
        const generatedHappyScore = getRandomIntInclusive(7, 9);
        const generatedNervousScore = getRandomIntInclusive(6, 9);
        const generatedNeutralScore = getRandomIntInclusive(6, 9);
        const generatedAnnoyedScore = getRandomIntInclusive(1, 3);
        setHappyScore(generatedHappyScore);
        setNervousScore(generatedNervousScore);
        setNeutralScore(generatedNeutralScore);
        setAnnoyedScore(generatedAnnoyedScore);

        // Generate Overall Score between 65 and 100
        const generatedOverallScore = getRandomIntInclusive(65, 100);
        setOverallScore(generatedOverallScore);

        // Generate Random Emotion Pie Chart Data
        const emotions = ['Happy', 'Neutral', 'Sad', 'Engaged', 'Other'];
        const randomValues = emotions.map(() => getRandomIntInclusive(0, 100));
        const total = randomValues.reduce((acc, val) => acc + val, 0);
        const normalizedValues = randomValues.map(val =>
          ((val / total) * 100).toFixed(2)
        );

        setEmotionPieData({
          labels: emotions,
          datasets: [
            {
              label: 'Emotion Distribution (%)',
              data: normalizedValues,
              backgroundColor: [
                '#4caf50', // Happy - green
                '#2196f3', // Neutral - blue
                '#f44336', // Sad - red
                '#ff9800', // Engaged - orange
                '#9c27b0', // Other - purple
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error parsing report data:', error);
        Swal.fire({
          title: 'Data Error',
          text: 'Failed to parse report data.',
          icon: 'error',
        });
      }
    } else {
      console.error('No report data found in localStorage.');
      Swal.fire({
        title: 'No Report Data',
        text: 'No assessment report found. Please complete an assessment first.',
        icon: 'warning',
      }).then(() => {
        // Redirect to home or assessment page if needed
        window.location.href = '/';
      });
    }
  }, []);

  // Download PDF function
  const downloadPDF = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current)
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height],
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`assessment-report-${new Date().toISOString()}.pdf`);
        })
        .catch((err) => {
          console.error('Error generating PDF:', err);
          Swal.fire({
            title: 'Download Failed',
            text: 'An error occurred while generating the PDF.',
            icon: 'error',
          });
        });
    }
  };

  // Download JSON function
  const downloadJSON = () => {
    if (reportData) {
      const reportJson = JSON.stringify(reportData, null, 2);
      const blob = new Blob([reportJson], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessment-report-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  // Prepare data for Emotion Timeline Chart
  const emotionTimelineData =
    reportData && Array.isArray(reportData.emotionTimeline)
      ? {
          labels: reportData.emotionTimeline.map((entry) => {
            const date = new Date(entry.timestamp);
            return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
          }),
          datasets: [
            {
              label: 'Emotional Engagement',
              data: reportData.emotionTimeline.map((entry) => {
                switch (entry.emotion) {
                  case 'Happy':
                    return 3;
                  case 'Sad':
                    return 1;
                  case 'Engaged':
                    return 2;
                  case 'Blinking':
                    return 0.5;
                  case 'Speaking':
                    return 4;
                  default:
                    return 0;
                }
              }),
              fill: true,
              backgroundColor: 'rgba(67, 97, 238, 0.2)',
              borderColor: '#4361ee',
              tension: 0.4,
            },
          ],
        }
      : {};

  // Prepare data for Communication Radar Chart
  const communicationRadarData = reportData
    ? {
        labels: ['Confidence', 'Clarity', 'Engagement'],
        datasets: [
          {
            label: 'Communication Skills',
            data: [
              reportData.sentimentAnalysis?.confidenceScore || 0,
              reportData.sentimentAnalysis?.clarityScore || 0,
              reportData.professionalAnalysis?.communicationScore || 0,
            ],
            backgroundColor: 'rgba(67, 97, 238, 0.2)',
            borderColor: 'rgba(67, 97, 238, 1)',
            borderWidth: 1,
          },
        ],
      }
    : {};

  // Prepare data for Professional Radar Chart
  const professionalRadarData = reportData
    ? {
        labels: ['Communication', 'Organization', 'Clarity'],
        datasets: [
          {
            label: 'Professional Skills',
            data: [
              reportData.professionalAnalysis?.communicationScore || 0,
              reportData.professionalAnalysis?.organizationScore || 0,
              reportData.sentimentAnalysis?.clarityScore || 0,
            ],
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 1,
          },
        ],
      }
    : {};

  // Progress bar percentage for Overall Score
  const overallScorePercentage = overallScore || 0;

  // Rating for WPM based on value
  const getWpmRating = (wpmValue) => {
    if (wpmValue > 150) return 'Excellent';
    if (wpmValue > 100) return 'Good';
    if (wpmValue > 60) return 'Average';
    return 'Needs Improvement';
  };

  // Rating for Confidence Score
  const getConfidenceRating = (score) => {
    if (score > 8) return 'High';
    if (score > 5) return 'Medium';
    return 'Low';
  };

  // Check if necessary data exists
  const hasEmotionTimeline = reportData && Array.isArray(reportData.emotionTimeline);
  const hasFillerWords = reportData && typeof reportData.fillerWords === 'number';

  return (
    <div className="report-container" ref={reportRef}>
      {/* Report Header */}
      <div className="report-header">
        <h1><FontAwesomeIcon icon={faChartLine} /> Assessment Report</h1>
        <p className="mb-0">Generated on {reportData ? new Date().toLocaleString() : 'N/A'}</p>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        {/* Overall Score */}
        <div className="score-card">
          <h3>Overall Score</h3>
          <div className="metric-value">{overallScore !== null ? overallScore : 0}/100</div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${overallScorePercentage}%` }}></div>
          </div>
        </div>

        {/* Words Per Minute */}
        <div className="score-card">
          <h3>Words Per Minute</h3>
          <div className="metric-value">{reportData ? reportData.summary.wordsPerMinute : 0}</div>
          <p className="text-muted">{getWpmRating(reportData ? reportData.summary.wordsPerMinute : 0)}</p>
        </div>

        {/* Confidence Score */}
        <div className="score-card">
          <h3>Confidence Score</h3>
          <div className="metric-value">
            {reportData ? `${reportData.sentimentAnalysis?.confidenceScore || 0}/10` : '0/10'}
          </div>
          <p className="text-muted">
            {getConfidenceRating(reportData ? reportData.sentimentAnalysis?.confidenceScore : 0)}
          </p>
        </div>

        {/* Tone Analysis Section */}
        <div className="score-card">
          <h3>Tone Analysis</h3>
          <div className="metric-value">Neutral</div>
        </div>
      </div>

      {/* Emotion Analysis */}
      <div className="chart-container">
        <h3>Emotional Expression Analysis</h3>
        <div className="chart-row">
          {/* Emotion Pie Chart */}
          <div className="chart-col">
            {emotionPieData.labels && emotionPieData.labels.length > 0 ? (
              <Pie data={emotionPieData} />
            ) : (
              <p>No Emotion Data Available</p>
            )}
          </div>
          {/* Emotion Timeline Chart */}
          <div className="chart-col">
            {hasEmotionTimeline ? (
              <Line data={emotionTimelineData} />
            ) : (
              <p>No Emotion Timeline Data Available</p>
            )}
          </div>
        </div>
      </div>

      {/* Grammar and Communication Analysis */}
      <div className="analysis-section">
        {/* Grammar Analysis */}
        <div className="detailed-analysis">
          <h3>Grammar Analysis</h3>
          <div className="grammar-scores">
            <p><strong>Score:</strong> {reportData ? reportData.grammarAnalysis.score : 0}/10</p>
            <p><strong>Feedback:</strong> {reportData ? reportData.grammarAnalysis.feedback : 'N/A'}</p>
          </div>
          <h4>Recommendations:</h4>
          <ul className="recommendation-list">
            {reportData &&
             reportData.professionalAnalysis?.recommendations &&
             reportData.professionalAnalysis.recommendations.length > 0 ? (
              reportData.professionalAnalysis.recommendations.map((rec, index) => (
                <li key={index} className="recommendation-item">{rec}</li>
              ))
            ) : (
              <li className="recommendation-item">No Recommendations Available</li>
            )}
          </ul>
        </div>

        {/* Communication Skills Radar Chart */}
        <div className="detailed-analysis">
          <h3>Communication Skills</h3>
          {communicationRadarData.labels && communicationRadarData.labels.length > 0 ? (
            <Radar data={communicationRadarData} />
          ) : (
            <p>No Communication Skills Data Available</p>
          )}
        </div>
      </div>

      {/* Professional Analysis */}
      <div className="detailed-analysis">
        <h3>Professional Assessment</h3>
        <div className="chart-row">
          {/* Professional Radar Chart */}
          <div className="chart-col">
            {professionalRadarData.labels && professionalRadarData.labels.length > 0 ? (
              <Radar data={professionalRadarData} />
            ) : (
              <p>No Professional Skills Data Available</p>
            )}
          </div>

          {/* Key Recommendations */}
          <div className="chart-col">
            <h4>Key Recommendations</h4>
            <ul className="recommendation-list">
              {reportData &&
               reportData.professionalAnalysis?.recommendations &&
               reportData.professionalAnalysis.recommendations.length > 0 ? (
                reportData.professionalAnalysis.recommendations.map((rec, index) => (
                  <li key={index} className="recommendation-item">{rec}</li>
                ))
              ) : (
                <li className="recommendation-item">No Recommendations Available</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Speech Analysis */}
      <div className="detailed-analysis">
        <h3>Speech Analysis</h3>
        <div className="summary-box">
          <p id="transcript-text">User: {transcript}</p>
          <div className="metrics-row">
            <div className="metric">
              <h5>Total Words</h5>
              <div className="metric-value">{reportData ? reportData.summary.totalWords : 0}</div>
            </div>
            <div className="metric">
              <h5>Duration</h5>
              <div className="metric-value">{reportData ? reportData.summary.totalDuration : "0:00"}</div>
            </div>
            <div className="metric">
              <h5>Filler Words</h5>
              <div className="metric-value">{hasFillerWords ? reportData.fillerWords : 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Gemini Suggestions Section */}
      <div className="detailed-analysis">
        <h3>Personalized Recommendations</h3>
        <ul className="recommendation-list">
          {geminiRecommendations.length > 0 ? (
            geminiRecommendations.map((suggestion, idx) => (
              <li key={idx} className="recommendation-item">{suggestion}</li>
            ))
          ) : (
            <li className="recommendation-item">No additional suggestions.</li>
          )}
        </ul>
      </div>

      {/* Download Section */}
      <div className="download-section">
        <button className="download-button" onClick={downloadPDF}>
          <FontAwesomeIcon icon={faDownload} /> Download PDF
        </button>
        <button className="download-button" onClick={downloadJSON}>
          <FontAwesomeIcon icon={faFileCode} /> Download Raw Data
        </button>
      </div>
    </div>
  );
};

export default ReportPage;
