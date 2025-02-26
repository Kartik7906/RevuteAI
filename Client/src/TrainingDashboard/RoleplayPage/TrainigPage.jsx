import React, { useState, useEffect, useRef } from "react";
import { IoReturnUpBackOutline, IoCall } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";
import product1_avatar from "../../images/product1_avatar.svg";
import product2_avatar from "../../images/product2_avatar.svg";
import product3_avatar from "../../images/product3_avatar.svg";
import product4_avatar from "../../images/product4_avatar.svg";
import product5_avatar from "../../images/product5_avatar.svg";
import FeaturedCard from "../../images/FeaturedCard.jpg";
import businessImg from "../../images/defaultavatar.svg";
import "./TrainingPage.css";

const TrainingPage = () => {
  const [currentView, setCurrentView] = useState("info");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [avatar, setAvatar] = useState("");
  const [conversation, setConversation] = useState([]);
  const [generalReadGuidelines, setGeneralReadGuidelines] = useState(false);
  const [generalReadyToProceed, setGeneralReadyToProceed] = useState(false);
  const [productReadGuidelines, setProductReadGuidelines] = useState(false);
  const [productReadyToProceed, setProductReadyToProceed] = useState(false);

  const [inCall, setInCall] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [context, setContext] = useState("");
  const [chatHistory, setChatHistory] = useState("");
  const [behaviorType, setBehaviorType] = useState("Polite");

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const productList = ["Product 1", "Product 2", "Product 3", "Product 4", "Product 5"];
  const scenarioOptions = ["Prospect Lead", "Non-Prospect Lead", "Angry Customer", "Happy Customer", "Sad Customer"];
  const avatarMapping = {
    "Product 1": { "Prospect Lead": product1_avatar, "Non-Prospect Lead": product1_avatar, "Angry Customer": product1_avatar, "Happy Customer": product1_avatar, "Sad Customer": product1_avatar },
    "Product 2": { "Prospect Lead": product2_avatar, "Non-Prospect Lead": product2_avatar, "Angry Customer": product2_avatar, "Happy Customer": product2_avatar, "Sad Customer": product2_avatar },
    "Product 3": { "Prospect Lead": product3_avatar, "Non-Prospect Lead": product3_avatar, "Angry Customer": product3_avatar, "Happy Customer": product3_avatar, "Sad Customer": product3_avatar },
    "Product 4": { "Prospect Lead": product4_avatar, "Non-Prospect Lead": product4_avatar, "Angry Customer": product4_avatar, "Happy Customer": product4_avatar, "Sad Customer": product4_avatar },
    "Product 5": { "Prospect Lead": product5_avatar, "Non-Prospect Lead": product5_avatar, "Angry Customer": product5_avatar, "Happy Customer": product5_avatar, "Sad Customer": product5_avatar }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessages((prev) => [...prev, { sender: "Agent", text: transcript }]);
        handleSendMessage(transcript);
      };
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };
      recognitionRef.current.onend = () => {
        setMicOn(false);
      };
    }
  }, []);

  const startCall = async (scenario) => {
    try {
      const response = await fetch("http://localhost:5000/api/start_call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });
      if (!response.ok) {
        throw new Error("Failed to start call");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error starting call:", error);
      return null;
    }
  };

  const sendMessageAPI = async (message, context, chatHistory) => {
    try {
      const response = await fetch("http://localhost:5000/api/send_message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context, chatHistory }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      return null;
    }
  };

  const speakText = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices.find((voice) =>
          behaviorType.includes("Polite") ? voice.name.includes("Female") : voice.name.includes("Male")
        ) || voices[0];
      }
      synthRef.current.speak(utterance);
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
      recognitionRef.current.start();
      setInputMessage("");
    }
    setMicOn((prev) => !prev);
  };

  const handleSendMessage = async (userText) => {
    const messageToSend = userText || inputMessage;
    if (messageToSend.trim() === "") return;
    setMessages((prev) => [...prev, { sender: "Agent", text: messageToSend }]);
    const updatedChatHistory = chatHistory + `Agent: ${messageToSend}\n`;
    setChatHistory(updatedChatHistory);

    try {
      const responseData = await sendMessageAPI(messageToSend, context, updatedChatHistory);
      if (responseData) {
        const botReply = responseData.response;
        setMessages((prev) => [...prev, { sender: "Customer", text: botReply }]);
        const newChatHistory = updatedChatHistory + `Customer: ${botReply}\n`;
        setChatHistory(newChatHistory);
        speakText(botReply);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
    }
    setInputMessage("");
  };

  const handleEndCall = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current && micOn) {
      recognitionRef.current.stop();
      setMicOn(false);
    }
    alert("Call has been ended.");
    setInCall(false);
    setMessages([]);
    setInputMessage("");
    setContext("");
    setChatHistory("");
  };

  const handleMakeCall = async () => {
    const scenario = selectedScenario || "Prompt 1: Silent"; 
    const startCallData = await startCall(scenario);
    if (startCallData) {
      setContext(startCallData.context);
      setMessages([{ sender: "Customer", text: startCallData.customerGreeting }]);
      setChatHistory(`Customer: ${startCallData.customerGreeting}\n`);
      setInCall(true);
      speakText(startCallData.customerGreeting);
    } else {
      alert("Failed to start call: No matching prompt found. Please check your CSV data.");
    }
  };

  const resetTraining = () => {
    setSelectedProduct("");
    setSelectedScenario("");
    setCallStatus("");
    setAvatar("");
    setConversation([]);
    setGeneralReadGuidelines(false);
    setGeneralReadyToProceed(false);
    setProductReadGuidelines(false);
    setProductReadyToProceed(false);
    setInCall(false);
    setMessages([]);
    setInputMessage("");
    setContext("");
    setChatHistory("");
    setBehaviorType("Polite");
    setCurrentView("info");
  };


  const InfoView = () => (
    <div className="trainingPageinfo-container">
      <div className="TrainingPage-mainContainer-Introsection">
        <div className="TrainingPage-mainContainer-IntroSection-CenterDiv">
          <h1 className="intro-title">Welcome to Advanced Telecommunication Training</h1>
          <p className="intro-subtitle">
            Enhance your telecalling skills with our interactive role-playing modules. Practice real-life scenarios and improve your communication abilities.
          </p>
          <div className="intro-buttons">
            <button className="btn-general-telecalling" onClick={() => setCurrentView("general")}>
              Telecalling RolePlay
            </button>
            <button className="btn-product-telecalling" onClick={() => setCurrentView("product")}>
              Explore Product-Based Telecalling Module
            </button>
          </div>
        </div>
      </div>
      <div className="TrainingPage-containerFor-Features">
        <div className="TrainingPage-FeaturesSection">
          <div className="TrainingPage-leftFeatureSection">
            <div className="TrainingPage-featuredCard">
              <h2>Interactive Training Modules</h2>
              <p>
                Practice telecalling with realistic roleplay scenarios, including different customer types like happy, angry, and sad customers.
              </p>
            </div>
            <div className="TrainingPage-featuredCard">
              <h2>Easy Module Selection</h2>
              <p>
                Simply click on a module to start training, with clear guidelines provided before beginning.
              </p>
            </div>
            <div className="TrainingPage-featuredCard">
              <h2>Call Simulation Experience</h2>
              <p>
                The system mimics a real phone call with ringing sounds and a customer avatar appearing on the screen.
              </p>
            </div>
            <div className="TrainingPage-featuredCard">
              <h2>Voice-Based Interaction</h2>
              <p>
                Speak directly, and the system converts your speech into text, processes it, and provides a voice response.
              </p>
            </div>
            <div className="TrainingPage-featuredCard">
              <h2>Realistic Customer Responses</h2>
              <p>
                The customer’s voice tone changes dynamically based on their emotions, creating a more immersive experience.
              </p>
            </div>
            <div className="TrainingPage-featuredCard">
              <h2>Engaging Visuals & Animations</h2>
              <p>
                Avatars and smooth animations make the training feel more real and interactive.
              </p>
            </div>
            <div className="TrainingPage-featuredCard">
              <h2>Step-by-Step Guidance</h2>
              <p>
                Receive scenario descriptions and guidelines before starting to ensure you know what to do.
              </p>
            </div>
          </div>
          <div className="TrainingPage-rightFeatureImageSection">
            <img src={FeaturedCard} alt="Training Feature Preview" />
          </div>
        </div>
      </div>
      <div className="Encourage-wrapper">
        <div className="Encourage-tiltLayer">
          <div className="Encourage-contentContainer">
            <div className="Encourage-topRow">
              <h2>Ready to enhance your telecommunication skills?</h2>
              <p>
                Join our interactive training module now to improve your telecalling abilities.
              </p>
            </div>
            <button onClick={() => setCurrentView("general")}>Start Training</button>
          </div>
        </div>
      </div>
    </div>
  );

  const GeneralModule = () => (
    <div className="telecommunication-module general">
      <button className="telecommunication-module__back" onClick={resetTraining}>Back</button>
      <h2 className="telecommunication-module__title">General Telecalling Module</h2>
      <div className="telecommunication-module__description">
        <p className="telecommunication-module__description-text">
          Enhance your communication skills with a simulated customer call experience. This module offers diverse interactions without focusing on any specific product, ensuring well-rounded practice.
        </p>
      </div>
      <div className="telecommunication-module__content">
        <div className="telecommunication-module__left">
          <div className="telecommunication-module__acknowledgements">
            <label>
              <input type="checkbox" checked={generalReadGuidelines} onChange={() => setGeneralReadGuidelines(!generalReadGuidelines)} /> I have read the guidelines.
            </label>
            <label>
              <input type="checkbox" checked={generalReadyToProceed} onChange={() => setGeneralReadyToProceed(!generalReadyToProceed)} /> I am ready to proceed.
            </label>
          </div>
          <button id="start-practice" onClick={() => {
              setCallStatus("inProgress");
              setConversation([]);
              setCurrentView("Telecalling-call"); // Switch to integrated telecalling view
            }} disabled={!(generalReadGuidelines && generalReadyToProceed)}>
            Start Practice
          </button>
        </div>
        <div className="telecommunication-module__guidelines">
          <h3>Guidelines</h3>
          <ul>
            <li>Listen attentively to understand the customer's needs.</li>
            <li>Maintain a professional and respectful tone.</li>
            <li>Communicate clearly and concisely.</li>
            <li>Stay calm and composed, even in challenging situations.</li>
            <li>Use this session to enhance your communication skills.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const ProductModule = () => (
    <div className="telecommunication-module product">
      <button className="telecommunication-module__back" onClick={resetTraining}>Back</button>
      <h2 className="telecommunication-module__title">Specialized Role-Play Module</h2>
      <div className="telecommunication-module__description">
        <p>
          Select a product and a matching customer persona for targeted role-play scenarios. Gain focused, product-specific communication practice.
        </p>
      </div>
      <div className="telecommunication-module__product-list">
        <h3>Product List</h3>
        <p>Select which product you want:</p>
        <div className="telecommunication-module__products">
          {productList.map((product, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedProduct(product);
                setSelectedScenario("");
              }}
              className={`telecommunication-module__product ${selectedProduct === product ? "active" : ""}`}
            >
              {product}
            </button>
          ))}
        </div>
        {selectedProduct && (
          <div className="telecommunication-module__scenario">
            <h3>Select a Scenario for {selectedProduct}</h3>
            <select value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}>
              <option value="">-- Select a Scenario --</option>
              {scenarioOptions.map((scenario, idx) => (
                <option key={idx} value={scenario}>
                  {scenario}
                </option>
              ))}
            </select>
          </div>
        )}
        {selectedProduct && selectedScenario && (
          <button id="start-practice-product" onClick={() => {
              const avatarSrc = avatarMapping[selectedProduct]?.[selectedScenario] || "";
              setCallStatus("inProgress");
              setAvatar(avatarSrc);
              setConversation([]);
              setCurrentView("call");
            }} disabled={!(productReadGuidelines && productReadyToProceed)}>
            Start Practice
          </button>
        )}
      </div>
      <div className="telecommunication-module__guidelines">
        <h3>Guidelines</h3>
        <ul>
          <li>Listen carefully to the customer's concerns.</li>
          <li>Adapt your tone based on the customer's emotions.</li>
          <li>Be ready with product-specific information.</li>
          <li>Stay calm and professional.</li>
          <li>Use these simulations to sharpen your product knowledge.</li>
        </ul>
      </div>
      <div className="telecommunication-module__acknowledgements">
        <label>
          <input type="checkbox" checked={productReadGuidelines} onChange={() => setProductReadGuidelines(!productReadGuidelines)} /> I have read the guidelines.
        </label>
        <label>
          <input type="checkbox" checked={productReadyToProceed} onChange={() => setProductReadyToProceed(!productReadyToProceed)} /> I am ready to proceed.
        </label>
      </div>
    </div>
  );

  const CallView = () => (
    <div className="call-view">
      <header className="call-view__header">
        <IoReturnUpBackOutline onClick={resetTraining} size={30} className="call-view__back-button" />
      </header>
      {callStatus === "inProgress" && (
        <main className="call-view__main">
          <div className="call-view__left-section">
            <div className="call-view__avatar-container">
              {avatar && <img src={avatar} alt="Avatar" className="call-view__avatar" />}
            </div>
            <div className="call-view__extra-controls">
              <button className="call-view__call-button" onClick={toggleMic}>
                <IoCall size={30} />
              </button>
            </div>
          </div>
          <div className="call-view__right-section">
            <div className="call-view__chat-container">
              <div className="call-view__transcript">
                {conversation.map((msg, idx) => (
                  <div key={idx} className={msg.type === "user" ? "call-view__user-message" : "call-view__bot-message"}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="call-view__input-bar">
                <input type="text" className="call-view__text-input" placeholder="Type your message..." />
                <button className={`call-view__mic-button ${micOn ? "is-listening" : ""}`} onClick={toggleMic}>
                  <FaMicrophone size={20} />
                  <div className="call-view__mic-animation" />
                </button>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );

  const IntegratedTelecallingView = () => {
    if (!inCall) {
      return (
        <div className="telecalling-afterCallView">
          <div className="telecalling-view__not-in-call">
            <IoReturnUpBackOutline onClick={resetTraining} size={30} className="call-view__back-button" />
            <div className="telecalling-view__not-in-call-box">
              <h2 className="telecalling-view__not-in-call-title">Welcome to Call Center Training!</h2>
              <p className="telecalling-view__welcome-text">
                You are just one step away from making a call. Click "Make Call" below to start your training session.
              </p>
              <button className="telecalling-view__make-call-button" onClick={handleMakeCall}>
                Make Call
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container-telecalling">
        <div className="leftPanel-telecalling">
          <img src={businessImg} alt="User" className="userImage" />
          <div className="customerType">
            <strong>Customer Type:</strong>
            <div className={behaviorType.includes("Polite") ? "telecalling-view__behavior-text polite" : "telecalling-view__behavior-text rude"}>
              {behaviorType}
            </div>
            <div className="telecalling-view__instruction-text">Press Ctrl+M to toggle mic</div>
          </div>
        </div>
        <div className="conversation">
          <div className="chatScreen">
            {messages.map((msg, index) => (
              <div key={index} className="telecalling-view__chat-message">
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="telecalling-view__chat-controls">
            <input
              type="text"
              placeholder={micOn ? "Listening..." : "Type your message..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="telecalling-view__chat-input"
            />
            <button onClick={() => handleSendMessage()} className="sendButton">Send</button>
            <button className={`micButton ${micOn ? "micOn" : "micOff"}`} onClick={toggleMic}>
              {micOn ? "Mic On" : "Mic Off"}
            </button>
          </div>
          <button onClick={handleEndCall} className="endCall">End Call</button>
        </div>
      </div>
    );
  };

  return (
    <div className="TrainingPage-mainContainer">
      {currentView === "info" && <InfoView />}
      {currentView === "general" && <GeneralModule />}
      {currentView === "product" && <ProductModule />}
      {currentView === "call" && <CallView />}
      {currentView === "Telecalling-call" && <IntegratedTelecallingView />}
    </div>
  );
};

export default TrainingPage;
