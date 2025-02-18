import React, { useState, useEffect, useRef } from "react";
import { IoReturnUpBackOutline, IoCall } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";
import product1_avatar from "../../images/avatar.svg";
import product2_avatar from "../../images/avatar.svg";
import product3_avatar from "../../images/avatar.svg";
import product4_avatar from "../../images/avatar.svg";
import product5_avatar from "../../images/avatar.svg";
import defaultavatar from "../../images/avatar2.svg";
import "./TrainingPage.css";

const TrainingPage = () => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");
  const [renderCall, setRenderCall] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [avatar, setAvatar] = useState("");
  const [conversation, setConversation] = useState([]);
  const [showSelectionArea, setShowSelectionArea] = useState(true);
  const [generalReadGuidelines, setGeneralReadGuidelines] = useState(false);
  const [generalReadyToProceed, setGeneralReadyToProceed] = useState(false);
  const [productReadGuidelines, setProductReadGuidelines] = useState(false);
  const [productReadyToProceed, setProductReadyToProceed] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const productList = [
    "Product 1",
    "Product 2",
    "Product 3",
    "Product 4",
    "Product 5",
  ];

  const scenarioOptions = [
    "Prospect Lead",
    "Non-Prospect Lead",
    "Angry Customer",
    "Happy Customer",
    "Sad Customer",
  ];

  const avatarMapping = {
    "Product 1": {
      "Prospect Lead": product1_avatar,
      "Non-Prospect Lead": product1_avatar,
      "Angry Customer": product1_avatar,
      "Happy Customer": product1_avatar,
      "Sad Customer": product1_avatar,
    },
    "Product 2": {
      "Prospect Lead": product2_avatar,
      "Non-Prospect Lead": product2_avatar,
      "Angry Customer": product2_avatar,
      "Happy Customer": product2_avatar,
      "Sad Customer": product2_avatar,
    },
    "Product 3": {
      "Prospect Lead": product3_avatar,
      "Non-Prospect Lead": product3_avatar,
      "Angry Customer": product3_avatar,
      "Happy Customer": product3_avatar,
      "Sad Customer": product3_avatar,
    },
    "Product 4": {
      "Prospect Lead": product4_avatar,
      "Non-Prospect Lead": product4_avatar,
      "Angry Customer": product4_avatar,
      "Happy Customer": product4_avatar,
      "Sad Customer": product4_avatar,
    },
    "Product 5": {
      "Prospect Lead": product5_avatar,
      "Non-Prospect Lead": product5_avatar,
      "Angry Customer": product5_avatar,
      "Happy Customer": product5_avatar,
      "Sad Customer": product5_avatar,
    },
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setConversation((prev) => [...prev, { type: "user", text: transcript }]);
        handleBotReply(transcript);
      };
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };
      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  const getBotReply = async (userText) => {
    try {
      const response = await fetch("http://localhost:8000/api/trainingPage/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error("Error fetching bot reply", error);
      return "I'm sorry, I couldn't process that.";
    }
  };

  const handleBotReply = async (userText) => {
    const botText = await getBotReply(userText);
    setConversation((prev) => [...prev, { type: "bot", text: botText }]);
    speakText(botText);
  };

  const speakText = (text) => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedScenario("");
  };

  const handleScenarioChange = (e) => {
    setSelectedScenario(e.target.value);
  };

  const handleStartPracticeGeneral = () => {
    setRenderCall(true);
    setCallStatus("inProgress");
    setShowSelectionArea(false);
    setAvatar(defaultavatar);
    setConversation([]);
  };

  const handleStartPracticeProduct = () => {
    setRenderCall(true);
    setCallStatus("inProgress");
    setShowSelectionArea(false);
    const avatarSrc =
      avatarMapping[selectedProduct] &&
      avatarMapping[selectedProduct][selectedScenario]
        ? avatarMapping[selectedProduct][selectedScenario]
        : "";
    setAvatar(avatarSrc);
    setConversation([]);
  };

  const handleBackButton = () => {
    setRenderCall(false);
    setShowSelectionArea(true);
    setCallStatus("");
    setSelectedProduct("");
    setSelectedScenario("");
    setGeneralReadGuidelines(false);
    setGeneralReadyToProceed(false);
    setProductReadGuidelines(false);
    setProductReadyToProceed(false);
    setConversation([]);
    setListening(false);
  };

  const handleToggleListening = () => {
    if (recognitionRef.current) {
      if (!listening) {
        recognitionRef.current.start();
        setListening(true);
      } else {
        recognitionRef.current.stop();
        setListening(false);
      }
    }
  };

  return (
    <div className="TrainingPage-mainContainer">
      <div className="TrainingPage-mainContainer-Introsection">
        <h1 className="intro-title">Welcome to Advanced Telecommunication Training</h1>
        <p className="intro-subtitle">
          Enhance your telecalling skills with our interactive role-playing modules.
          Practice real-life scenarios and improve your communication abilities.
        </p>
        <div className="intro-buttons">
          <button className="btn-general-telecalling">Start General Telecalling Module</button>
          <button className="btn-product-telecalling">Explore Product-Based Telecalling Module</button>
        </div>
      </div>

      <div className="TrainingPage-containerFor-Features">
        <div className="TrainingPage-FeaturesSection">
          <div className="TrainingPage-leftFeatureSection">
            <h2>Interactive Training Modules</h2>
            <p>
              Practice telecalling with 26 realistic roleplay scenarios, including
              different customer types like happy, angry, and sad customers.
            </p>
            <h2>Easy Module Selection</h2>
            <p>
              Simply click on a module to start training, with clear guidelines
              provided before beginning.
            </p>
            <h2>Call Simulation Experience</h2>
            <p>
              The system mimics a real phone call with ringing sounds and a
              customer avatar appearing on the screen.
            </p>
            <h2>Voice-Based Interaction</h2>
            <p>
              Speak directly, and the system converts your speech into text,
              processes it, and provides a voice response.
            </p>
            <h2>Realistic Customer Responses</h2>
            <p>
              The customer’s voice tone changes dynamically based on their
              emotions, creating a more immersive experience.
            </p>
            <h2>Engaging Visuals & Animations</h2>
            <p>
              Avatars and smooth animations make the training feel more real
              and interactive.
            </p>
            <h2>Step-by-Step Guidance</h2>
            <p>
              Receive scenario descriptions and guidelines before starting to
              ensure you know what to do.
            </p>
          </div>
          <div className="TrainingPage-rightFeatureImageSection">
            <img src={product1_avatar} alt="Training Feature Preview" />
          </div>
        </div>
      </div>

      {showSelectionArea && (
        <div className="selectionAreaof-TrainingPage">
          <div className="General-TeleCommunication">
            <h2>General Telecalling Module</h2>
            <div className="scenario-descriptionForGeneral">
              <p className="General-TeleCommunication-titleTag">
                Enhance your communication skills with a simulated customer call experience. This module offers diverse interactions without focusing on any specific product, ensuring well-rounded practice.
              </p>
            </div>
            <div className="guidelines-generalTeleCommunication">
              <h3 className="guidelines-designDiv">Guidelines</h3>
              <ul className="guidelines-unorderedListTag">
                <li>Listen attentively to understand the customer's needs.</li>
                <li>Maintain a professional and respectful tone.</li>
                <li>Communicate clearly and concisely.</li>
                <li>Stay calm and composed, even in challenging situations.</li>
                <li>Use this session to enhance your communication skills.</li>
              </ul>
            </div>
            <div className="acknowledgments-generalTeleCommunication">
              <label>
                <input
                  type="checkbox"
                  checked={generalReadGuidelines}
                  onChange={() => setGeneralReadGuidelines(!generalReadGuidelines)}
                /> I have read the guidelines.
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={generalReadyToProceed}
                  onChange={() => setGeneralReadyToProceed(!generalReadyToProceed)}
                /> I am ready to proceed.
              </label>
            </div>
            <button
              id="start-practice"
              onClick={handleStartPracticeGeneral}
              disabled={!(generalReadGuidelines && generalReadyToProceed)}
            >
              Start Practice
            </button>
          </div>
          <div className="ProductBased-TeleCommunication">
            <h2>Specialized Role-Play Module</h2>
            <div className="scenario-descriptionForProductBased">
              <p>
                Select a product and a matching customer persona for targeted role-play scenarios. Gain focused, product-specific communication practice.
              </p>
            </div>
            <div className="producatList-traningPage">
              <h3>Product List</h3>
              <p>Select which product you want:</p>
              <div className="product-list">
                {productList.map((product, index) => (
                  <button
                    key={index}
                    onClick={() => handleProductClick(product)}
                    className={`product-button ${selectedProduct === product ? "active" : ""}`}
                  >
                    {product}
                  </button>
                ))}
              </div>
              {selectedProduct && (
                <div className="scenario-selection">
                  <h3>Select a Scenario for {selectedProduct}</h3>
                  <select value={selectedScenario} onChange={handleScenarioChange}>
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
                <button
                  id="start-practice-product"
                  onClick={handleStartPracticeProduct}
                  disabled={!(productReadGuidelines && productReadyToProceed)}
                >
                  Start Practice
                </button>
              )}
            </div>
            <div className="guidelines-generalTeleCommunication">
              <h3>Guidelines</h3>
              <ul>
                <li>Listen carefully to the customer's concerns.</li>
                <li>Adapt your tone based on the customer's emotions.</li>
                <li>Be ready with product-specific information.</li>
                <li>Stay calm and professional.</li>
                <li>Use these simulations to sharpen your product knowledge.</li>
              </ul>
            </div>
            <div className="acknowledgments-generalTeleCommunication">
              <label>
                <input
                  type="checkbox"
                  checked={productReadGuidelines}
                  onChange={() => setProductReadGuidelines(!productReadGuidelines)}
                /> I have read the guidelines.
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={productReadyToProceed}
                  onChange={() => setProductReadyToProceed(!productReadyToProceed)}
                /> I am ready to proceed.
              </label>
            </div>
          </div>
        </div>
      )}

      {renderCall && (
        <div className="CallInitation-sectionForTraningpageArea">
          <IoReturnUpBackOutline onClick={handleBackButton} size={30} className="back-button" />
          {callStatus === "inProgress" && (
            <div className="call-container">
              <div className="call-left">
                <button className="call-icon-button" onClick={handleToggleListening}>
                  <IoCall size={30} />
                </button>
                <div className="containerFor-userandBotConverstation">
                  {conversation.map((msg, idx) => (
                    <div key={idx} className={msg.type === "user" ? "userMessage" : "botReply"}>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <button className="User-microPhone" onClick={handleToggleListening}>
                  <FaMicrophone size={24} />
                </button>
              </div>
              <div className="call-right">
                <img src={avatar} alt="Avatar" className="avatar-img" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainingPage;
