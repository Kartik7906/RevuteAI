import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TbMessageChatbot } from "react-icons/tb";
import { IoChevronBack } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import axios from "axios";
import "./Module.css";
import companyLogo from "../../images/company_logo.jpeg";
import modulesData from "../modulesData";

const Module = () => {
  const navigate = useNavigate();
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [expandedSubItemsMap, setExpandedSubItemsMap] = useState({});
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedSubItemName, setSelectedSubItemName] = useState("");
  const [selectedTopicName, setSelectedTopicName] = useState("");
  const [completedModules, setCompletedModules] = useState({});
  const [completedSubItems, setCompletedSubItems] = useState({});
  const [completedTopics, setCompletedTopics] = useState({});
  const [isAllModulesCompleted, setIsAllModulesCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentModuleScore, setCurrentModuleScore] = useState(null);
  const [moduleScores, setModuleScores] = useState({});
  const [isChatbotActive, setIsChatbotActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const totalTopicCount = modulesData.reduce((acc, mod) => {
    mod.subItems.forEach((sub) => {
      if (sub.topics) acc += sub.topics.length;
    });
    return acc;
  }, 0);

  const completedTopicCount = Object.values(completedTopics).reduce((acc, subByModule) => {
    return (
      acc +
      Object.values(subByModule).reduce((subAcc, topicsBySub) => {
        return subAcc + Object.values(topicsBySub).filter(Boolean).length;
      }, 0)
    );
  }, 0);

  const progressPercentage = totalTopicCount
    ? Math.floor((completedTopicCount / totalTopicCount) * 100)
    : 0;

  const getNextModuleId = () => {
    const nextModule = modulesData.find((m) => !completedModules[m.id]);
    return nextModule ? nextModule.id : null;
  };

  const isSubItemCompleted = (moduleId, subItemName) => {
    return completedSubItems[moduleId]?.[subItemName] || false;
  };

  const getSubItemIndex = (moduleData, subItemName) => {
    return moduleData.subItems.findIndex((s) => s.name === subItemName);
  };

  const allTopicsCompleted = (moduleId, subItemName) => {
    const modData = modulesData.find((m) => m.id === moduleId);
    if (!modData) return false;
    const subItem = modData.subItems.find((s) => s.name === subItemName);
    if (!subItem?.topics) return true;
    const completed = completedTopics[moduleId]?.[subItemName] || {};
    return subItem.topics.every((t) => completed[t.name]);
  };

  const handleModuleClick = (moduleId) => {
    const nextModuleId = getNextModuleId();
    if (!completedModules[moduleId] && nextModuleId !== moduleId) {
      alert("Please complete previous modules first.");
      return;
    }
    setExpandedModuleId((p) => (p === moduleId ? null : moduleId));
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
      setSelectedSubItemName("");
      setSelectedTopicName("");
    } else {
      setSelectedModuleId(moduleId);
      setSelectedSubItemName("");
      setSelectedTopicName("");
      setUserAnswers({});
      setCurrentModuleScore(null);
    }
  };

  const handleSubItemClick = (moduleId, subItemName) => {
    const mData = modulesData.find((m) => m.id === moduleId);
    if (!mData) return;
    const subIndex = getSubItemIndex(mData, subItemName);
    if (subIndex > 0) {
      const prevSub = mData.subItems[subIndex - 1];
      if (!isSubItemCompleted(moduleId, prevSub.name)) {
        alert("Complete the previous section first.");
        return;
      }
    }
    const nextModuleId = getNextModuleId();
    if (!completedModules[moduleId] && nextModuleId !== moduleId) {
      alert("Please complete previous modules first.");
      return;
    }
    setExpandedSubItemsMap((prev) => {
      const alreadyExpanded = prev[moduleId] === subItemName;
      return { ...prev, [moduleId]: alreadyExpanded ? null : subItemName };
    });
    if (selectedSubItemName === subItemName) {
      setSelectedSubItemName("");
      setSelectedTopicName("");
    } else {
      setSelectedModuleId(moduleId);
      setSelectedSubItemName(subItemName);
      setSelectedTopicName("");
      setUserAnswers({});
      setCurrentModuleScore(null);
    }
  };

  const handleTopicClick = (moduleId, subItemName, topicName) => {
    setSelectedModuleId(moduleId);
    setSelectedSubItemName(subItemName);
    setSelectedTopicName(topicName);
    setUserAnswers({});
    setCurrentModuleScore(null);
  };

  const handleMarkTopicCompleted = (moduleId, subItemName, topicName) => {
    const updated = { ...completedTopics };
    if (!updated[moduleId]) updated[moduleId] = {};
    if (!updated[moduleId][subItemName]) updated[moduleId][subItemName] = {};
    updated[moduleId][subItemName][topicName] = true;
    setCompletedTopics(updated);
    if (allTopicsCompleted(moduleId, subItemName)) {
      const updatedSubItems = { ...completedSubItems };
      if (!updatedSubItems[moduleId]) updatedSubItems[moduleId] = {};
      updatedSubItems[moduleId][subItemName] = true;
      setCompletedSubItems(updatedSubItems);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const currentModuleDataObj = modulesData.find((m) => m.id === selectedModuleId);

  const getDisplayContent = () => {
    if (!currentModuleDataObj) return "";
    if (selectedSubItemName) {
      const subItem = currentModuleDataObj.subItems.find(
        (s) => s.name === selectedSubItemName
      );
      if (!subItem) return currentModuleDataObj.moduleContent;
      if (selectedTopicName && subItem.topics) {
        const topicObj = subItem.topics.find((t) => t.name === selectedTopicName);
        return topicObj ? topicObj.content : subItem.content;
      }
      return subItem.content;
    }
    return currentModuleDataObj.moduleContent;
  };

  const breadcrumb = () => {
    if (!currentModuleDataObj) return "";
    let path = currentModuleDataObj.title;
    if (selectedSubItemName) path += " >> " + selectedSubItemName;
    if (selectedTopicName) path += " >> " + selectedTopicName;
    return path;
  };

  const handleAnswerChange = (qIndex, optIndex) => {
    setUserAnswers({ ...userAnswers, [qIndex]: optIndex });
  };

  const handleSubmitQuiz = () => {
    const content = getDisplayContent();
    if (!content?.quiz) return;
    const quiz = content.quiz;
    let score = 0;
    quiz.forEach((item, i) => {
      if (userAnswers[i] === item.answer) score += 1;
    });
    const passScore = Math.ceil(quiz.length * 0.8);
    if (score >= passScore) {
      setCurrentModuleScore(score);
      setModuleScores({ ...moduleScores, [currentModuleDataObj.id]: score });
      const updatedMods = { ...completedModules, [currentModuleDataObj.id]: true };
      setCompletedModules(updatedMods);
      if (modulesData.every((m) => updatedMods[m.id])) setIsAllModulesCompleted(true);
      alert(`You scored ${score} out of ${quiz.length}. Module passed!`);
      const nextId = getNextModuleId();
      if (nextId) {
        setSelectedModuleId(nextId);
        setExpandedModuleId(nextId);
        setSelectedSubItemName("");
        setSelectedTopicName("");
        setUserAnswers({});
        setCurrentModuleScore(null);
      }
    } else {
      alert(`You scored ${score} out of ${quiz.length}, below 80%. Retake the quiz.`);
    }
  };

  const toggleChatbot = () => {
    setIsChatbotActive(!isChatbotActive);
  };

  const sendMessageToChatbot = async () => {
    if (!chatInput.trim()) return;
    const newUserMessage = { text: chatInput, sender: "user" };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    try {
      const response = await axios.post("http://localhost:8000/api/chat", {
        userMessage: chatInput,
      });
      const botReply = { text: response.data.botReply, sender: "bot" };
      setMessages([...updatedMessages, botReply]);
    } catch {
      alert("Error sending message.");
    }
    setChatInput("");
  };

  return (
    <div className="ModulePage-MainContainer">
      <div className="ModulePage-elements">
        <nav className="ModulePage-Navbar">
          <div className="CompanyLogo-Here" onClick={() => navigate("/")}>
            <img src={companyLogo} alt="Company Logo" />
          </div>
          <div className="ModulePageNavbar-rightsection">
            <button className="Logout-btn-design" onClick={handleLogout}>
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
              <p className="BackToDashbord-btn" onClick={() => navigate("/landingpage")}>
                <IoChevronBack /> Go to Dashboard
              </p>
              <p className="Course-title">Placement Guarantee Course - 2025</p>
              <div className="ModuleTracker-colorbar">
                <div
                  className="ModuleTracker-completedSection"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="percentageCompletedSection">
                {progressPercentage}% complete
              </p>
            </div>
            <ul>
              {modulesData.map((module) => {
                const isExpanded = expandedModuleId === module.id;
                const isSelected = selectedModuleId === module.id;
                const score = moduleScores[module.id];
                return (
                  <li key={module.id}>
                    <div
                      className={`ModuleItem ${isSelected ? "selected" : ""}`}
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
                        {score !== undefined && (
                          <p className="Module-durationtext">Score: {score}</p>
                        )}
                      </div>
                      <FaChevronDown className={isExpanded ? "rotate-icon" : ""} />
                    </div>
                    {isExpanded && (
                      <ul className="ModuleSubItems">
                        {module.subItems.map((sub, i) => {
                          const expandedSub = expandedSubItemsMap[module.id] === sub.name;
                          const isSubSelected = selectedSubItemName === sub.name;
                          return (
                            <li key={i}>
                              <div
                                onClick={() => handleSubItemClick(module.id, sub.name)}
                                className={isSubSelected ? "selectedSubItem" : ""}
                              >
                                {sub.name}
                                <FaChevronDown className={expandedSub ? "rotate-icon" : ""} />
                              </div>
                              {expandedSub && sub.topics && sub.topics.length > 0 && (
                                <ul className="ModuleTopics">
                                  {sub.topics.map((topic, tIndex) => {
                                    const isTopicSelected = selectedTopicName === topic.name;
                                    const topicDone =
                                      completedTopics[module.id]?.[sub.name]?.[topic.name];
                                    return (
                                      <li key={tIndex}>
                                        <div
                                          onClick={() =>
                                            handleTopicClick(module.id, sub.name, topic.name)
                                          }
                                          className={isTopicSelected ? "selectedTopic" : ""}
                                        >
                                          {topic.name}
                                          {topicDone && (
                                            <span className="TopicDoneIndicator">✓</span>
                                          )}
                                        </div>
                                        {!topicDone && (
                                          <button
                                            className="MarkCompletedBtn"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMarkTopicCompleted(
                                                module.id,
                                                sub.name,
                                                topic.name
                                              );
                                            }}
                                          >
                                            Mark as Completed
                                          </button>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="ModulePage-sidebar-visibleArea">
            <div className="ModulePage-track-folderStructure">{breadcrumb()}</div>
            <div className="ModulePage-module-contentArea">
              {selectedModuleId && (
                <>
                  <h2>{currentModuleDataObj?.title}</h2>
                  {selectedSubItemName === "Practice Section" &&
                  typeof getDisplayContent() === "object" &&
                  getDisplayContent()?.quiz ? (
                    <div className="QuizSection">
                      {getDisplayContent().quiz.map((q, i) => (
                        <div key={i} className="QuizItem">
                          <p>
                            <strong>Q{i + 1}:</strong> {q.question}
                          </p>
                          <ul>
                            {q.options.map((opt, idx) => (
                              <li key={idx}>
                                <label>
                                  <input
                                    type="radio"
                                    name={`question-${i}`}
                                    value={idx}
                                    checked={userAnswers[i] === idx}
                                    onChange={() => handleAnswerChange(i, idx)}
                                  />
                                  {opt}
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <button onClick={handleSubmitQuiz}>Submit Quiz</button>
                      {currentModuleScore !== null && (
                        <div className="ModulePage-scoreSection">
                          <p>
                            Score: {currentModuleScore} out of {getDisplayContent().quiz.length}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>{getDisplayContent()}</p>
                  )}
                </>
              )}
              {isAllModulesCompleted && (
                <div className="ModulePagenextStep">
                  <h2>All modules completed. You have unlocked the next step.</h2>
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
                className={
                  msg.sender === "user"
                    ? "Chatbot-message Chatbot-user-message"
                    : "Chatbot-message Chatbot-bot-message"
                }
              >
                <p className="Chatbot-message-text">{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="Chatbot-input-container">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              className="Chatbot-input"
            />
            <button onClick={sendMessageToChatbot} className="Chatbot-send-button">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module;
