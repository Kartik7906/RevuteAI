import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./BotPage.css";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const url = "http://localhost:8000/api";

const BotPage = () => {
  const navigate = useNavigate();

  // Access environment variables
  const azureOpenAIEndpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const azureOpenAIApiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const azureOpenAIDeploymentName = import.meta.env
    .VITE_AZURE_OPENAI_DEPLOYMENT_NAME;
  const cogSvcRegion = import.meta.env.VITE_COG_SVC_REGION;
  const cogSvcSubKey = import.meta.env.VITE_COG_SVC_SUB_KEY;

  // put keys from .env file here

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationDropdownVisible, setIsNotificationDropdownVisible] =
    useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInitiated, setMessageInitiated] = useState(false);
  const [spokenTextQueue, setSpokenTextQueue] = useState([]);
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);

  const loaderRef = useRef(null);
  const microphoneRef = useRef(null);
  const stopSessionRef = useRef(null);
  const chatHistoryRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const avatarSynthesizerRef = useRef(null);
  const speechRecognizerRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const lastSpeakTimeRef = useRef(null);
  const sessionActiveRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${url}/notifications`);
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((notif) => !notif.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  const fetchScenarios = useCallback(async () => {
    try {
      const response = await fetch(`${url}/accepted-scenarios`);
      const data = await response.json();
      setScenarios(data);
      if (data.length > 0) {
        setSelectedScenario(data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    }
  }, []);

  const fetchPrompt = useCallback(async () => {
    try {
      const response = await fetch(`${url}/get_prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario_id: selectedScenario }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (messageInitiated) return data;

      if (data && data.prompt) {
        setMessages([{ role: "system", content: data.prompt }]);
        setMessageInitiated(true);
        return data;
      } else {
        throw new Error("Invalid prompt data received");
      }
    } catch (error) {
      console.error("Error fetching prompt:", error);
      alert("Failed to fetch scenario prompt. Please try again.");
      throw error;
    }
  }, [selectedScenario, messageInitiated]);

  useEffect(() => {
    fetchNotifications();
    fetchScenarios();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchScenarios]);

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownVisible((prev) => !prev);
  };

  const handleChangeLanguage = (e) => {
    const newLanguage = e.target.value;
    if (isSessionActive) {
      if (
        window.confirm("Changing language requires reconnecting. Continue?")
      ) {
        stopSession().then(() => setLanguage(newLanguage));
      }
    } else {
      setLanguage(newLanguage);
    }
  };

  const handleScenarioChange = (e) => {
    const newScenario = e.target.value;
    if (isSessionActive) {
      if (
        window.confirm(
          "Changing scenario will restart the conversation. Continue?"
        )
      ) {
        clearChatHistory();
        setSelectedScenario(newScenario);
      }
    } else {
      setSelectedScenario(newScenario);
    }
  };

  const showToast = (message, type = "info") => {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }, 100);
  };

  const markAllRead = async () => {
    try {
      const response = await fetch(`${url}/notifications/mark-all-read`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        showToast("All notifications marked as read.", "success");
      } else {
        console.error("Error marking all as read:", data.error);
        showToast("Failed to mark all as read.", "error");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      showToast("Error marking all as read.", "error");
    }
  };

  const clearChatHistory = () => {
    setMessages((prev) => {
      const systemMsg = prev.find((m) => m.role === "system");
      return systemMsg ? [systemMsg] : [];
    });
    if (chatHistoryRef.current) {
      chatHistoryRef.current.innerHTML = "";
    }
  };

  const startSession = async () => {
    try {
      loaderRef.current.style.display = "flex";
      await fetchPrompt();
      connectAvatar();
      setIsSessionActive(true);
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session.");
      if (loaderRef.current) loaderRef.current.style.display = "none";
    }
  };

  const stopSpeaking = () => {
    if (avatarSynthesizerRef.current) {
      avatarSynthesizerRef.current.stopSpeakingAsync(
        () => {
          setIsSpeaking(false);
          stopSessionRef.current.disabled = true;
          console.log("Stop speaking request sent.");
        },
        (error) => {
          console.error("Error stopping speech:", error);
        }
      );
    }
  };

  const stopSession = useCallback(async () => {
    try {
      stopSpeaking();
      await stopMicrophoneAsync();
      const chatHistory = chatHistoryRef.current
        ? chatHistoryRef.current.innerHTML
        : "";
      await saveChatHistory(chatHistory);
      disconnectAvatar();
      setIsSessionActive(false);
      if (loaderRef.current) loaderRef.current.style.display = "flex";
      if (microphoneRef.current) microphoneRef.current.disabled = true;
      if (stopSessionRef.current) stopSessionRef.current.disabled = true;
      setMessages([]);
      setMessageInitiated(false);
      setSpokenTextQueue([]);
      navigate("/report");
    } catch (error) {
      console.error("Session end error:", error);
      disconnectAvatar();
      setIsSessionActive(false);
      if (loaderRef.current) loaderRef.current.style.display = "flex";
      if (microphoneRef.current) microphoneRef.current.disabled = true;
      if (stopSessionRef.current) stopSessionRef.current.disabled = true;
      alert("Session ended with errors. Please refresh.");
    }
  }, [navigate]);

  const saveChatHistory = async (chatHistory) => {
    try {
      setShowAnalysisOverlay(true);
      const response = await fetch(`${url}/save_chat_history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatHistory }),
      });
      if (!response.ok) {
        throw new Error(`Failed to save chat history: ${response.status}`);
      }
      const result = await response.json();
      sessionStorage.setItem(
        "analysisResults",
        JSON.stringify(result.analysis)
      );
      setShowAnalysisOverlay(false);
    } catch (error) {
      console.error("Failed to save chat history:", error);
      setShowAnalysisOverlay(false);
      throw error;
    }
  };

  const connectAvatar = () => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      cogSvcSubKey,
      cogSvcRegion
    );
    const avatarConfig = new SpeechSDK.AvatarConfig("lisa", "casual-sitting");
    avatarSynthesizerRef.current = new SpeechSDK.AvatarSynthesizer(
      speechConfig,
      avatarConfig
    );
    avatarSynthesizerRef.current.avatarEventReceived = (s, e) =>
      console.log(`Avatar event: ${e.description}`);
    setupSpeechRecognition();
    requestAvatarToken();
  };

  const setupSpeechRecognition = () => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      cogSvcSubKey,
      cogSvcRegion
    );
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

    recognizer.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const userQuery = e.result.text.trim();
        if (userQuery) {
          handleUserInput(userQuery);
        }
      }
    };

    speechRecognizerRef.current = recognizer;
  };

  const requestAvatarToken = () => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      `https://${cogSvcRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`
    );
    xhr.setRequestHeader("Ocp-Apim-Subscription-Key", cogSvcSubKey);
    xhr.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        const response = JSON.parse(this.responseText);
        setupWebRTC(response.Urls[0], response.Username, response.Password);
      }
    };
    xhr.send();
  };

  const setupWebRTC = (iceServerUrl, username, credential) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: [iceServerUrl], username, credential }],
    });

    peerConnectionRef.current = pc;
    setupPeerConnectionEvents(pc);
    pc.addTransceiver("video", { direction: "sendrecv" });
    pc.addTransceiver("audio", { direction: "sendrecv" });
    startAvatar(pc);
  };

  const setupPeerConnectionEvents = (pc) => {
    pc.ontrack = (event) => {
      const element = document.createElement(event.track.kind);
      element.srcObject = event.streams[0];
      element.autoplay = true;
      if (event.track.kind === "video") {
        element.playsInline = true;
        element.onplaying = handleVideoStart;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.appendChild(element);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("WebRTC status:", pc.iceConnectionState);
      if (pc.iceConnectionState === "disconnected") {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.style.width = "0.1px";
        }
      }
    };
  };

  const startAvatar = useCallback((pc) => {
    if (avatarSynthesizerRef.current) {
      avatarSynthesizerRef.current
        .startAvatarAsync(pc)
        .then((result) => {
          if (
            result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted
          ) {
            console.log("Avatar started successfully");
          } else {
            console.error("Avatar start failed:", result);
            handleAvatarError();
          }
        })
        .catch(handleAvatarError);
    }
  }, []);

  const handleAvatarError = () => {
    console.error("Avatar start failed");
    alert("Failed to start avatar. Please try again.");
    if (loaderRef.current) loaderRef.current.style.display = "none";
    setIsSessionActive(false);
  };

  const handleUserInput = async (userQuery) => {
    try {
      const updatedMessages = [
        ...messages,
        { role: "user", content: userQuery },
      ];
      setMessages(updatedMessages);
      updateChatDisplay("User", userQuery);

      if (isSpeaking) {
        stopSpeaking();
      }

      console.log("Sending messages to Azure OpenAI:", updatedMessages);

      const response = await fetch(
        `${azureOpenAIEndpoint}/openai/deployments/${azureOpenAIDeploymentName}/chat/completions?api-version=2023-06-01-preview`,
        {
          method: "POST",
          headers: {
            "api-key": azureOpenAIApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: updatedMessages, stream: true }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Azure OpenAI Error Details:", errorText);
        throw new Error(
          `Azure OpenAI error: ${response.status} - ${errorText}`
        );
      }

      const reader = response.body.getReader();
      let assistantResponse = "";
      let currentSentence = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data:") && !line.includes("[DONE]")) {
            try {
              const data = JSON.parse(line.substring(5));
              const content = data.choices?.[0]?.delta?.content;

              if (content) {
                assistantResponse += content;
                currentSentence += content;

                if (
                  [".", "?", "!", ":", ";"].some((p) => content.includes(p))
                ) {
                  updateChatDisplay("Assistant", currentSentence);
                  speak(currentSentence);
                  currentSentence = "";
                }
              }
            } catch (err) {
              console.warn("Error parsing streaming chunk:", err);
            }
          }
        }
      }

      if (currentSentence) {
        speak(currentSentence);
        updateChatDisplay("Assistant", currentSentence);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantResponse },
      ]);
    } catch (error) {
      console.error("Error handling user input:", error);
      alert("Error processing your message. Please try again.");
    }
  };

  const updateChatDisplay = (speaker, text) => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.innerHTML += `<br/><strong>${speaker}:</strong> ${text}`;
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };

  const speak = (text) => {
    if (isSpeaking) {
      setSpokenTextQueue((prev) => [...prev, text]);
      return;
    }

    speakNext(text);
  };

  const speakNext = (text) => {
    setIsSpeaking(true);
    const selectedVoice = getVoiceForLanguage(language);

    const ssml = generateSSML(text, language, selectedVoice);
    avatarSynthesizerRef.current
      .speakSsmlAsync(ssml)
      .then(handleSpeechResult)
      .catch(handleSpeechError);
  };

  const handleSpeechResult = () => {
    setIsSpeaking(false);
    if (spokenTextQueue.length > 0) {
      const nextText = spokenTextQueue[0];
      setSpokenTextQueue((prev) => prev.slice(1));
      speakNext(nextText);
    }
  };

  const handleSpeechError = (error) => {
    console.error("Speech error:", error);
    setIsSpeaking(false);
  };

  const getVoiceForLanguage = (language) => {
    const voices = {
      "hi-IN": "hi-IN-SwaraNeural",
      "te-IN": "te-IN-ShrutiNeural",
      "ta-IN": "ta-IN-PallaviNeural",
      "kn-IN": "kn-IN-SapnaNeural",
      "en-IN": "en-IN-NeerjaNeural",
    };
    return voices[language] || "en-US-JennyMultilingualNeural";
  };

  const generateSSML = (text, language, voice) => {
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
        <voice name="${voice}">
          <mstts:embedding>
            ${htmlEncode(text)}
          </mstts:embedding>
        </voice>
      </speak>
    `;
  };

  const htmlEncode = (text) => {
    const entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };
    return String(text).replace(/[&<>"'/]/g, (s) => entityMap[s]);
  };

  const startMicrophone = () => {
    if (speechRecognizerRef.current) {
      microphoneRef.current.disabled = true;
      speechRecognizerRef.current.startContinuousRecognitionAsync(
        () => {
          microphoneRef.current.textContent = "Stop Microphone";
          microphoneRef.current.disabled = false;
        },
        (err) => {
          console.error("Start mic error:", err);
          microphoneRef.current.disabled = false;
        }
      );
    }
  };

  const stopMicrophoneAsync = async () => {
    if (speechRecognizerRef.current) {
      await new Promise((resolve, reject) => {
        speechRecognizerRef.current.stopContinuousRecognitionAsync(
          () => {
            microphoneRef.current.textContent = "Start Microphone";
            resolve();
          },
          (err) => {
            console.error("Stop mic error:", err);
            reject(err);
          }
        );
      });
    }
  };

  const handleMicrophone = () => {
    if (microphoneRef.current.textContent === "Stop Microphone") {
      stopMicrophoneAsync();
    } else {
      startMicrophone();
    }
  };

  const disconnectAvatar = () => {
    if (avatarSynthesizerRef.current) {
      avatarSynthesizerRef.current.close();
      avatarSynthesizerRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.close();
      speechRecognizerRef.current = null;
    }
    setIsSpeaking(false);
    setSpokenTextQueue([]);
    setMessages([]);
    setMessageInitiated(false);
    sessionActiveRef.current = false;
  };

  const handleStopSession = async () => {
    try {
      stopSpeaking();
      await stopMicrophoneAsync();
      const chatHistory = chatHistoryRef.current
        ? chatHistoryRef.current.innerHTML
        : "";
      await saveChatHistory(chatHistory);
      disconnectAvatar();
      setIsSessionActive(false);
      if (loaderRef.current) loaderRef.current.style.display = "flex";
      if (microphoneRef.current) microphoneRef.current.disabled = true;
      if (stopSessionRef.current) stopSessionRef.current.disabled = true;
      setMessages([]);
      setMessageInitiated(false);
      setSpokenTextQueue([]);
      navigate("/report");
    } catch (error) {
      console.error("Session end error:", error);
      disconnectAvatar();
      setIsSessionActive(false);
      if (loaderRef.current) loaderRef.current.style.display = "flex";
      if (microphoneRef.current) microphoneRef.current.disabled = true;
      if (stopSessionRef.current) stopSessionRef.current.disabled = true;
      alert("Session ended with errors. Please refresh.");
    }
  };

  const handleVideoStart = () => {
    if (loaderRef.current) loaderRef.current.style.display = "none";
    if (microphoneRef.current) microphoneRef.current.disabled = false;
    if (stopSessionRef.current) stopSessionRef.current.disabled = false;
    setIsSessionActive(true);
    lastSpeakTimeRef.current = new Date();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isSessionActive) {
        if (lastSpeakTimeRef.current) {
          const currentTime = new Date();
          if (currentTime - lastSpeakTimeRef.current > 15000 && !isSpeaking) {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.style.width = "0.1px";
            }
            setIsSessionActive(false);
            disconnectAvatar();
          }
        }

        const videoElement = remoteVideoRef.current?.querySelector("video");
        if (videoElement) {
          const currentTime = videoElement.currentTime;
          setTimeout(() => {
            if (videoElement.currentTime === currentTime && isSessionActive) {
              console.log("Video stream disconnected, reconnecting...");
              connectAvatar();
            }
          }, 2000);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSessionActive, isSpeaking, connectAvatar]);

  useEffect(() => {
    const handleUnload = () => {
      disconnectAvatar();
    };
    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, []);

  return (
    <div className="bot-page-container">
      <div className="header-container">
        <h1 className="header-title">Talking Avatar</h1>
        <div className="header-right">
          <div
            className="notification-bell-container"
            onClick={toggleNotificationDropdown}
          >
            <svg
              className="notification-bell"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>
        </div>
      </div>
      {isNotificationDropdownVisible && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>Notifications</span>
          </div>
          <div className="notification-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.read ? "read" : "unread"
                } ${notification.accepted ? "accepted" : ""}`}
              >
                <div className="notification-header">
                  <div className="notification-title">
                    {notification.title}
                    {notification.accepted && (
                      <span className="accepted-badge">✓ Accepted</span>
                    )}
                  </div>
                  <span
                    className={`source-badge ${
                      notification.source === "superadmin"
                        ? "bg-purple"
                        : "bg-blue"
                    }`}
                  >
                    {notification.source === "superadmin"
                      ? "SuperAdmin"
                      : "Admin"}
                  </span>
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-time">{notification.time}</div>
                {!notification.accepted && (
                  <div className="notification-actions">
                    <button
                      onClick={() => acceptScenario(notification.scenario_id)}
                      className="btn-accept"
                    >
                      Accept Scenario
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="notification-footer" onClick={markAllRead}>
            Mark all as read
          </div>
        </div>
      )}
      <div className="configuration-container">
        <div className="control-panel">
          <div className="select-container">
            <label htmlFor="languageSelect">Select Language</label>
            <select
              id="languageSelect"
              className="select-input"
              value={language}
              onChange={handleChangeLanguage}
            >
              <option value="en-IN">English</option>
              <option value="hi-IN">हिंदी</option>
              <option value="te-IN">తెలుగు</option>
              <option value="ta-IN">தமிழ்</option>
              <option value="kn-IN">ಕನ್ನಡ</option>
            </select>
          </div>
          <div className="select-container">
            <label htmlFor="scenarioSelect">Select Scenario</label>
            <select
              id="scenarioSelect"
              className="select-input"
              value={selectedScenario}
              onChange={handleScenarioChange}
            >
              {scenarios.length === 0 ? (
                <option disabled>No accepted scenarios available</option>
              ) : (
                scenarios.map((scenario) => (
                  <option key={scenario._id} value={scenario._id}>
                    {scenario.scenario}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>
      <div className="button-container">
        <button
          id="startSession"
          className="start-chat-button"
          onClick={startSession}
          disabled={isSessionActive}
        >
          Start Chat
        </button>
        <button
          id="microphone"
          className="start-microphone-button"
          ref={microphoneRef}
          onClick={handleMicrophone}
          disabled={!isSessionActive}
        >
          Start Microphone
        </button>
        <button
          id="stopSpeaking"
          className="stop-speaking-button"
          onClick={stopSpeaking}
          disabled={!isSessionActive || !isSpeaking}
        >
          Stop Speaking
        </button>
        <button
          id="clearChatHistory"
          className="clear-chat-button"
          onClick={clearChatHistory}
        >
          Clear Chat
        </button>
        <button
          id="stopSession"
          className="end-chat-button"
          ref={stopSessionRef}
          onClick={handleStopSession}
          disabled={!isSessionActive}
        >
          End Chat
        </button>
      </div>
      <div className="chat-container">
        <div className="video-container">
          <div ref={remoteVideoRef} className="remote-video"></div>
          <div ref={loaderRef} className="loader-container">
            <div className="loader"></div>
            <div className="loader-text">Loading Avatar...</div>
          </div>
        </div>
        <div
          className="user-message-box"
          contentEditable="true"
          ref={chatHistoryRef}
        ></div>
        <img
          id="uploadImgIcon"
          src="./image/attachment.jpg"
          alt="Upload Image"
          className="upload-img-icon"
        />
      </div>
      {showAnalysisOverlay && (
        <div className="analysis-loading-overlay">
          <div className="analysis-loading-content">
            <h3>Analyzing Conversation...</h3>
            <div className="loading-progress">
              <div className="loading-progress-bar"></div>
            </div>
            <p>Please wait while we generate your report...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotPage;
