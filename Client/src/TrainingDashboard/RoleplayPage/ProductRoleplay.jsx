import React, { useState, useEffect, useRef } from "react";
import { IoReturnUpBackOutline } from "react-icons/io5";
import "./ProductRolePlay.css"; // We'll create this CSS file
import ProfileImage from "../../images/product1_avatar.svg"

const ProductRolePlay = ({ onBack }) => {
  const [inCall, setInCall] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [context, setContext] = useState("");
  const [chatHistory, setChatHistory] = useState("");
  const [completedScenarios, setCompletedScenarios] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState("");
  const [currentBehavior, setCurrentBehavior] = useState("");
  const [behaviorType, setBehaviorType] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [loadingCustomer, setLoadingCustomer] = useState("");

  // Speech Recognition setup
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messageEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInputMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setMicOn(false);
      };
      
      recognitionRef.current.onend = () => {
        setMicOn(false);
      };
    }

    // Load customers on initial render
    fetchCustomers();

    // Load completed scenarios from localStorage if available
    const savedCompletedScenarios = localStorage.getItem('banking_completedScenarios');
    if (savedCompletedScenarios) {
      setCompletedScenarios(JSON.parse(savedCompletedScenarios));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Save completed scenarios to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('banking_completedScenarios', JSON.stringify(completedScenarios));
  }, [completedScenarios]);

  // Keyboard shortcut for microphone toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+M to toggle microphone
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleMic();
      } else if (e.key === 'Enter' && !e.shiftKey && inCall) {
        e.preventDefault();
        handleSendMessage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [micOn, inCall, inputMessage]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/get_customers");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCustomerList(data.customers || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const speakText = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        // Try to pick a voice based on behavior type
        utterance.voice = voices.find(voice =>
          behaviorType.includes("Polite") ? voice.name.includes("Female") : voice.name.includes("Male")
        ) || voices[0];
        
        // Adjust pitch and rate based on behavior
        if (behaviorType.includes("Rude")) {
          utterance.pitch = 0.8;
          utterance.rate = 1.2;
        } else {
          utterance.pitch = 1.2;
          utterance.rate = 1.0;
        }
      }
      synthRef.current.speak(utterance);
    } else {
      console.warn("Text to Speech not supported in this browser");
    }
  };

  const handleStartCall = async (customerTitle) => {
    setLoadingCustomer(customerTitle);
    // Play ring sound
    const ringSound = new Audio('/phone-pickup.mp3');
    await ringSound.load();
    ringSound.play();

    setMessages([{ sender: "System", text: "Calling..." }]);

    try {
      const response = await fetch("http://localhost:5000/api/start_customer_call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerTitle: customerTitle,
          completedScenarios: completedScenarios
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Wait for ringing sound
      setTimeout(() => {
        ringSound.pause();
        ringSound.currentTime = 0;

        const initialMessage = { sender: "Customer", text: data.customerGreeting };
        setContext(data.context);
        setCurrentBehavior(data.behavior);
        setBehaviorType(data.behaviorType);
        setCurrentCustomer(data.selectedCustomer);

        // Extract customer type from context
        const contextLines = data.context.split('\n');
        const customerTypeLine = contextLines.find(line => line.startsWith('CustomerType:'));
        const customerType = customerTypeLine ? customerTypeLine.replace('CustomerType:', '').trim() : '';
        setCustomerType(customerType);

        setMessages([initialMessage]);
        setChatHistory(`Customer: ${data.customerGreeting}\n`);
        setInCall(true);

        if (synthRef.current) {
          setTimeout(() => {
            speakText(data.customerGreeting);
          }, 500);
        }

        setLoadingCustomer("");
      }, 2000);
    } catch (error) {
      console.error("Error starting call:", error);
      alert("Error starting call. Please try again.");
      ringSound.pause();
      setLoadingCustomer("");
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const agentMsg = { sender: "Agent", text: inputMessage };
    setMessages(prev => [...prev, agentMsg]);
    setChatHistory(prev => prev + `Agent: ${inputMessage}\n`);
    
    const currentInputMessage = inputMessage;
    setInputMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/send_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInputMessage,
          context: context,
          chatHistory: chatHistory,
          behavior: currentBehavior
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const customerMsg = { sender: "Customer", text: data.response };
      setMessages(prev => [...prev, customerMsg]);
      setChatHistory(prev => prev + `Customer: ${data.response}\n`);

      speakText(data.response);

      // Check if the customer is ending the conversation
      const lowerCaseResponse = data.response.toLowerCase();
      if ((lowerCaseResponse.includes("thank") && lowerCaseResponse.includes("bye")) ||
          (lowerCaseResponse.includes("goodbye") && lowerCaseResponse.includes("thank")) ||
          (lowerCaseResponse.includes("hang") && lowerCaseResponse.includes("up")) ||
          (lowerCaseResponse.match(/(?:thank|thanks).*(?:bye|goodbye)/) !== null)) {

        // Customer is ending the call
        setTimeout(() => {
          const hangupSound = new Audio('/phone-hangup.mp3');
          hangupSound.play();

          setMessages(prev => [...prev, { sender: "System", text: "Customer has ended the call." }]);

          // Mark this scenario as completed
          if (!completedScenarios.includes(currentCustomer)) {
            setCompletedScenarios(prev => [...prev, currentCustomer]);
          }

          setTimeout(() => {
            alert("Customer has ended the call. The conversation is complete!");
            handleEndCall();
          }, 2000);
        }, 1500);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message. Please try again.");
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (micOn) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setMicOn(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  const handleEndCall = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    if (recognitionRef.current && micOn) {
      recognitionRef.current.stop();
      setMicOn(false);
    }

    // Mark this scenario as completed if it's not already
    if (currentCustomer && !completedScenarios.includes(currentCustomer)) {
      setCompletedScenarios(prev => [...prev, currentCustomer]);
    }

    setInCall(false);
    setMessages([]);
    setInputMessage("");
    setContext("");
    setChatHistory("");
    setCurrentBehavior("");
    setBehaviorType("");
    setCustomerType("");
    setCurrentCustomer("");
  };

  const handleReset = () => {
    if (window.confirm('Reset all completed banking scenarios?')) {
      setCompletedScenarios([]);
      localStorage.removeItem('banking_completedScenarios');
    }
  };

  // Render the customer selection screen
  if (!inCall) {
    return (
      <div className="banking-customer-screen">
        <div className="banking-header">
          <button className="banking-back-button" onClick={onBack}>
            <IoReturnUpBackOutline size={24} />
            Back
          </button>
          <h1>Banking Customer Service Training</h1>
          <p>Select a customer scenario to practice your banking customer service skills</p>

          {completedScenarios.length > 0 && (
            <button onClick={handleReset} className="banking-reset-button">
              Reset All Progress
            </button>
          )}
        </div>

        <div className="banking-customer-cards">
          {customerList.length === 0 ? (
            <div className="banking-loading">Loading customer scenarios...</div>
          ) : (
            customerList.map((customer, index) => (
              <div
                key={index}
                className={`banking-customer-card ${completedScenarios.includes(customer.title) ? 'completed' : ''}`}
                onClick={() => loadingCustomer === "" && handleStartCall(customer.title)}
              >
                <div className="banking-card-content">
                  <h3>{customer.title}</h3>
                  <p>{customer.shortDescription}</p>

                  {completedScenarios.includes(customer.title) && (
                    <div className="banking-completed-badge">
                      <span>✓</span> Completed
                    </div>
                  )}
                </div>

                <button
                  className="banking-start-call-button"
                  disabled={loadingCustomer === customer.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    loadingCustomer === "" && handleStartCall(customer.title);
                  }}
                >
                  {loadingCustomer === customer.title ? 'Connecting...' : 'Start Call'}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="banking-progress-section">
          <h2>Your Progress</h2>
          <div className="banking-progress-bar">
            <div
              className="banking-progress-fill"
              style={{ width: `${customerList.length > 0 ? (completedScenarios.length / customerList.length) * 100 : 0}%` }}
            ></div>
          </div>
          <p>{completedScenarios.length} of {customerList.length} scenarios completed</p>
        </div>
      </div>
    );
  }

  // Render the call screen
  return (
    <div className="banking-call-container">
      {/* Left Side - Image & Customer Type */}
      <div className="banking-left-panel">
        <img
          src={ProfileImage}
          alt="Customer"
          className="banking-user-image"
        />
        <div className="banking-customer-type">
          <strong>Customer Type:</strong>
          <div className={`banking-behavior-type ${behaviorType.includes("Polite") ? "polite" : "rude"}`}>
            {behaviorType}
          </div>
          <div className="banking-customer-info">
            <div>
              <strong>Customer:</strong> {currentCustomer}
            </div>
            {customerType && (
              <div>
                <strong>Profile:</strong> {customerType.split('.')[0]}.
              </div>
            )}
          </div>
          <div className="banking-shortcut-info">
            Press Ctrl+M to toggle mic
          </div>
        </div>
        <button onClick={onBack} className="banking-exit-button">
          Exit Call
        </button>
      </div>

      {/* Right Side - Chat */}
      <div className="banking-conversation">
        <div className="banking-chat-screen">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`banking-chat-message ${msg.sender.toLowerCase()}`}
            >
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        <div className="banking-chat-controls">
          <input
            type="text"
            placeholder={micOn ? "Listening..." : "Type your message..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="banking-chat-input"
          />
          <button onClick={handleSendMessage} className="banking-send-button">
            Send
          </button>
          <button 
            onClick={toggleMic} 
            className={`banking-mic-button ${micOn ? "mic-on" : "mic-off"}`}
          >
            {micOn ? "Mic On" : "Mic Off"}
          </button>
        </div>

        <button onClick={handleEndCall} className="banking-end-call">
          End Call
        </button>
      </div>
    </div>
  );
};

export default ProductRolePlay;