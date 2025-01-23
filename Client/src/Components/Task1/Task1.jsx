import React, { useState, useEffect, useRef } from "react";
import "./Task1.css";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import Swal from "sweetalert2";
import Navbar from "../Navbar/Navbar";

const templates = {
  software: {
    title: "Software Engineering Introduction",
    points: [
      "Technical skills and programming languages",
      "Key projects and contributions",
      "System design experience",
      "Development methodologies",
    ],
  },
  banking: {
    title: "Banking Professional Introduction",
    points: [
      "Financial expertise and specialization",
      "Regulatory knowledge",
      "Client portfolio management",
      "Risk assessment experience",
    ],
  },
  healthcare: {
    title: "Healthcare Professional Introduction",
    points: [
      "Medical specialization",
      "Patient care experience",
      "Clinical skills",
      "Certifications and training",
    ],
  },
};

const Task1 = () => {
  const [currentMode, setCurrentMode] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);

  const selectMode = (mode) => {
    setCurrentMode(mode);
    setSelectedTemplate(null);
    if (mode === "dynamic") {
      setAssessmentStarted(false);
    }
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setAssessmentStarted(true);
  };

  const backToModes = () => {
    setCurrentMode(null);
    setSelectedTemplate(null);
    setAssessmentStarted(false);
  };

  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("2:00");
  const [wordCount, setWordCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [emotion, setEmotion] = useState("Neutral");

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const audioChunks = useRef([]);
  const timerIntervalRef = useRef(null);
  const emotionIntervalRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const emotionDataRef = useRef([]);
  const speechDataRef = useRef({
    totalWords: 0,
    wpm: 0,
    transcripts: [],
  });

  const asses1Ref = useRef(null);
  const recordingsRef = useRef(null);
  const startRecordButtonRef = useRef(null);
  const stopRecordButtonRef = useRef(null);

  useEffect(() => {
    initializeFaceMesh();
    setupSpeechRecognition();
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearInterval(timerIntervalRef.current);
      clearInterval(emotionIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startTimer();
      startEmotionTracking();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } else {
      clearInterval(timerIntervalRef.current);
      clearInterval(emotionIntervalRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [isRecording]);

  useEffect(() => {
    localStorage.setItem("wordCount", wordCount);
  }, [wordCount]);

  useEffect(() => {
    localStorage.setItem("wpm", wpm);
  }, [wpm]);

  const initializeFaceMesh = () => {
    faceMeshRef.current = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMeshRef.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });
    faceMeshRef.current.onResults(onFaceResults);
    if (videoRef.current) {
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 680,
        height: 380,
      });
      cameraRef.current.start();
    }
  };

  const onFaceResults = (results) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      if (isRecording) {
        analyzeExpression(landmarks);
      }
      console.log("Face detected.");
    } else {
      if (isRecording) {
        handleFaceLost();
      } else {
        setEmotion("Neutral");
      }
    }
  };

  const setupSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Swal.fire({
        title: "Speech Recognition Not Supported",
        text: "Your browser does not support the Speech Recognition API.",
        icon: "error",
      });
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      console.log("Transcript received:", transcript);
      handleSpeechResult(transcript);
    };
    recognitionRef.current.onend = () => {
      if (isRecording) {
        recognitionRef.current.start();
      }
    };
  };

  const handleSpeechResult = (transcript) => {
    const words = transcript.trim().split(/\s+/);
    console.log(`Words spoken: ${words.length}`);
    setWordCount((prevCount) => {
      const updatedCount = prevCount + words.length;
      speechDataRef.current.totalWords = updatedCount;
      const minutesElapsed = (Date.now() - startTimeRef.current) / 60000;
      const newWpm =
        minutesElapsed > 0 ? Math.round(updatedCount / minutesElapsed) : 0;
      setWpm(newWpm);
      speechDataRef.current.wpm = newWpm;
      speechDataRef.current.transcripts.push(transcript);
      console.log(`Updated wordCount: ${updatedCount}, WPM: ${newWpm}`);
      return updatedCount;
    });
  };

  const startAssessment = async () => {
    const hasPermissions = await checkPermissions();
    if (hasPermissions) {
      showConsentDialog();
    }
  };

  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      Swal.fire({
        title: "Permission Required",
        html: "Please enable camera and microphone access.<br><br>How to enable:<br>1. Click the camera icon in the address bar<br>2. Allow both permissions<br>3. Refresh the page",
        icon: "warning",
      });
      return false;
    }
  };

  const showConsentDialog = () => {
    Swal.fire({
      title: "Start Assessment",
      html: "This assessment will record:<br>• Video<br>• Audio<br>• Facial expressions<br>• Speech analysis",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Start",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        initializeRecording();
      }
    });
  };

  const initializeRecording = async () => {
    if (asses1Ref.current && recordingsRef.current) {
      asses1Ref.current.style.display = "none";
      recordingsRef.current.style.display = "block";
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
          console.log("Video chunk recorded.");
        }
      };
      const audioStream = new MediaStream(stream.getAudioTracks());
      audioRecorderRef.current = new MediaRecorder(audioStream);
      audioRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
          console.log("Audio chunk recorded.");
        }
      };
    } catch (error) {
      handleRecordingError(error);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setWordCount(0);
    setWpm(0);
    recordedChunks.current = [];
    audioChunks.current = [];
    emotionDataRef.current = [];
    speechDataRef.current = {
      totalWords: 0,
      wpm: 0,
      transcripts: [],
    };
    startTimeRef.current = Date.now();
    if (mediaRecorderRef.current && audioRecorderRef.current) {
      mediaRecorderRef.current.start();
      audioRecorderRef.current.start();
      console.log("MediaRecorder started.");
    }
    if (startRecordButtonRef.current && stopRecordButtonRef.current) {
      startRecordButtonRef.current.style.display = "none";
      stopRecordButtonRef.current.style.display = "inline-block";
    }
    Swal.fire({
      title: "Recording Started",
      text: "You can stop recording at any time using the Stop button",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const stopRecording = () => {
    Swal.fire({
      title: "Stop Recording?",
      text: "Are you sure you want to stop the recording?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, stop recording",
      cancelButtonText: "No, continue",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsRecording(false);
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
          console.log("MediaRecorder stopped.");
        }
        if (
          audioRecorderRef.current &&
          audioRecorderRef.current.state !== "inactive"
        ) {
          audioRecorderRef.current.stop();
          console.log("AudioRecorder stopped.");
        }
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          console.log("Speech recognition stopped.");
        }
        if (cameraRef.current) {
          cameraRef.current.stop();
          console.log("Camera stopped.");
        }
        if (stopRecordButtonRef.current && startRecordButtonRef.current) {
          stopRecordButtonRef.current.style.display = "none";
          startRecordButtonRef.current.style.display = "inline-block";
        }
        processRecordings();
      }
    });
  };

  const finishRecording = async () => {
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);
    clearInterval(emotionIntervalRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      console.log("MediaRecorder stopped due to timer.");
    }
    if (
      audioRecorderRef.current &&
      audioRecorderRef.current.state !== "inactive"
    ) {
      audioRecorderRef.current.stop();
      console.log("AudioRecorder stopped due to timer.");
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log("Speech recognition stopped due to timer.");
    }
    if (cameraRef.current) {
      cameraRef.current.stop();
      console.log("Camera stopped due to timer.");
    }
    Swal.fire({
      title: "Processing",
      html: "Analyzing your recording...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    const videoBlob = new Blob(recordedChunks.current, { type: "video/webm" });
    const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("videoFile", videoBlob, "recording.webm");
    formData.append("audioFile", audioBlob, "audio.webm");
    formData.append("emotionData", JSON.stringify(emotionDataRef.current));
    formData.append("speechData", JSON.stringify(speechDataRef.current));
    formData.append("wpm", speechDataRef.current.wpm);
    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Upload result:", result);
      if (result.success) {
        localStorage.setItem("reportData", JSON.stringify(result.report));
        window.location.href = "/report";
      } else {
        throw new Error(result.message || "Processing failed");
      }
    } catch (error) {
      console.error("Processing error:", error);
      Swal.fire({
        title: "Processing Failed",
        text: error.message,
        icon: "error",
      });
    }
  };

  const processRecordings = async () => {
    try {
      const videoBlob = new Blob(recordedChunks.current, {
        type: "video/webm",
      });
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("videoFile", videoBlob, "recording.webm");
      formData.append("audioFile", audioBlob, "audio.webm");
      formData.append("emotionData", JSON.stringify(emotionDataRef.current));
      formData.append(
        "speechData",
        JSON.stringify({
          transcripts: speechDataRef.current.transcripts,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
          wpm: speechDataRef.current.wpm,
          totalWords: speechDataRef.current.totalWords,
        })
      );
      localStorage.setItem(
        "transcript",
        JSON.stringify(speechDataRef.current.transcripts)
      );
      Swal.fire({
        title: "Processing...",
        text: "Analyzing your recording",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Upload result:", result);
      if (result.success) {
        localStorage.setItem("reportData", JSON.stringify(result.report));
        window.location.href = "/report";
      } else {
        throw new Error(result.message || "Processing failed");
      }
    } catch (error) {
      console.error("Processing error:", error);
      Swal.fire({
        title: "Processing Failed",
        text: error.message,
        icon: "error",
      });
    }
  };

  const showResults = (data) => {
    const report = data;
    const reportHTML = `
      <div class="report-container">
        <div class="report-section">
          <h3>Summary</h3>
          <p>Duration: ${report.summary.totalDuration}</p>
          <p>Words per Minute: ${report.summary.wordsPerMinute}</p>
          <p>Total Words: ${report.summary.totalWords}</p>
        </div>
        <div class="report-section">
          <h3>Grammar Analysis</h3>
          <div class="score-circle">${report.grammarAnalysis.score}/10</div>
          <p>${report.grammarAnalysis.feedback}</p>
        </div>
        <div class="report-section">
          <h3>Communication Analysis</h3>
          <div class="scores-grid">
            <div class="score-item">
              <label>Confidence</label>
              <div class="score">${report.sentimentAnalysis.confidenceScore}/10</div>
            </div>
            <div class="score-item">
              <label>Clarity</label>
              <div class="score">${report.sentimentAnalysis.clarityScore}/10</div>
            </div>
          </div>
          <p>Overall Impression: ${report.sentimentAnalysis.overallImpression}</p>
          <p>Sentiment: ${report.sentimentAnalysis.sentiment}</p>
        </div>
        <div class="report-section">
          <h3>Professional Analysis</h3>
          <div class="scores-grid">
            <div class="score-item">
              <label>Communication</label>
              <div class="score">${report.professionalAnalysis.communicationScore}/10</div>
            </div>
            <div class="score-item">
              <label>Organization</label>
              <div class="score">${report.professionalAnalysis.organizationScore}/10</div>
            </div>
          </div>
          <h4>Recommendations:</h4>
          <ul>
            ${report.professionalAnalysis.recommendations
              .map((rec) => `<li>${rec}</li>`)
              .join("")}
          </ul>
        </div>
        <div class="report-section">
          <h3>Emotion Analysis</h3>
          <div class="emotion-chart">
            ${Object.entries(report.emotionAnalysis)
              .map(
                ([emotion, percentage]) => `
              <div class="emotion-bar">
                <label>${emotion}</label>
                <div class="bar" style="width: ${percentage}%">${percentage}%</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
    Swal.fire({
      title: "Assessment Report",
      html: reportHTML,
      width: 800,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: "Download Report",
      showCancelButton: true,
      cancelButtonText: "Close",
    }).then((result) => {
      if (result.isConfirmed) {
        downloadReport(report);
      }
    });
  };

  const downloadReport = (report) => {
    const reportJson = JSON.stringify(report, null, 2);
    const blob = new Blob([reportJson], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assessment-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFaceLost = () => {
    setEmotion("Face not detected");
    console.log("Face lost during recording.");
  };

  const handleRecordingError = (error) => {
    console.error("Recording error:", error);
    Swal.fire({
      title: "Recording Error",
      text: "Failed to start recording. Please refresh and try again.",
      icon: "error",
    });
  };

  const startEmotionTracking = () => {
    let lastEmotion = "Neutral";
    emotionIntervalRef.current = setInterval(() => {
      if (lastEmotion !== "Face not detected") {
        emotionDataRef.current.push({
          timestamp: Date.now(),
          emotion: lastEmotion,
        });
      }
    }, 1000);
  };

  const analyzeExpression = (landmarks) => {
    const expressions = {
      eyeOpenness: calculateRatio(
        landmarks[159],
        landmarks[145],
        landmarks[386],
        landmarks[374]
      ),
      browRaise: calculateRatio(
        landmarks[70],
        landmarks[159],
        landmarks[300],
        landmarks[386]
      ),
      mouthOpenness: calculateRatio(
        landmarks[13],
        landmarks[14],
        landmarks[61],
        landmarks[291]
      ),
    };
    console.log("Facial Expressions Ratios:", expressions);
    let currentEmotion = determineEmotion(expressions);
    setEmotion(currentEmotion);
    emotionDataRef.current.push({
      timestamp: Date.now(),
      emotion: currentEmotion,
    });
    console.log(`Determined Emotion: ${currentEmotion}`);
  };

  const determineEmotion = (expressions) => {
    if (expressions.mouthOpenness > 0.5) return "Speaking";
    if (expressions.browRaise > 1.5) return "Happy";
    if (expressions.browRaise < 0.8) return "Sad";
    if (expressions.browRaise > 1.2) return "Engaged";
    if (expressions.eyeOpenness < 0.5) return "Blinking";
    return "Neutral";
  };

  const calculateRatio = (p1, p2, p3, p4) => {
    const dist1 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const dist2 = Math.hypot(p4.x - p3.x, p4.y - p3.y);
    const ratio = dist1 / dist2;
    console.log(`Calculated Ratio: ${ratio}`);
    return ratio;
  };

  const startTimer = () => {
    let timeLeft = 120;
    setTimer(formatTime(timeLeft));
    timerIntervalRef.current = setInterval(() => {
      timeLeft--;
      setTimer(formatTime(timeLeft));
      if (timeLeft <= 0) {
        clearInterval(timerIntervalRef.current);
        finishRecording();
      }
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      <Navbar />
      <div className="box">
        <div>
          {currentMode === null && (
            <div className="mode-selection" id="modeSelection">
              <h2 className="self">Choose Your Introduction Type</h2>
              <div className="mode-cards">
                <div className="mode-card" onClick={() => selectMode("static")}>
                  <h3>Static Introduction</h3>
                  <p>
                    Standard self-introduction format suitable for general
                    purposes
                  </p>
                  <ul className="list-unstyled">
                    <li>✓ Personal Background</li>
                    <li>✓ Educational History</li>
                    <li>✓ Work Experience</li>
                    <li>✓ Skills & Interests</li>
                  </ul>
                  <button className="button">Select Static Mode</button>
                </div>
                <div
                  className="mode-card"
                  onClick={() => selectMode("dynamic")}
                >
                  <h3>Dynamic Introduction</h3>
                  <p>Industry-specific format with customized templates</p>
                  <ul className="list-unstyled">
                    <li>✓ Role-specific Format</li>
                    <li>✓ Industry Guidelines</li>
                    <li>✓ Targeted Evaluation</li>
                    <li>✓ Specialized Feedback</li>
                  </ul>
                  <button className="button">Select Dynamic Mode</button>
                </div>
              </div>
            </div>
          )}
          {currentMode === "dynamic" && !assessmentStarted && (
            <div className="template-selection" id="templateSelection">
              <h3 className="self">Select Your Industry Template</h3>
              <div className="template-cards">
                <div
                  className="template-card"
                  onClick={() => selectTemplate("software")}
                >
                  <h4>Software Engineering</h4>
                  <p>
                    Focus on technical skills, projects, and development
                    experience
                  </p>
                </div>
                <div
                  className="template-card"
                  onClick={() => selectTemplate("banking")}
                >
                  <h4>Banking & Finance</h4>
                  <p>
                    Emphasis on financial expertise, regulations, and client
                    management
                  </p>
                </div>
                <div
                  className="template-card"
                  onClick={() => selectTemplate("healthcare")}
                >
                  <h4>Healthcare</h4>
                  <p>
                    Highlight medical expertise, patient care, and
                    certifications
                  </p>
                </div>
              </div>
              <button className="button" onClick={backToModes}>
                Back to Modes
              </button>
            </div>
          )}
          {(currentMode === "static" ||
            (currentMode === "dynamic" && assessmentStarted)) && (
            <div className="task1-box">
              <div id="asses1" className="task1-asses1" ref={asses1Ref}>
                <div className="task1-intro_text">
                  <h3>Self Introduction Assessment</h3>
                  <p>Please provide a 2-minute self-introduction covering:</p>
                  <ul>
                    {currentMode === "static" ? (
                      <>
                        <li>Your background and experience</li>
                        <li>Educational qualifications</li>
                        <li>Professional achievements</li>
                        <li>Key skills and interests</li>
                      </>
                    ) : (
                      templates[selectedTemplate] &&
                      templates[selectedTemplate].points.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))
                    )}
                  </ul>
                </div>
                <center>
                  <button
                    className="task1-button"
                    id="start"
                    onClick={startAssessment}
                  >
                    Start Assessment
                  </button>
                </center>
              </div>
              <div
                id="recordings"
                className="task1-recordings"
                ref={recordingsRef}
                style={{ display: "none" }}
              >
                <h3 className="task1-self">Self-Introduction Recording</h3>
                <div className="task1-video-container">
                  <video
                    ref={videoRef}
                    className="task1-video"
                    autoPlay
                    muted
                    playsInline
                  ></video>
                  <div id="emotion" className="task1-emotion-display">
                    Expression: {emotion}
                  </div>
                </div>
                <div className="task1-metrics-container">
                  <div className="task1-metric-card">
                    <div id="timer" className="task1-timer">
                      Time: {timer}
                    </div>
                  </div>
                  <div className="task1-metric-card">
                    <div id="wpm" className="task1-status">
                      Words per minute: {wpm}
                    </div>
                  </div>
                  <div className="task1-metric-card">
                    <div id="word-count" className="task1-status">
                      Total words: {wordCount}
                    </div>
                  </div>
                </div>
                <div className="task1-controls">
                  <button
                    className="task1-button"
                    id="start_record"
                    onClick={startRecording}
                    ref={startRecordButtonRef}
                  >
                    Start Recording
                  </button>
                  <button
                    className="task1-button stop"
                    id="stop_record"
                    onClick={stopRecording}
                    ref={stopRecordButtonRef}
                    style={{ display: "none" }}
                  >
                    Stop Recording
                  </button>
                </div>
              </div>
            </div>
          )}
          {(currentMode || selectedTemplate) && (
            <button className="button" onClick={backToModes}>
              Back to Modes
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Task1;
