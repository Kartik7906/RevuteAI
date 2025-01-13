import React, { useState, useEffect, useRef } from 'react';
import './Task1.css';
import { Camera } from '@mediapipe/camera_utils';
import { FaceMesh } from '@mediapipe/face_mesh';
import Swal from 'sweetalert2';

const Task1 = () => {
  // State Variables
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("2:00");
  const [wordCount, setWordCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [emotion, setEmotion] = useState("Neutral");

  // Refs
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
    transcripts: []
  });

  // DOM Element Refs (Removed unnecessary refs for display elements)
  const asses1Ref = useRef(null);
  const recordingsRef = useRef(null);
  const startRecordButtonRef = useRef(null);
  const stopRecordButtonRef = useRef(null);

  // Initialize FaceMesh and Speech Recognition on component mount
  useEffect(() => {
    initializeFaceMesh();
    setupSpeechRecognition();

    // Cleanup on unmount
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manage recording state effects
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // Store wordCount and wpm in localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('wordCount', wordCount);
  }, [wordCount]);

  useEffect(() => {
    localStorage.setItem('wpm', wpm);
  }, [wpm]);

  // Initialize FaceMesh
  const initializeFaceMesh = () => {
    faceMeshRef.current = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMeshRef.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
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

  // Handle face detection results
  const onFaceResults = (results) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      if (isRecording) {
        analyzeExpression(landmarks);
      }
      // For debugging
      console.log("Face detected.");
    } else {
      if (isRecording) {
        handleFaceLost();
      } else {
        setEmotion("Neutral");
      }
    }
  };

  // Setup speech recognition
  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Swal.fire({
        title: 'Speech Recognition Not Supported',
        text: 'Your browser does not support the Speech Recognition API.',
        icon: 'error'
      });
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

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

  // Handle speech results
  const handleSpeechResult = (transcript) => {
    const words = transcript.trim().split(/\s+/);
    console.log(`Words spoken: ${words.length}`);
    setWordCount(prevCount => {
      const updatedCount = prevCount + words.length;
      speechDataRef.current.totalWords = updatedCount;

      // Calculate WPM
      const minutesElapsed = (Date.now() - startTimeRef.current) / 60000;
      const newWpm = minutesElapsed > 0 ? Math.round(updatedCount / minutesElapsed) : 0;
      setWpm(newWpm);
      speechDataRef.current.wpm = newWpm;

      // Store transcript
      speechDataRef.current.transcripts.push(transcript);

      console.log(`Updated wordCount: ${updatedCount}, WPM: ${newWpm}`);

      return updatedCount;
    });
  };

  // Start assessment
  const startAssessment = async () => {
    const hasPermissions = await checkPermissions();
    if (hasPermissions) {
      showConsentDialog();
    }
  };

  // Check permissions
  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      Swal.fire({
        title: 'Permission Required',
        html: 'Please enable camera and microphone access.<br><br>How to enable:<br>1. Click the camera icon in the address bar<br>2. Allow both permissions<br>3. Refresh the page',
        icon: 'warning'
      });
      return false;
    }
  };

  // Show consent dialog
  const showConsentDialog = () => {
    Swal.fire({
      title: 'Start Assessment',
      html: 'This assessment will record:<br>• Video<br>• Audio<br>• Facial expressions<br>• Speech analysis',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Start',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        initializeRecording();
      }
    });
  };

  // Initialize recording interface
  const initializeRecording = async () => {
    if (asses1Ref.current && recordingsRef.current) {
      asses1Ref.current.style.display = 'none';
      recordingsRef.current.style.display = 'block';
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;

      // Setup MediaRecorder for video
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
          console.log("Video chunk recorded.");
        }
      };

      // Setup MediaRecorder for audio
      const audioStream = new MediaStream(stream.getAudioTracks());
      audioRecorderRef.current = new MediaRecorder(audioStream);
      audioRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
          console.log("Audio chunk recorded.");
        }
      };
    } catch (error) {
      handleRecordingError(error);
    }
  };

  // Start recording
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
      transcripts: []
    };
    startTimeRef.current = Date.now();

    if (mediaRecorderRef.current && audioRecorderRef.current) {
      mediaRecorderRef.current.start();
      audioRecorderRef.current.start();
      console.log("MediaRecorder started.");
    }

    if (startRecordButtonRef.current && stopRecordButtonRef.current) {
      startRecordButtonRef.current.style.display = 'none';
      stopRecordButtonRef.current.style.display = 'inline-block';
    }

    Swal.fire({
      title: 'Recording Started',
      text: 'You can stop recording at any time using the Stop button',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Stop recording
  const stopRecording = () => {
    Swal.fire({
      title: 'Stop Recording?',
      text: 'Are you sure you want to stop the recording?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, stop recording',
      cancelButtonText: 'No, continue'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsRecording(false);

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
          console.log("MediaRecorder stopped.");
        }
        if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
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
          stopRecordButtonRef.current.style.display = 'none';
          startRecordButtonRef.current.style.display = 'inline-block';
        }

        processRecordings();
      }
    });
  };

  // Finish recording and process data
  const finishRecording = async () => {
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);
    clearInterval(emotionIntervalRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log("MediaRecorder stopped due to timer.");
    }
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
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

    // Show processing dialog
    Swal.fire({
      title: 'Processing',
      html: 'Analyzing your recording...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Process recordings
    const videoBlob = new Blob(recordedChunks.current, { type: 'video/webm' });
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });

    // Prepare data for upload
    const formData = new FormData();
    formData.append('videoFile', videoBlob, 'recording.webm');
    formData.append('audioFile', audioBlob, 'audio.webm');
    formData.append('emotionData', JSON.stringify(emotionDataRef.current));
    formData.append('speechData', JSON.stringify(speechDataRef.current));
    formData.append('wpm', speechDataRef.current.wpm);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Upload result:', result); // Debug log

      if (result.success) {
        // Store report data
        localStorage.setItem('reportData', JSON.stringify(result.report));

        // Redirect to report page
        window.location.href = '/report';
      } else {
        throw new Error(result.message || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      Swal.fire({
        title: 'Processing Failed',
        text: error.message,
        icon: 'error'
      });
    }
  };

  // Process recordings (called from stopRecording)
  const processRecordings = async () => {
    try {
      const videoBlob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });

      const formData = new FormData();
      formData.append('videoFile', videoBlob, 'recording.webm');
      formData.append('audioFile', audioBlob, 'audio.webm');
      formData.append('emotionData', JSON.stringify(emotionDataRef.current));
      formData.append('speechData', JSON.stringify({
        transcripts: speechDataRef.current.transcripts,
        duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
        wpm: speechDataRef.current.wpm,
        totalWords: speechDataRef.current.totalWords
      }));

      // Show loading
      Swal.fire({
        title: 'Processing...',
        text: 'Analyzing your recording',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Upload result:', result); // Debug log

      if (result.success) {
        // Store report data
        localStorage.setItem('reportData', JSON.stringify(result.report));

        // Redirect
        window.location.href = '/report';
      } else {
        throw new Error(result.message || 'Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      Swal.fire({
        title: 'Processing Failed',
        text: error.message,
        icon: 'error'
      });
    }
  };

  // Show results dialog (Optional, based on your original code)
  const showResults = (data) => {
    const report = data; // Assuming data is the report object

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
            ${report.professionalAnalysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>

        <div class="report-section">
          <h3>Emotion Analysis</h3>
          <div class="emotion-chart">
            ${Object.entries(report.emotionAnalysis).map(([emotion, percentage]) => `
              <div class="emotion-bar">
                <label>${emotion}</label>
                <div class="bar" style="width: ${percentage}%">${percentage}%</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      title: 'Assessment Report',
      html: reportHTML,
      width: 800,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Download Report',
      showCancelButton: true,
      cancelButtonText: 'Close'
    }).then((result) => {
      if (result.isConfirmed) {
        downloadReport(report);
      }
    });
  };

  // Function to download report as PDF or JSON
  const downloadReport = (report) => {
    const reportJson = JSON.stringify(report, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Handle face lost during recording
  const handleFaceLost = () => {
    setEmotion("Face not detected");
    console.log("Face lost during recording.");
  };

  // Handle recording error
  const handleRecordingError = (error) => {
    console.error('Recording error:', error);
    Swal.fire({
      title: 'Recording Error',
      text: 'Failed to start recording. Please refresh and try again.',
      icon: 'error'
    });
  };

  // Start emotion tracking
  const startEmotionTracking = () => {
    let lastEmotion = 'Neutral';
    emotionIntervalRef.current = setInterval(() => {
      if (lastEmotion !== 'Face not detected') {
        emotionDataRef.current.push({
          timestamp: Date.now(),
          emotion: lastEmotion
        });
      }
    }, 1000);
  };

  // Analyze facial expressions
  const analyzeExpression = (landmarks) => {
    const expressions = {
      eyeOpenness: calculateRatio(landmarks[159], landmarks[145], landmarks[386], landmarks[374]),
      browRaise: calculateRatio(landmarks[70], landmarks[159], landmarks[300], landmarks[386]),
      mouthOpenness: calculateRatio(landmarks[13], landmarks[14], landmarks[61], landmarks[291])
    };

    console.log("Facial Expressions Ratios:", expressions);

    let currentEmotion = determineEmotion(expressions);
    setEmotion(currentEmotion);
    emotionDataRef.current.push({
      timestamp: Date.now(),
      emotion: currentEmotion
    });

    console.log(`Determined Emotion: ${currentEmotion}`);
  };

  // Determine emotion from expressions
  const determineEmotion = (expressions) => {
    // Enhanced emotion detection logic with adjusted thresholds
    if (expressions.mouthOpenness > 0.5) return "Speaking";
    if (expressions.browRaise > 1.5) return "Happy";
    if (expressions.browRaise < 0.8) return "Sad";
    if (expressions.browRaise > 1.2) return "Engaged";
    if (expressions.eyeOpenness < 0.5) return "Blinking";

    return "Neutral";
  };

  // Calculate facial ratios
  const calculateRatio = (p1, p2, p3, p4) => {
    const dist1 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const dist2 = Math.hypot(p4.x - p3.x, p4.y - p3.y);
    const ratio = dist1 / dist2;
    console.log(`Calculated Ratio: ${ratio}`);
    return ratio;
  };

  // Start timer
  const startTimer = () => {
    let timeLeft = 120; // 2 minutes in seconds
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

  // Format time helper
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="box">
      <div id="asses1" className="asses1" ref={asses1Ref}>
        <div className="intro_text">
          <h3>Self Introduction Assessment</h3>
          <p>Please provide a 2-minute self-introduction covering:</p>
          <ul>
            <li>Your background and experience</li>
            <li>Educational qualifications</li>
            <li>Professional achievements</li>
            <li>Key skills and interests</li>
          </ul>
        </div>
        <center>
          <button className="button" id="start" onClick={startAssessment}>Start Assessment</button>
        </center>
      </div>

      <div id="recordings" className="recordings" ref={recordingsRef} style={{ display: 'none' }}>
        <h3 className="self">Self-Introduction Recording</h3>

        <div className="video-container">
          <video ref={videoRef} className="video" autoPlay muted playsInline></video>
          <div id="emotion" className="emotion-display">Expression: {emotion}</div>
        </div>

        <div className="metrics-container">
          <div className="metric-card">
            <div id="timer" className="timer">Time: {timer}</div>
          </div>
          <div className="metric-card">
            <div id="wpm" className="status">Words per minute: {wpm}</div>
          </div>
          <div className="metric-card">
            <div id="word-count" className="status">Total words: {wordCount}</div>
          </div>
        </div>

        <div className="controls">
          <button className="button" id="start_record" onClick={startRecording} ref={startRecordButtonRef}>Start Recording</button>
          <button className="button stop" id="stop_record" onClick={stopRecording} ref={stopRecordButtonRef} style={{ display: 'none' }}>Stop Recording</button>
        </div>
      </div>
    </div>
  );
};

export default Task1;
