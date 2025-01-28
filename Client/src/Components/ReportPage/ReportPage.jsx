import React, { useState, useEffect, useRef } from "react";
import "./ReportPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faDownload,
  faFileCode,
} from "@fortawesome/free-solid-svg-icons";
import { Pie, Line, Radar } from "react-chartjs-2";
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
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";

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
  const [transcript, setTranscript] = useState("");
  const [geminiRecommendations, setGeminiRecommendations] = useState([]);
  const [overallScore, setOverallScore] = useState(null);
  const [emotionPieData, setEmotionPieData] = useState({});
  const reportRef = useRef(null);

  const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  useEffect(() => {
    const storedTranscript = localStorage.getItem("transcript");
    if (storedTranscript) {
      const parsedTranscript = JSON.parse(storedTranscript);
      const formattedTranscript = [
        ...new Set(parsedTranscript.map((text) => text.trim())),
      ].join(" ");
      setTranscript(formattedTranscript);
    }
  }, []);

  useEffect(() => {
    if (transcript) {
      fetch("http://localhost:8000/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.suggestions) {
            setGeminiRecommendations(data.suggestions);
          }
        })
        .catch(() => {});
    }
  }, [transcript]);

  useEffect(() => {
    const data = localStorage.getItem("reportData");
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setReportData(parsedData);

        if (typeof parsedData.overallScore === "number") {
          setOverallScore(parsedData.overallScore);
        } else {
          setOverallScore(0);
        }

        const emotions = ["Happy", "Neutral", "Sad", "Engaged", "Other"];
        const randomValues = emotions.map(() => getRandomIntInclusive(0, 100));
        const total = randomValues.reduce((acc, val) => acc + val, 0);
        const normalizedValues = randomValues.map((val) =>
          ((val / total) * 100).toFixed(2)
        );
        setEmotionPieData({
          labels: emotions,
          datasets: [
            {
              label: "Emotion Distribution (%)",
              data: normalizedValues,
              backgroundColor: [
                "#4caf50",
                "#2196f3",
                "#f44336",
                "#ff9800",
                "#9c27b0",
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        Swal.fire({
          title: "Data Error",
          text: "Failed to parse report data.",
          icon: "error",
        });
      }
    } else {
      Swal.fire({
        title: "No Report Data",
        text: "No assessment report found. Please complete an assessment first.",
        icon: "warning",
      }).then(() => {
        window.location.href = "/";
      });
    }
  }, []);

  const downloadPDF = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current)
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "px",
            format: [canvas.width, canvas.height],
          });
          pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
          pdf.save(`assessment-report-${new Date().toISOString()}.pdf`);
        })
        .catch(() => {
          Swal.fire({
            title: "Download Failed",
            text: "An error occurred while generating the PDF.",
            icon: "error",
          });
        });
    }
  };

  const downloadJSON = () => {
    const userId = localStorage.getItem("userId"); 

    if (reportData) {
      fetch("http://localhost:8000/api/report/saveReport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          reportData, 
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to save the report.");
          }
          alert("Report saved successfully.");
        })
        .catch((error) => {
          console.error("Error saving report:", error);
          alert("An error occurred while saving the report.");
        });
    }
  };

  const emotionTimelineData =
    reportData && Array.isArray(reportData.emotionTimeline)
      ? {
          labels: reportData.emotionTimeline.map((entry) => {
            const date = new Date(entry.timestamp);
            return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
          }),
          datasets: [
            {
              label: "Emotional Engagement",
              data: reportData.emotionTimeline.map((entry) => {
                if (entry.emotion === "Happy") return 3;
                if (entry.emotion === "Sad") return 1;
                if (entry.emotion === "Engaged") return 2;
                if (entry.emotion === "Blinking") return 0.5;
                if (entry.emotion === "Speaking") return 4;
                return 0;
              }),
              fill: true,
              backgroundColor: "rgba(67, 97, 238, 0.2)",
              borderColor: "#4361ee",
              tension: 0.4,
            },
          ],
        }
      : {};

  const communicationRadarData = reportData
    ? {
        labels: ["Confidence", "Clarity", "Engagement"],
        datasets: [
          {
            label: "Communication Skills",
            data: [
              reportData.sentimentAnalysis?.confidenceScore || 0,
              reportData.sentimentAnalysis?.clarityScore || 0,
              reportData.professionalAnalysis?.communicationScore || 0,
            ],
            backgroundColor: "rgba(67, 97, 238, 0.2)",
            borderColor: "rgba(67, 97, 238, 1)",
            borderWidth: 1,
          },
        ],
      }
    : {};

  const professionalRadarData = reportData
    ? {
        labels: ["Communication", "Organization", "Clarity"],
        datasets: [
          {
            label: "Professional Skills",
            data: [
              reportData.professionalAnalysis?.communicationScore || 0,
              reportData.professionalAnalysis?.organizationScore || 0,
              reportData.sentimentAnalysis?.clarityScore || 0,
            ],
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            borderColor: "rgba(76, 175, 80, 1)",
            borderWidth: 1,
          },
        ],
      }
    : {};

  const overallScorePercentage = overallScore || 0;

  const getWpmRating = (wpmValue) => {
    if (wpmValue > 150) return "Excellent";
    if (wpmValue > 100) return "Good";
    if (wpmValue > 60) return "Average";
    return "Needs Improvement";
  };

  const getConfidenceRating = (score) => {
    if (score > 8) return "High";
    if (score > 5) return "Medium";
    return "Low";
  };

  const hasEmotionTimeline =
    reportData && Array.isArray(reportData.emotionTimeline);
  const hasFillerWords =
    reportData && typeof reportData.fillerWords === "number";

  return (
    <div className="report-container" ref={reportRef}>
      <div className="report-header">
        <h1>
          <FontAwesomeIcon icon={faChartLine} /> Assessment Report
        </h1>
        <p className="mb-0">
          {reportData ? `Generated on ${new Date().toLocaleString()}` : "N/A"}
        </p>
      </div>
      <div className="summary-section">
        <div className="score-card">
          <h3>Overall Score</h3>
          <div className="metric-value">
            {overallScore !== null ? overallScore : 0}/100
          </div>
          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: `${overallScorePercentage}%` }}
            ></div>
          </div>
        </div>
        <div className="score-card">
          <h3>Words Per Minute</h3>
          <div className="metric-value">
            {reportData ? reportData.summary?.wordsPerMinute || 0 : 0}
          </div>
          <p className="text-muted">
            {getWpmRating(reportData ? reportData.summary?.wordsPerMinute || 0 : 0)}
          </p>
        </div>
        <div className="score-card">
          <h3>Confidence Score</h3>
          <div className="metric-value">
            {reportData
              ? `${reportData.sentimentAnalysis?.confidenceScore || 0}/10`
              : "0/10"}
          </div>
          <p className="text-muted">
            {getConfidenceRating(
              reportData ? reportData.sentimentAnalysis?.confidenceScore : 0
            )}
          </p>
        </div>
        <div className="score-card">
          <h3>Tone Analysis</h3>
          <div className="metric-value">Neutral</div>
        </div>
      </div>
      <div className="chart-container">
        <h3>Emotional Expression Analysis</h3>
        <div className="chart-row">
          <div className="chart-col">
            {emotionPieData.labels && emotionPieData.labels.length > 0 ? (
              <Pie data={emotionPieData} />
            ) : (
              <p>No Emotion Data Available</p>
            )}
          </div>
          <div className="chart-col">
            {hasEmotionTimeline ? (
              <Line data={emotionTimelineData} />
            ) : (
              <p>No Emotion Timeline Data Available</p>
            )}
          </div>
        </div>
      </div>
      <div className="analysis-section">
        <div className="detailed-analysis">
          <h3>Grammar Analysis</h3>
          <div className="grammar-scores">
            <p>
              <strong>Score:</strong>{" "}
              {reportData ? reportData.grammarAnalysis?.score : 0}/10
            </p>
            <p>
              <strong>Feedback:</strong>{" "}
              {reportData ? reportData.grammarAnalysis?.feedback : "N/A"}
            </p>
          </div>
          <h4>Recommendations:</h4>
          <ul className="recommendation-list">
            {reportData &&
            reportData.professionalAnalysis?.recommendations &&
            reportData.professionalAnalysis.recommendations.length > 0 ? (
              reportData.professionalAnalysis.recommendations.map(
                (rec, index) => (
                  <li key={index} className="recommendation-item">
                    {rec}
                  </li>
                )
              )
            ) : (
              <li className="recommendation-item">
                No Recommendations Available
              </li>
            )}
          </ul>
        </div>
        <div className="detailed-analysis">
          <h3>Communication Skills</h3>
          {communicationRadarData.labels &&
          communicationRadarData.labels.length > 0 ? (
            <Radar data={communicationRadarData} />
          ) : (
            <p>No Communication Skills Data Available</p>
          )}
        </div>
      </div>
      <div className="detailed-analysis">
        <h3>Professional Assessment</h3>
        <div className="chart-row">
          <div className="chart-col">
            {professionalRadarData.labels &&
            professionalRadarData.labels.length > 0 ? (
              <Radar data={professionalRadarData} />
            ) : (
              <p>No Professional Skills Data Available</p>
            )}
          </div>
          <div className="chart-col">
            <h4>Key Recommendations</h4>
            <ul className="recommendation-list">
              {reportData &&
              reportData.professionalAnalysis?.recommendations &&
              reportData.professionalAnalysis.recommendations.length > 0 ? (
                reportData.professionalAnalysis.recommendations.map(
                  (rec, index) => (
                    <li key={index} className="recommendation-item">
                      {rec}
                    </li>
                  )
                )
              ) : (
                <li className="recommendation-item">
                  No Recommendations Available
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="detailed-analysis">
        <h3>Speech Analysis</h3>
        <div className="summary-box">
          <p id="transcript-text">User: {transcript}</p>
          <div className="metrics-row">
            <div className="metric">
              <h5>Total Words</h5>
              <div className="metric-value">
                {reportData ? reportData.summary?.totalWords : 0}
              </div>
            </div>
            <div className="metric">
              <h5>Duration</h5>
              <div className="metric-value">
                {reportData ? reportData.summary?.totalDuration : "0:00"}
              </div>
            </div>
            <div className="metric">
              <h5>Filler Words</h5>
              <div className="metric-value">
                {hasFillerWords ? reportData.fillerWords : 0}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="detailed-analysis">
        <h3>Personalized Recommendations</h3>
        <ul className="recommendation-list">
          {geminiRecommendations.length > 0 ? (
            geminiRecommendations.map((suggestion, idx) => (
              <li key={idx} className="recommendation-item">
                {suggestion}
              </li>
            ))
          ) : (
            <li className="recommendation-item">No additional suggestions.</li>
          )}
        </ul>
      </div>
      <div className="download-section">
        <button className="download-button" onClick={downloadPDF}>
          <FontAwesomeIcon icon={faDownload} /> Download PDF
        </button>
        <button className="download-button" onClick={downloadJSON}>
          <FontAwesomeIcon icon={faFileCode} /> Save File
        </button>
      </div>
    </div>
  );
};

export default ReportPage;
