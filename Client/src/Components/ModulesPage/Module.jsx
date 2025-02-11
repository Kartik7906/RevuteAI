import React, { useState } from "react";
import "./Module.css";
import company_logo from "../../images/company_logo.jpeg";
import { useNavigate } from "react-router-dom";
import modulesdata from "../modulesData";
import { TbMessageChatbot } from "react-icons/tb";
import { IoChevronBack } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import axios from "axios";

const Module = () => {
  const modulesData = modulesdata;
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubItem, setSelectedSubItem] = useState("");
  const [completedModules, setCompletedModules] = useState({});
  const [isAllModuleCompleted, setIsAllModuleCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [moduleScore, setModuleScore] = useState(null);
  const [moduleScores, setModuleScores] = useState({});
  const [isChatbotActive, setIsChatbotActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const percentCompleted = Math.floor(
    (Object.keys(completedModules).length / modulesData.length) * 100
  );

  const getNextModuleId = () => {
    const next = modulesData.find((module) => !completedModules[module.id]);
    return next ? next.id : null;
  };

  const handleModuleClick = (moduleId) => {
    const nextModuleId = getNextModuleId();
    if (!completedModules[moduleId] && nextModuleId !== moduleId) {
      alert("Please complete previous modules first.");
      return;
    }
    const newExpandedModule = expandedModule === moduleId ? null : moduleId;
    setExpandedModule(newExpandedModule);
    if (newExpandedModule === moduleId) {
      setSelectedModule(moduleId);
      setSelectedSubItem("");
      setUserAnswers({});
      setModuleScore(null);
    } else {
      setSelectedModule(null);
      setSelectedSubItem("");
      setUserAnswers({});
      setModuleScore(null);
    }
  };

  const handleSubItemClick = (moduleId, subItemName) => {
    const nextModuleId = getNextModuleId();
    if (!completedModules[moduleId] && nextModuleId !== moduleId) {
      alert("Please complete previous modules first.");
      return;
    }
    setSelectedModule(moduleId);
    setSelectedSubItem(subItemName);
    setUserAnswers({});
    setModuleScore(null);
  };

  const markModuleAsCompleted = (moduleId) => {
    const newCompletedModules = { ...completedModules, [moduleId]: true };
    setCompletedModules(newCompletedModules);
    if (modulesData.every((module) => newCompletedModules[module.id])) {
      setIsAllModuleCompleted(true);
    }
  };

  const currentModuleData = modulesData.find((m) => m.id === selectedModule);
  let contentToShow = "";
  if (currentModuleData) {
    if (selectedSubItem) {
      const subItemObject = currentModuleData.subItems.find(
        (s) => s.name === selectedSubItem
      );
      contentToShow = subItemObject ? subItemObject.content : "";
    } else {
      contentToShow = currentModuleData.moduleContent;
    }
  }

  const handleLogoutbtn = () => {
    localStorage.clear();
    navigate("/");
  };

  const breadcrumb = () => {
    if (!currentModuleData) return "";
    if (selectedSubItem) {
      return `${currentModuleData.title} >> ${selectedSubItem}`;
    }
    return `${currentModuleData.title}`;
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setUserAnswers({ ...userAnswers, [questionIndex]: optionIndex });
  };

  const handleSubmitQuiz = () => {
    if (!currentModuleData || !contentToShow.quiz) return;
    const quiz = contentToShow.quiz;
    let score = 0;
    quiz.forEach((quizItem, index) => {
      if (userAnswers[index] === quizItem.answer) {
        score += 1;
      }
    });
    setModuleScore(score);
    setModuleScores({ ...moduleScores, [currentModuleData.id]: score });
    markModuleAsCompleted(currentModuleData.id);
    alert(`Your score is ${score} out of ${quiz.length}`);
    const nextModuleId = getNextModuleId();
    if (nextModuleId) {
      setSelectedModule(nextModuleId);
      setExpandedModule(nextModuleId);
      setSelectedSubItem("");
      setUserAnswers({});
      setModuleScore(null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);

    try {
      const response = await axios.post("http://localhost:8000/api/chat", { userMessage: input });
      setMessages([...newMessages, { text: response.data.botReply, sender: "bot" }]);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setInput("");
  };

  const toggleChatbot = () => {
    setIsChatbotActive(!isChatbotActive);
  };

  return (
    <div className="ModulePage-MainContainer">
      <div className="ModulePage-elements">
        <nav className="ModulePage-Navbar">
          <div className="CompanyLogo-Here" onClick={() => navigate("/")}>
            <img src={company_logo} alt="Company Logo" />
          </div>
          <div className="ModulePageNavbar-rightsection">
            <button className="Logout-btn-design" onClick={handleLogoutbtn}>
              Logout
            </button>
            <div
              className="ModulePageNavbar-circulardiv"
              onClick={() => navigate("/profile")}
            />
          </div>
        </nav>
        <div className="ModulePage-middleSection">
          <div className="Modulepage-sidebar">
            <div className="ModulesSection">
              <p className="BackToDashbord-btn">
                <IoChevronBack onClick={() => navigate("/landingpage")} /> Go to
                Dashboard
              </p>
              <p className="Course-title">Placement Guarantee Course - 2025</p>
              <div className="ModuleTracker-colorbar">
                <div
                  className="ModuleTracker-completedSection"
                  style={{ width: `${percentCompleted}%` }}
                ></div>
              </div>
              <p className="percentageCompletedSection">
                {percentCompleted}% complete
              </p>
            </div>
            <ul>
              {modulesData.map((module) => (
                <li key={module.id}>
                  <div
                    className={`ModuleItem ${
                      selectedModule === module.id ? "selected" : ""
                    }`}
                    onClick={() => handleModuleClick(module.id)}
                  >
                    <div>
                      <div className="Modulepage-sidebaritem">
                        {module.title}
                        <div
                          className={
                            completedModules[module.id]
                              ? "ModuleCompletionIndicator completed"
                              : "ModuleCompletionIndicator"
                          }
                        />
                      </div>
                      <p className="Module-descriptiontext">
                        {module.description}
                      </p>
                      <p className="Module-durationtext">
                        {moduleScores[module.id] !== undefined
                          ? `Score: ${moduleScores[module.id]}`
                          : ""}
                      </p>
                    </div>
                    <FaChevronDown />
                  </div>
                  {expandedModule === module.id && (
                    <ul className="ModuleSubItems">
                      {module.subItems.map((sub, index) => (
                        <li
                          key={index}
                          onClick={() =>
                            handleSubItemClick(module.id, sub.name)
                          }
                        >
                          {sub.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="ModulePage-sidebar-visibleArea">
            <div className="ModulePage-track-folderStructure">
              {breadcrumb()}
            </div>
            <div className="ModulePage-module-contentArea">
              {selectedModule && (
                <>
                  <h2>{currentModuleData?.title}</h2>
                  {selectedSubItem === "Practice Section" &&
                  typeof contentToShow === "object" &&
                  contentToShow.quiz ? (
                    <div className="QuizSection">
                      {contentToShow.quiz.map((quizItem, index) => (
                        <div key={index} className="QuizItem">
                          <p>
                            <strong>Q{index + 1}:</strong> {quizItem.question}
                          </p>
                          <ul>
                            {quizItem.options.map((option, optIndex) => (
                              <li key={optIndex}>
                                <label>
                                  <input
                                    type="radio"
                                    name={`question-${index}`}
                                    value={optIndex}
                                    checked={userAnswers[index] === optIndex}
                                    onChange={() =>
                                      handleAnswerChange(index, optIndex)
                                    }
                                  />
                                  {option}
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <button onClick={handleSubmitQuiz}>Submit Quiz</button>
                      {moduleScore !== null && (
                        <div className="ModulePage-scoreSection">
                          <p>
                            Score: {moduleScore} out of{" "}
                            {contentToShow.quiz.length}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{contentToShow}</p>
                  )}
                </>
              )}
              {isAllModuleCompleted && (
                <div className="ModulePagenextStep">
                  <h2>
                    Congrats, you have unlocked the next step after passing all
                    modules successfully.
                  </h2>
                  <p>Ready to interact with BotAI and take your next step?</p>
                  <button>Next Step</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="ModulePageChatbot-circulardiv" onClick={toggleChatbot}>
        <TbMessageChatbot />
      </div>

      {isChatbotActive && (
        <div className="ModulePageChatbot-chatbotdiv">
          <div className="Chatbot-messages-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`Chatbot-message ${
                  msg.sender === "user"
                    ? "Chatbot-user-message"
                    : "Chatbot-bot-message"
                }`}
              >
                <p className="Chatbot-message-text">{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="Chatbot-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="Chatbot-input"
            />
            <button onClick={sendMessage} className="Chatbot-send-button">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module;
