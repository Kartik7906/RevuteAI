import React, { useState, useEffect, useRef, useCallback } from "react";
import "./BotPage.css";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { useNavigate } from "react-router-dom";
const URL = "http://localhost:8000/api";

const BotPage = () => {
  const navigate = useNavigate();

  // add links here: -- start from here:

  // add links here --ends from here:

  const [messages, setMessages] = useState([]);
  const [messageInitiated, setMessageInitiated] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const [chatHistory, setChatHistory] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenTextQueue, setSpokenTextQueue] = useState([]);
  const [language, setLanguage] = useState("en-IN");
  const [selectedScenario, setSelectedScenario] = useState("");
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationDropdownVisible, setIsNotificationDropdownVisible] =
    useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [lastSpeakTime, setLastSpeakTime] = useState(null);

  const sentenceLevelPunctuations = [
    ".",
    "?",
    "!",
    ":",
    ";",
    "।",
    "?",
    "!",
    ":",
    ";",
  ];

  const speechRecognizerRef = useRef(null);
  const avatarSynthesizerRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // i dont know what is this, look at this again
  const htmlEncode = (txt) => {
    const entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
    };
    return String(txt).replace(/[&<>"'/]/g, (s) => entityMap[s]);
  };

  const getVoiceForLanguage = (lang) => {
    const voices = {
      "hi-IN": "hi-IN-SwaraNeural",
      "te-IN": "te-IN-ShrutiNeural",
      "ta-IN": "ta-IN-PallaviNeural",
      "kn-IN": "kn-IN-SapnaNeural",
      "en-IN": "en-IN-NeerjaNeural",
    };
    return voices[lang] || "en-US-JennyMultilingualNeural";
  };

  const generateSSML = (text, lang, voice, endingSilenceMs = 0) => {
    let ssml = `
      <speak version='1.0'
             xmlns='http://www.w3.org/2001/10/synthesis'
             xmlns:mstts='http://www.w3.org/2001/mstts'
             xml:lang='${lang}'>
        <voice name='${voice}'>
          <mstts:ttsembedding>
            <mstts:leadingsilence-exact value='0'/>
            ${htmlEncode(text)}
          </mstts:ttsembedding>
        </voice>
      </speak>
    `;
    if (endingSilenceMs > 0) {
      ssml = ssml.replace(
        "</mstts:ttsembedding>",
        `<break time='${endingSilenceMs}ms' /></mstts:ttsembedding>`
      );
    }
    return ssml;
  };

  const showToast = useCallback((message, type = "info") => {
    alert(`${type.toUpperCase()}: ${message}`);
  }, []);

  // 2. Chat Display logic
  const updateChatDisplay = useCallback((speaker, text, append = true) => {
    setChatHistory((prev) => {
      if (!append) {
        return `${prev}<br/><strong>${speaker}:</strong> `;
      }
      return prev + text;
    });
  }, []);

  // 3. Microphone Logic not working check this again
  const startMicrophoneAsync = useCallback(() => {
    const recognizer = speechRecognizerRef.current;

    if (!recognizer) {
      console.error("Speech recognizer is not initialized.");
      return;
    }

    try {
      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log("Microphone started successfully.");
          setIsMicrophoneActive(true);
        },
        (err) => {
          console.error("Error starting microphone recognition:", err);
        }
      );
    } catch (error) {
      console.error("Unexpected error starting microphone:", error);
    }
  }, []);

  const stopMicrophoneAsync = useCallback(() => {
    const recognizer = speechRecognizerRef.current;
    if (!recognizer) return Promise.resolve();
    return new Promise((resolve, reject) => {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          setIsMicrophoneActive(false);
          resolve();
        },
        (err) => {
          console.error("Stop mic error:", err);
          reject(err);
        }
      );
    });
  }, []);

  const microphone = useCallback(() => {
    if (isMicrophoneActive) {
      stopMicrophoneAsync();
    } else {
      startMicrophoneAsync();
    }
  }, [isMicrophoneActive, stopMicrophoneAsync, startMicrophoneAsync]);

  const autoStopMicrophone = useCallback(() => {
    if (isMicrophoneActive) {
      stopMicrophoneAsync();
    }
  }, [isMicrophoneActive, stopMicrophoneAsync]);

  const autoStartMicrophone = useCallback(() => {
    if (!isSpeaking && !isMicrophoneActive) {
      startMicrophoneAsync();
    }
  }, [isSpeaking, isMicrophoneActive, startMicrophoneAsync]);

  // 4. Speech logic:
  const speakNext = useCallback(
    (text, endingSilenceMs = 0) => {
      autoStopMicrophone();
      const voice = getVoiceForLanguage(language);
      const ssml = generateSSML(text, language, voice, endingSilenceMs);
      setLastSpeakTime(new Date());
      setIsSpeaking(true);

      const synthesizer = avatarSynthesizerRef.current;
      if (!synthesizer) return;

      synthesizer
        .speakSsmlAsync(ssml)
        .then(() => {
          setTimeout(() => {
            if (spokenTextQueue.length === 0) autoStartMicrophone();
          }, 800);

          setSpokenTextQueue((prevQueue) => {
            if (prevQueue.length > 0) {
              const [nextText, ...rest] = prevQueue;
              speakNext(nextText, 0);
              return rest;
            }
            setIsSpeaking(false);
            return [];
          });
        })
        .catch((error) => {
          console.error("Speech error:", error);
          setIsSpeaking(false);
          setSpokenTextQueue([]);
        });
    },
    [autoStopMicrophone, autoStartMicrophone, language, spokenTextQueue.length]
  );

  const speak = useCallback(
    (text, endingSilenceMs = 0) => {
      if (isSpeaking) {
        setSpokenTextQueue((prev) => [...prev, text]);
      } else {
        speakNext(text, endingSilenceMs);
      }
    },
    [isSpeaking, speakNext]
  );

  const stopSpeaking = useCallback(() => {
    setSpokenTextQueue([]);
    if (avatarSynthesizerRef.current) {
      avatarSynthesizerRef.current
        .stopSpeakingAsync()
        .then(() => setIsSpeaking(false))
        .catch((err) => console.error("Error stopping speech:", err));
    }
  }, []);

  // 5. Speech Recognizer Setup
  const setupSpeechRecognition = useCallback(() => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      cogSvcSubKey,
      cogSvcRegion
    );
    speechConfig.speechRecognitionLanguage = language;

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

    recognizer.recognized = (_s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const userQuery = e.result.text.trim();
        if (userQuery) {
          handleUserInput(userQuery);
        }
      }
    };

    speechRecognizerRef.current = recognizer;
  }, [language, cogSvcRegion, cogSvcSubKey]);

  // 6. User Input Handling -> Azure OpenAI
  const handleUserInput = useCallback(
    async (userQuery) => {
      try {
        autoStopMicrophone();

        setMessages((prev) => [...prev, { role: "user", content: userQuery }]);
        updateChatDisplay("User", `<br/>${userQuery}`);

        // Stop any current speech synthesis
        if (isSpeaking) {
          stopSpeaking();
        }

        // Define the Azure OpenAI API endpoint
        const url = `${azureOpenAIEndpoint}/openai/deployments/${azureOpenAIDeploymentName}/chat/completions?api-version=2023-06-01-preview`;

        // Prepare the payload
        const payload = {
          messages: [
            ...messages, // Include previous messages for context
            { role: "user", content: userQuery },
          ],
          max_tokens: 1000, // Adjust as needed
          temperature: 0.7, // Adjust as needed
          stream: true, // Enable streaming
        };

        // Make the API request
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "api-key": azureOpenAIApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // Handle non-200 responses
        if (!response.ok) {
          const errorDetails = await response.text();
          console.error("Azure OpenAI API error:", errorDetails);
          throw new Error(`Azure OpenAI error: ${response.status}`);
        }

        // Process streaming response
        const reader = response.body.getReader();
        let assistantResponse = "";
        let currentSentence = "";

        // Start updating the assistant's response in the UI
        updateChatDisplay("Assistant", "", false);

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

                  // Check for sentence-ending punctuation
                  if (
                    sentenceLevelPunctuations.some((p) => content.includes(p))
                  ) {
                    speak(currentSentence);
                    updateChatDisplay("Assistant", currentSentence, true);
                    currentSentence = "";
                  }
                }
              } catch (err) {
                console.warn("Error parsing chunk:", err);
              }
            }
          }
        }

        // Handle any remaining text
        if (currentSentence) {
          speak(currentSentence);
          updateChatDisplay("Assistant", currentSentence, true);
        }

        // Update state with the full assistant response
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantResponse },
        ]);
      } catch (error) {
        console.error("Chat error:", error);
        alert("Error processing your message. Please try again.");
      }
    },
    [
      autoStopMicrophone,
      azureOpenAIEndpoint,
      azureOpenAIDeploymentName,
      azureOpenAIApiKey,
      isSpeaking,
      messages,
      sentenceLevelPunctuations,
      speak,
      stopSpeaking,
      updateChatDisplay,
    ]
  );

  // 7. fetch avatar from here, this is not working look again
  const handleTrackEvent = useCallback((event) => {
    const kind = event.track.kind;
    const newElem = document.createElement(kind);
    newElem.srcObject = event.streams[0];
    newElem.autoplay = true;

    if (kind === "video") {
      newElem.playsInline = true;
      newElem.onplaying = () => {
        setIsLoadingAvatar(false);
        setIsMicrophoneActive(false);
        setLastSpeakTime(new Date());
        setTimeout(() => setIsSessionActive(true), 5000);
      };
    }

    const container = document.getElementById("bot-remote-video-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(newElem);
    }
  }, []);

  const startAvatar = useCallback((pc) => {
    const synthesizer = avatarSynthesizerRef.current;
    if (!synthesizer) {
      console.error("No avatarSynthesizer found");
      return;
    }

    synthesizer
      .startAvatarAsync(pc)
      .then((result) => {
        if (
          result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted
        ) {
          console.error("Avatar start failed:", result);
          setIsSessionActive(false);
          setIsLoadingAvatar(false);
        }
      })
      .catch((err) => {
        console.error("Avatar start error:", err);
        setIsSessionActive(false);
        setIsLoadingAvatar(false);
      });
  }, []);

  const setupWebRTC = useCallback(
    (iceServerUrl, username, credential) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: [iceServerUrl], username, credential }],
      });
      peerConnectionRef.current = pc;

      pc.ontrack = handleTrackEvent;
      pc.oniceconnectionstatechange = () => {
        console.log("WebRTC status:", pc.iceConnectionState);
      };

      pc.addTransceiver("video", { direction: "sendrecv" });
      pc.addTransceiver("audio", { direction: "sendrecv" });

      startAvatar(pc);
    },
    [handleTrackEvent, startAvatar]
  );

  // here is also some key handles:
  const requestAvatarToken = useCallback(() => {
    const xhr = new XMLHttpRequest();
    // also add here keys and urls --start from here 

    // --ends here
    xhr.open(
      "GET",
      `https://${cogSvcRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`
    );
    xhr.setRequestHeader("Ocp-Apim-Subscription-Key", cogSvcSubKey);
    xhr.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        const response = JSON.parse(this.responseText);
        if (response.Urls && response.Urls[0]) {
          setupWebRTC(response.Urls[0], response.Username, response.Password);
        }
      }
    };
    xhr.send();
  }, [setupWebRTC]);

  const connectAvatar = useCallback(() => {
    if (!SpeechSDK) {
      console.error("SpeechSDK not found.");
      return;
    }
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      cogSvcSubKey,
      cogSvcRegion
    );
    const avatarConfig = new SpeechSDK.AvatarConfig("lisa", "casual-sitting");
    const synthesizer = new SpeechSDK.AvatarSynthesizer(
      speechConfig,
      avatarConfig
    );
    avatarSynthesizerRef.current = synthesizer;

    synthesizer.avatarEventReceived = (_s, e) => {
      console.log(`Avatar event: ${e.description}`);
    };

    setupSpeechRecognition();
    requestAvatarToken();
  }, [cogSvcSubKey, cogSvcRegion, requestAvatarToken, setupSpeechRecognition]);

  // 8. Prompt, Session Start/Stop
  const fetchPrompt = useCallback(async () => {
    if (!selectedScenario) {
      throw new Error("No scenario selected.");
    }
    const response = await fetch(`${URL}/scenarios/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario_id: selectedScenario }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!messageInitiated && data?.prompt) {
      const systemMessage = { role: "system", content: data.prompt };
      setMessages([systemMessage]);
      setMessageInitiated(true);
    }
    return data;
  }, [selectedScenario, messageInitiated]);

  const startSession = useCallback(async () => {
    try {
      if (!selectedScenario) {
        throw new Error("No scenario selected.");
      }
      setIsLoadingAvatar(true);
      await fetchPrompt();
      connectAvatar();
    } catch (error) {
      console.error("Session start error:", error);
      alert("Failed to start session.");
      setIsLoadingAvatar(false);
    }
  }, [selectedScenario, fetchPrompt, connectAvatar]);

  const saveChatHistory = useCallback(async (history) => {
    try {
      setShowAnalysisOverlay(true);
      const response = await fetch(`${URL}/save_chat_history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatHistory: history }),
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
  }, []);

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
  };

  const stopSession = useCallback(async () => {
    try {
      stopSpeaking();
      if (isMicrophoneActive) {
        await stopMicrophoneAsync();
      }
      await saveChatHistory(chatHistory);
      disconnectAvatar();
      setIsSessionActive(false);
      setIsLoadingAvatar(false);
      setIsMicrophoneActive(false);
      setMessages([]);
      setMessageInitiated(false);
      setChatHistory("");
      window.location.href = "/report"; // i have to change this code into navigtion method: navigate('/report');
    } catch (error) {
      console.error("Session end error:", error);
      disconnectAvatar();
      setIsSessionActive(false);
      alert("Session ended with errors. Please refresh.");
    }
  }, [
    chatHistory,
    isMicrophoneActive,
    saveChatHistory,
    stopMicrophoneAsync,
    stopSpeaking,
  ]);

  const clearChatHistory = useCallback(() => {
    setMessages((prev) => {
      const systemMsg = prev.find((m) => m.role === "system");
      return systemMsg ? [systemMsg] : [];
    });
    setChatHistory("");
  }, []);

  // 9. Notifications
  const fetchNotifications = useCallback(() => {
    fetch(`${URL}/notifications`)
      .then((response) => response.json())
      .then((data) => {
        const notifs = data || [];
        setNotifications(notifs);
        const unread = notifs.filter((n) => !n.read).length;
        setUnreadCount(unread);
      })
      .catch((error) => console.error("Error fetching notifications:", error));
  }, []);

  const acceptScenario = useCallback(
    async (scenarioId) => {
      try {
        const response = await fetch(`${URL}/accept-scenario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario_id: scenarioId }),
        });
        const data = await response.json();
        if (data.success) {
          setNotifications((prev) =>
            prev.map((n) => {
              if (n.id === scenarioId) {
                return { ...n, accepted: true, read: true };
              }
              return n;
            })
          );
          setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
          fetchNotifications();
          updateScenarioDropdown();
          showToast("Scenario accepted successfully!", "success");
        } else {
          console.error("Error accepting scenario:", data.error);
          showToast(
            `Failed to accept scenario: ${data.message || "Unknown error"}`,
            "error"
          );
        }
      } catch (error) {
        console.error("Error in scenario acceptance:", error);
        showToast("Error accepting scenario. Please try again.", "error");
      }
    },
    [fetchNotifications, showToast]
  );

  const markAllRead = useCallback(async () => {
    try {
      const response = await fetch(`${URL}/notifications/mark-all-read`, {
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
  }, [showToast]);

  const updateScenarioDropdown = useCallback(() => {
    fetch(`${URL}/accepted-scenarios`)
      .then((response) => response.json())
      .then((data) => {
        const scens = data || [];
        setScenarios(scens);
        if (
          scens.length > 0 &&
          !scens.find((s) => s._id === selectedScenario)
        ) {
          setSelectedScenario(scens[0]._id);
        }
      })
      .catch((error) => console.error("Error updating scenarios:", error));
  }, [selectedScenario]);

  // 10. useEffect , those thing you want automaticlly happen
  useEffect(() => {
    fetch(`${URL}/accepted-scenarios`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const scens = data || [];
        setScenarios(scens);
        if (scens.length > 0) {
          setSelectedScenario(scens[0]._id);
        }
      })
      .catch((err) => console.error("Error loading scenarios:", err));

    fetchNotifications();
    const notificationInterval = setInterval(fetchNotifications, 30000);

    return () => {
      disconnectAvatar();
      clearInterval(notificationInterval);
    };
  }, [fetchNotifications]);

  const handleAdminNavigation = () => {
    navigate("/admin");
  };

  const handleSuperAdminNavigation = () => {
    navigate("/superadmin");
  };

  // Ui start from here:
  return (
    <div className="bot-page-container">
      {/* Header */}
      <div className="bot-header-container">
        <h1 className="bot-header-title">Talking Avatar</h1>
        <div className="bot-header-right">
          <nav>
            <ul className="bot-nav-links">
              <li onClick={handleSuperAdminNavigation}>Super Admin</li>
              <li onClick={handleAdminNavigation}>Admin</li>
            </ul>
          </nav>
          <div
            className="bot-notification-bell-container"
            onClick={() =>
              setIsNotificationDropdownVisible(!isNotificationDropdownVisible)
            }
          >
            <svg
              className="bot-notification-bell"
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
              <span className="bot-notification-badge">{unreadCount}</span>
            )}
          </div>

          {/* Notifications Dropdown */}
          {isNotificationDropdownVisible && (
            <div
              className="bot-notification-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bot-notification-header">
                <span>Notifications</span>
              </div>
              <div className="bot-notification-list">
                {notifications.length === 0 ? (
                  <div className="bot-no-notifications">
                    No notifications available.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`bot-notification-item 
                        ${notification.read ? "bot-read" : "bot-unread"} 
                        ${notification.accepted ? "bot-accepted" : ""}`}
                    >
                      <div className="bot-notification-header">
                        <div className="bot-notification-title">
                          {notification.title}
                          {notification.accepted && (
                            <span className="bot-accepted-badge">
                              ✓ Accepted
                            </span>
                          )}
                        </div>
                        <span
                          className={`bot-source-badge ${
                            notification.source === "superadmin"
                              ? "bot-bg-purple"
                              : "bot-bg-blue"
                          }`}
                        >
                          {notification.source === "superadmin"
                            ? "SuperAdmin"
                            : "Admin"}
                        </span>
                      </div>
                      <div className="bot-notification-message">
                        {notification.message}
                      </div>
                      <div className="bot-notification-time">
                        {notification.time}
                      </div>
                      {!notification.accepted && (
                        <div className="bot-notification-actions">
                          <button
                            className="bot-btn-accept"
                            onClick={() =>
                              acceptScenario(notification.scenario_id)
                            }
                          >
                            Accept Scenario
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="bot-notification-footer" onClick={markAllRead}>
                  Mark all as read
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Configuration */}
      {!isSessionActive && (
        <div id="configuration" className="bot-configuration">
          <div className="bot-control-panel">
            <div className="bot-select-container">
              <label htmlFor="languageSelect">Select Language</label>
              <select
                id="languageSelect"
                className="bot-select-input"
                value={language}
                onChange={(e) => {
                  if (isSessionActive) {
                    if (
                      window.confirm(
                        "Changing language requires reconnecting. Continue?"
                      )
                    ) {
                      stopSession().then(() => setLanguage(e.target.value));
                    }
                  } else {
                    setLanguage(e.target.value);
                  }
                }}
              >
                <option value="en-IN">English</option>
                <option value="hi-IN">Hindi</option>
                <option value="te-IN">Telugu</option>
                <option value="ta-IN">Tamil</option>
                <option value="kn-IN">Kannada</option>
              </select>
            </div>

            <div className="bot-select-container">
              <label htmlFor="scenarioSelect">Select Scenario</label>
              <select
                id="scenarioSelect"
                className="bot-select-input"
                value={selectedScenario}
                onChange={(e) => {
                  if (isSessionActive) {
                    if (
                      window.confirm(
                        "Changing scenario will restart the conversation. Continue?"
                      )
                    ) {
                      clearChatHistory();
                      setSelectedScenario(e.target.value);
                    }
                  } else {
                    setSelectedScenario(e.target.value);
                  }
                }}
              >
                {scenarios.length === 0 ? (
                  <option disabled>No scenarios available</option>
                ) : (
                  scenarios.map((sc) => (
                    <option key={sc._id} value={sc._id}>
                      {sc.scenario}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Buttons */}
      <div className="bot-button-container">
        <button
          id="startSession"
          onClick={startSession}
          disabled={isSessionActive}
          className="bot-button bot-button-start"
        >
          Start Chat
        </button>

        <button
          id="microphone"
          onClick={microphone}
          disabled={!isSessionActive}
          className="bot-button bot-button-microphone"
        >
          {isMicrophoneActive ? "Stop Microphone" : "Start Microphone"}
        </button>

        <button
          id="stopSpeaking"
          onClick={stopSpeaking}
          disabled={!isSessionActive || !isSpeaking}
          className="bot-button bot-button-stop-speaking"
        >
          Stop Speaking
        </button>

        <button
          id="clearChatHistory"
          onClick={clearChatHistory}
          className="bot-button bot-button-clear-chat"
        >
          Clear Chat
        </button>

        <button
          id="stopSession"
          onClick={stopSession}
          disabled={!isSessionActive}
          className="bot-button bot-button-end-chat"
        >
          End Chat
        </button>
      </div>

      {/* Only show the Avatar/Video section if session is active */}
      {isSessionActive && (
        <div className="bot-video-and-chat">
          {/* Video Container */}
          <div className="bot-video-container" id="videoContainer">
            <div id="bot-remote-video-container" className="bot-remote-video" />

            {isLoadingAvatar && (
              <div className="bot-loader-container" id="loaderContainer">
                <div className="bot-loader"></div>
                <div className="bot-loader-text">Loading Avatar...</div>
              </div>
            )}
          </div>

          {/* Chat Output */}
          <div className="bot-chat-history-container">
            <div
              id="chatHistory"
              className="bot-chat-history"
              dangerouslySetInnerHTML={{ __html: chatHistory }}
            />
          </div>
        </div>
      )}

      {/* Analysis Overlay */}
      {showAnalysisOverlay && (
        <div className="bot-analysis-loading-overlay">
          <div className="bot-analysis-loading-content">
            <h3>Analyzing Conversation...</h3>
            <div className="bot-loading-progress">
              <div className="bot-loading-progress-bar"></div>
            </div>
            <p>Please wait while we generate your report...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotPage;
