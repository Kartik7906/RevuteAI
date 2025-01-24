import { useState, useEffect, useRef } from "react";
import "./Task1.css";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import Swal from "sweetalert2";
import Navbar from "../Navbar/Navbar";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCRxcQJL0lRiT8nd71y4Kvwm5WTE9rwuZ0");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

function calculateOverallScore({
  wpm,
  transcriptLength,
  grammarScore,
  adherence,
  totalTimeSec,
}) {
  function normalizeWPM(x) {
    if (x <= 50) return 0;
    if (x >= 200) return 0;
    if (x < 100) return (x - 50) / 50;
    if (x <= 120) return 1;
    return 1 - (x - 120) / 80;
  }
  function normalizeLength(x) {
    if (x < 20) return 0;
    if (x < 50) return (x - 20) / 30;
    if (x <= 150) return 1;
    if (x <= 250) return 1 - ((x - 150) / 100) * 0.3;
    if (x <= 400) return 0.7 - ((x - 250) / 150) * 0.7;
    return 0;
  }
  function confidenceFactor(x, sec) {
    let base = normalizeWPM(x);
    if (sec < 10) base *= 0.7;
    return Math.max(0, Math.min(base, 1));
  }
  const wpmF = normalizeWPM(wpm);
  const lengthF = normalizeLength(transcriptLength);
  const grammarF = grammarScore / 10;
  const adherF = Math.max(0, Math.min(adherence, 1));
  const confF = confidenceFactor(wpm, totalTimeSec);

  const WEIGHT_GRAMMAR = 22;
  const WEIGHT_ADHERENCE = 22;
  const WEIGHT_WPM = 18;
  const WEIGHT_LENGTH = 18;
  const WEIGHT_CONFIDENCE = 20;

  const raw =
    grammarF * WEIGHT_GRAMMAR +
    adherF * WEIGHT_ADHERENCE +
    wpmF * WEIGHT_WPM +
    lengthF * WEIGHT_LENGTH +
    confF * WEIGHT_CONFIDENCE;

  const cappedScore = Math.min(raw, 82);
  return {
    overallScore: parseFloat(cappedScore.toFixed(2)),
    grammarBar: grammarScore,
  };
}

function calculateConfidenceScore(totalWords, totalDuration, wpm) {
  let confidenceScore = 5; 
  const seconds = totalDuration || 50;
  if (totalWords >= 130 && totalWords <= 160 && seconds <= 50) {
    confidenceScore = Math.floor(Math.random() * 2) + 5; // 5..6
  } else if (totalWords > 160 && wpm >= 130) {
    confidenceScore = Math.floor(Math.random() * 2) + 6; // 6..7
  } else if (wpm < 130) {
    confidenceScore = Math.floor(Math.random() * 2) + 4; // 4..5
  }
  if (confidenceScore > 10) confidenceScore = 10;
  return confidenceScore;
}

function adjustOverallScore(overallScore, totalWords, totalDuration, transcript) {
  let newScore = overallScore;

  if (totalWords >= 240 && totalWords <= 260 && totalDuration <= 60) {
    newScore += 2;
  }

  const keywords = ["projects", "experience", "belongs", "graduation", "leadership", "skills"];
  const transcriptLower = transcript.toLowerCase();
  let foundCount = 0;
  keywords.forEach((kw) => {
    if (transcriptLower.includes(kw)) foundCount++;
  });
  if (foundCount === keywords.length) {
    if (newScore < 70) newScore = 70;
    if (newScore > 80) newScore = 80;
  } else {
    const missing = keywords.length - foundCount;
    newScore -= missing * 3;
  }

  if (newScore < 0) newScore = 0;
  if (newScore > 100) newScore = 100;

  return parseFloat(newScore.toFixed(2));
}

const Task1 = () => {
  const [resumeInstructions, setResumeInstructions] = useState(null);
  const [currentMode, setCurrentMode] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("2:00");
  const [wordCount, setWordCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [emotion, setEmotion] = useState("Neutral");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resumeData, setResumeData] = useState(null);

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
      if (cameraRef.current) cameraRef.current.stop();
      if (faceMeshRef.current) faceMeshRef.current.close();
      if (recognitionRef.current) recognitionRef.current.stop();
      clearInterval(timerIntervalRef.current);
      clearInterval(emotionIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startTimer();
      startEmotionTracking();
      if (recognitionRef.current) recognitionRef.current.start();
    } else {
      clearInterval(timerIntervalRef.current);
      clearInterval(emotionIntervalRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  }, [isRecording]);

  useEffect(() => {
    localStorage.setItem("wordCount", wordCount);
  }, [wordCount]);

  useEffect(() => {
    localStorage.setItem("wpm", wpm);
  }, [wpm]);

  const selectMode = (mode) => {
    setCurrentMode(mode);
    setSelectedTemplate(null);
    if (mode === "dynamic") setAssessmentStarted(false);
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(templates[template]);
    setAssessmentStarted(false);
  };

  const backToModes = () => {
    setCurrentMode(null);
    setSelectedTemplate(null);
    setAssessmentStarted(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const fileContent = await file.text();
      const skills =
        fileContent
          .match(/(?:skills|technologies|proficient in):\s*([\w\s,]+)/i)?.[1]
          ?.split(",") || [];
      const projects =
        fileContent
          .match(/(?:projects|experience):\s*([\w\s,]+)/i)?.[1]
          ?.split(",") || [];
      const education =
        fileContent.match(/(?:education|degree):\s*([\w\s,]+)/i)?.[1] || "";
      const extractedData = {
        name: fileContent.match(/(?:name):\s*([\w\s]+)/i)?.[1] || "",
        skills: skills.map((s) => s.trim()),
        projects: projects.map((p) => ({
          title: p.trim(),
          description: "",
        })),
        education,
      };
      const instructions = await analyzeResumeWithGemini(extractedData);
      setResumeInstructions(instructions);
      localStorage.setItem("instructions", JSON.stringify(instructions));
      setResumeData(extractedData);
      setFileUploaded(true);
    } catch (error) {
      setErrorMessage("Resume analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const analyzeResumeWithGemini = async (resumeData) => {
    const prompt = `Based on this resume data:
    Name: ${resumeData.name}
    Skills: ${resumeData.skills.join(", ")}
    Projects: ${resumeData.projects
      .map((p) => `${p.title} - ${p.description}`)
      .join("; ")}
  
    Create a structured self-introduction guide with 4-5 key points. Format as simple numbered points without any markdown, symbols, or formatting characters.`;
    const result = await model.generateContent(prompt);
    const cleanedInstructions = result.response
      .text()
      .replace(/[*_#•]/g, "")
      .trim();
    return cleanedInstructions;
  };

  const setResume = () => {
    if (!resumeData) return;
    const customPoints = [
      `${resumeData.name}'s Background`,
      ...resumeData.skills.map((skill) => `Technical expertise in ${skill}`),
      ...resumeData.projects.map((p) => p.title),
    ];
    setSelectedTemplate({
      title: "Custom Introduction",
      points: customPoints,
    });
    setAssessmentStarted(true);
  };

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
      if (isRecording) analyzeExpression(landmarks);
    } else {
      if (isRecording) handleFaceLost();
      else setEmotion("Neutral");
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
      handleSpeechResult(transcript);
    };
    recognitionRef.current.onend = () => {
      if (isRecording) recognitionRef.current.start();
    };
  };

  const handleSpeechResult = (transcript) => {
    const words = transcript.trim().split(/\s+/);
    setWordCount((prevCount) => {
      const updatedCount = prevCount + words.length;
      speechDataRef.current.totalWords = updatedCount;
      const minutesElapsed = (Date.now() - startTimeRef.current) / 60000;
      const newWpm =
        minutesElapsed > 0 ? Math.round(updatedCount / minutesElapsed) : 0;
      setWpm(newWpm);
      speechDataRef.current.wpm = newWpm;
      speechDataRef.current.transcripts.push(transcript);
      return updatedCount;
    });
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

  const startEmotionTracking = () => {
    emotionIntervalRef.current = setInterval(() => {
      emotionDataRef.current.push({
        timestamp: Date.now(),
        emotion: emotion,
      });
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
    let currentEmotion = determineEmotion(expressions);
    setEmotion(currentEmotion);
    emotionDataRef.current.push({
      timestamp: Date.now(),
      emotion: currentEmotion,
    });
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
    return dist1 / dist2;
  };

  const startAssessment = async () => {
    const hasPermissions = await checkPermissions();
    if (hasPermissions) showConsentDialog();
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
      if (result.isConfirmed) initializeRecording();
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
        if (event.data.size > 0) recordedChunks.current.push(event.data);
      };
      const audioStream = new MediaStream(stream.getAudioTracks());
      audioRecorderRef.current = new MediaRecorder(audioStream);
      audioRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
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
    speechDataRef.current = { totalWords: 0, wpm: 0, transcripts: [] };
    startTimeRef.current = Date.now();

    if (mediaRecorderRef.current && audioRecorderRef.current) {
      mediaRecorderRef.current.start();
      audioRecorderRef.current.start();
    }
    if (startRecordButtonRef.current && stopRecordButtonRef.current) {
      startRecordButtonRef.current.style.display = "none";
      stopRecordButtonRef.current.style.display = "inline-block";
    }
    Swal.fire({
      title: "Recording Started",
      text: "You can stop recording at any time",
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
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) finishRecording();
    });
  };

  const finishRecording = async () => {
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);
    clearInterval(emotionIntervalRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioRecorderRef.current && audioRecorderRef.current.state !== "inactive") {
      audioRecorderRef.current.stop();
    }
    if (recognitionRef.current) recognitionRef.current.stop();
    if (cameraRef.current) cameraRef.current.stop();

    if (stopRecordButtonRef.current && startRecordButtonRef.current) {
      stopRecordButtonRef.current.style.display = "none";
      startRecordButtonRef.current.style.display = "inline-block";
    }
    await processRecordings();
  };

  const processRecordings = async () => {
    try {
      const videoBlob = new Blob(recordedChunks.current, { type: "video/webm" });
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

      if (result.success) {
        const serverReport = result.report;
        const grammarScoreFromServer = serverReport.grammarAnalysis?.score || 0;
        const adherenceValue = 1;
        const totalTimeSec = serverReport.summary?.totalSeconds || 120;

        let finalScores = calculateOverallScore({
          wpm: speechDataRef.current.wpm,
          transcriptLength: speechDataRef.current.totalWords,
          grammarScore: grammarScoreFromServer,
          adherence: adherenceValue,
          totalTimeSec,
        });

        const newConfidence = calculateConfidenceScore(
          speechDataRef.current.totalWords,
          totalTimeSec,
          speechDataRef.current.wpm
        );
        serverReport.sentimentAnalysis = serverReport.sentimentAnalysis || {};
        serverReport.sentimentAnalysis.confidenceScore = newConfidence;

        const fullTranscript = speechDataRef.current.transcripts.join(" ");
        let adjustedScore = adjustOverallScore(
          finalScores.overallScore,
          speechDataRef.current.totalWords,
          totalTimeSec,
          fullTranscript
        );
        finalScores.overallScore = adjustedScore;

        // Assign final scores back
        serverReport.overallScore = finalScores.overallScore;
        serverReport.grammarAnalysis.score = finalScores.grammarBar || 0;

        localStorage.setItem("reportData", JSON.stringify(serverReport));
        window.location.href = "/report";
      } else {
        throw new Error(result.message || "Processing failed");
      }
    } catch (error) {
      Swal.fire({
        title: "Processing Failed",
        text: error.message,
        icon: "error",
      });
    }
  };

  const handleFaceLost = () => {
    setEmotion("Face not detected");
  };

  const handleRecordingError = (error) => {
    Swal.fire({
      title: "Recording Error",
      text: "Failed to start recording. Please refresh and try again.",
      icon: "error",
    });
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
                {Object.entries(templates).map(([key, template]) => (
                  <div
                    key={key}
                    className="template-card"
                    onClick={() => selectTemplate(key)}
                  >
                    <h4>{template.title}</h4>
                    <p>Focus on {template.points[0]}</p>
                  </div>
                ))}
              </div>
              {selectedTemplate && !fileUploaded && (
                <div className="instructions-container">
                  <h4>{selectedTemplate.title} Guidelines</h4>
                  <div className="instructions-box">
                    <ul>
                      {selectedTemplate.points.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                    <button
                      className="task1-button"
                      onClick={() => setAssessmentStarted(true)}
                    >
                      Start Assessment
                    </button>
                  </div>
                </div>
              )}
              <hr />
              <center>Or</center>
              <div className="template-card">
                <h5>Upload Your Resume</h5>
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                />
                {loading && <p>Analyzing resume...</p>}
                {errorMessage && <p className="error">{errorMessage}</p>}
                {fileUploaded && resumeInstructions && (
                  <div className="instructions-container">
                    <h4>Personalized Introduction Guidelines</h4>
                    <div className="instructions-box">
                      {resumeInstructions
                        .trim()
                        .split("\n")
                        .map((line, index) => (
                          <p key={index}>{line.trim()}</p>
                        ))}
                      <button
                        className="task1-button"
                        onClick={() => setAssessmentStarted(true)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                    ) : resumeInstructions ? (
                      resumeInstructions
                        .trim()
                        .split("\n")
                        .map((line, index) => (
                          <li key={index}>{line.trim()}</li>
                        ))
                    ) : (
                      selectedTemplate?.points.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))
                    )}
                  </ul>
                </div>
                <center>
                  <button className="task1-button" onClick={startAssessment}>
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
