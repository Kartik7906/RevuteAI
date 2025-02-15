// Module.jsx (main front-end changes to track sub-item attempts instead of module-level)
import React, { useState, useEffect } from "react";
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
  const [subItemAttempts, setSubItemAttempts] = useState({});
  const [subItemScores, setSubItemScores] = useState({});
  const [backendProgress, setBackendProgress] = useState(0);
  const [isAllModulesCompleted, setIsAllModulesCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentSubItemScore, setCurrentSubItemScore] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isChatbotActive, setIsChatbotActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    fetchUserProgress();
  }, [userId, navigate, selectedModuleId]);

  const fetchUserProgress = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/module/${userId}`);
      if (!response.data || !response.data.modules) return;
      setBackendProgress(response.data.progress || 0);
      const cm = {};
      const cs = {};
      const ct = {};
      const siAttempts = {};
      const siScores = {};
      response.data.modules.forEach((mod) => {
        cm[mod.moduleId] = !!mod.completed;
        if (mod.subItems && mod.subItems.length > 0) {
          cs[mod.moduleId] = {};
          ct[mod.moduleId] = {};
          siAttempts[mod.moduleId] = {};
          siScores[mod.moduleId] = {};
          mod.subItems.forEach((sub) => {
            cs[mod.moduleId][sub.subItemName] = !!sub.completed;
            siAttempts[mod.moduleId][sub.subItemName] = sub.attempts || 0;
            siScores[mod.moduleId][sub.subItemName] = sub.score;
            ct[mod.moduleId][sub.subItemName] = {};
            if (sub.topics && sub.topics.length > 0) {
              sub.topics.forEach((topic) => {
                ct[mod.moduleId][sub.subItemName][topic.topicName] = !!topic.completed;
              });
            }
          });
        }
      });
      setCompletedModules(cm);
      setCompletedSubItems(cs);
      setCompletedTopics(ct);
      setSubItemAttempts(siAttempts);
      setSubItemScores(siScores);
      const allDone = modulesData.slice(0, 3).every((m) => cm[m.id]);
      setIsAllModulesCompleted(allDone);
    } catch (error) {}
  };

  const handleModuleClick = (moduleId) => {
    const firstIncomplete = modulesData.find((m) => !completedModules[m.id] && m.id < moduleId && m.id !== 4);
    if (firstIncomplete && firstIncomplete.id < moduleId) {
      alert("Please complete previous modules first.");
      return;
    }
    if (moduleId === 4 && !modulesData.slice(0, 3).every((m) => completedModules[m.id])) {
      alert("You must complete all previous modules to access BotMock Pitching.");
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
      setCurrentSubItemScore(null);
    }
  };

  const handleSubItemClick = (moduleId, subItemName) => {
    const modDef = modulesData.find((m) => m.id === moduleId);
    if (!modDef || !modDef.subItems) return;
    const subIndex = modDef.subItems.findIndex((s) => s.name === subItemName);
    if (subIndex > 0) {
      const prevSub = modDef.subItems[subIndex - 1];
      const done = completedSubItems[moduleId] && completedSubItems[moduleId][prevSub.name];
      if (!done) {
        alert("Complete the previous section first.");
        return;
      }
    }
    setExpandedSubItemsMap((prev) => {
      const already = prev[moduleId] === subItemName;
      return { ...prev, [moduleId]: already ? null : subItemName };
    });
    if (selectedSubItemName === subItemName) {
      setSelectedSubItemName("");
      setSelectedTopicName("");
    } else {
      setSelectedModuleId(moduleId);
      setSelectedSubItemName(subItemName);
      setSelectedTopicName("");
      setUserAnswers({});
      setCurrentSubItemScore(null);
    }
  };

  const handleTopicClick = (moduleId, subItemName, topicName) => {
    setSelectedModuleId(moduleId);
    setSelectedSubItemName(subItemName);
    setSelectedTopicName(topicName);
    setUserAnswers({});
    setCurrentSubItemScore(null);
  };

  const handleMarkTopicCompleted = async (moduleId, subItemName, topicName) => {
    try {
      await axios.post(`http://localhost:8000/api/module/${userId}/completeTopic`, {
        moduleId: moduleId.toString(),
        subItemName,
        topicName,
        username
      });
      fetchUserProgress();
    } catch (error) {}
  };

  const getDisplayContent = () => {
    const modDef = modulesData.find((m) => m.id === selectedModuleId);
    if (!modDef) return "";
    if (!selectedSubItemName) return modDef.moduleContent;
    const sub = modDef.subItems && modDef.subItems.find((s) => s.name === selectedSubItemName);
    if (!sub) return modDef.moduleContent;
    if (selectedTopicName && sub.topics) {
      const topic = sub.topics.find((t) => t.name === selectedTopicName);
      return topic ? topic.content : sub.content;
    }
    return sub.content;
  };

  const breadcrumb = () => {
    const modDef = modulesData.find((m) => m.id === selectedModuleId);
    if (!modDef) return "";
    let path = modDef.title;
    if (selectedSubItemName) path += " >> " + selectedSubItemName;
    if (selectedTopicName) path += " >> " + selectedTopicName;
    return path;
  };

  const isTestSubItem = (name) => name.toLowerCase().includes("test");

  const handleAnswerChange = (qIndex, optIndex) => {
    setUserAnswers({ ...userAnswers, [qIndex]: optIndex });
  };

  const handleSubmitQuiz = async () => {
    const content = getDisplayContent();
    if (!content?.quiz) return;
    let score = 0;
    content.quiz.forEach((item, i) => {
      if (userAnswers[i] === item.answer) score += 1;
    });
    try {
      const res = await axios.post(`http://localhost:8000/api/module/${userId}/submitScore`, {
        moduleId: selectedModuleId.toString(),
        subItemName: selectedSubItemName,
        score,
        username
      });
      alert(`You scored ${score} out of ${content.quiz.length}.`);
      setCurrentSubItemScore(score);
      fetchUserProgress();
    } catch (error) {
      if (error.response && error.response.data) {
        alert(`${error.response.data.error} (Attempt: ${error.response.data.attempts || 0})`);
      }
    }
  };

  useEffect(() => {
    if (selectedSubItemName && isTestSubItem(selectedSubItemName)) {
      setShowInstructions(true);
    } else {
      setShowInstructions(false);
    }
  }, [selectedSubItemName]);

  const handleStartTest = () => {
    setShowInstructions(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleChatbot = () => {
    setIsChatbotActive(!isChatbotActive);
  };

  const sendMessageToChatbot = async () => {
    if (!chatInput.trim()) return;
    const newUserMsg = { text: chatInput, sender: "user" };
    const updated = [...messages, newUserMsg];
    setMessages(updated);
    try {
      const r = await axios.post("http://localhost:8000/api/chat", { userMessage: chatInput });
      const botRes = { text: r.data.botReply, sender: "bot" };
      setMessages([...updated, botRes]);
    } catch (error) {}
    setChatInput("");
  };

  const modDef = modulesData.find((m) => m.id === selectedModuleId);
  const subItemDef = modDef?.subItems?.find((s) => s.name === selectedSubItemName);
  const isTest = subItemDef && isTestSubItem(subItemDef.name);
  const testContent = isTest ? getDisplayContent() : null;
  const currentAttempts = subItemAttempts[selectedModuleId]?.[selectedSubItemName] || 0;
  const isTestLocked = currentAttempts >= 3;
  const isTestAlreadyDone = completedSubItems[selectedModuleId]?.[selectedSubItemName];

  return (
    <div className="ModulePage-MainContainer">
      <div className="ModulePage-elements">
        <nav className="ModulePage-Navbar">
          <div className="CompanyLogo-Container" onClick={() => navigate("/")}>
            <img src={companyLogo} alt="Company Logo" />
          </div>
          <div className="Navbar-rightSection">
            <button className="Logout-btn" onClick={handleLogout}>Logout</button>
            <div className="UserAvatar" onClick={() => navigate("/profile")} />
          </div>
        </nav>
        <div className="ModulePage-middleSection">
          <aside className="Modulepage-sidebar">
            <div className="ModulesSection">
              <p className="BackToDashboard" onClick={() => navigate("/elearning")}>
                <IoChevronBack /> Go to Dashboard
              </p>
              <p className="Course-title">Placement Guarantee Course - 2025</p>
              <div className="ProgressBar">
                <div className="ProgressCompleted" style={{ width: `${backendProgress}%` }} />
              </div>
              <p className="ProgressText">{backendProgress}% complete</p>
            </div>
            <ul className="SidebarList">
              {modulesData.map((mod) => {
                const expanded = expandedModuleId === mod.id;
                const selected = selectedModuleId === mod.id;
                return (
                  <li key={mod.id}>
                    <div className={`ModuleItem ${selected ? "selected" : ""}`} onClick={() => handleModuleClick(mod.id)}>
                      <div className="ModuleTitle">
                        {mod.title}
                        <div
                          className={
                            completedModules[mod.id] ? "ModuleCompletionIndicator completed" : "ModuleCompletionIndicator"
                          }
                        />
                      </div>
                      <FaChevronDown className={expanded ? "rotate-icon" : ""} />
                    </div>
                    {expanded && mod.subItems && (
                      <ul className="ModuleSubItems">
                        {mod.subItems.map((sub, idx) => {
                          const isExp = expandedSubItemsMap[mod.id] === sub.name;
                          const subSelected = selectedSubItemName === sub.name;
                          return (
                            <li key={idx}>
                              <div onClick={() => handleSubItemClick(mod.id, sub.name)} className={subSelected ? "selectedSubItem" : ""}>
                                {sub.name}
                                <FaChevronDown className={isExp ? "rotate-icon" : ""} />
                              </div>
                              {isExp && sub.topics && (
                                <ul className="ModuleTopics">
                                  {sub.topics.map((top, tIndex) => {
                                    const tSelected = selectedTopicName === top.name;
                                    const done = completedTopics[mod.id]?.[sub.name]?.[top.name];
                                    return (
                                      <li key={tIndex}>
                                        <div onClick={() => handleTopicClick(mod.id, sub.name, top.name)} className={tSelected ? "selectedTopic" : ""}>
                                          {top.name}
                                          {done && <span className="TopicDoneIndicator">✓</span>}
                                        </div>
                                        {!done && (
                                          <button
                                            className="MarkCompletedBtn"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMarkTopicCompleted(mod.id, sub.name, top.name);
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
          </aside>
          <main className="ModulePage-contentArea">
            <div className="Breadcrumb">{breadcrumb()}</div>
            <div className="ContentCard">
              {selectedModuleId && modDef && (
                <>
                  <h2>{modDef.title}</h2>
                  {isTest ? (
                    isTestAlreadyDone ? (
                      <div className="TestCompleted">
                        <p>Test completed. Your score: {subItemScores[selectedModuleId]?.[selectedSubItemName] ?? "N/A"}</p>
                      </div>
                    ) : showInstructions ? (
                      <div className="InstructionsCard">
                        <h3>Instructions</h3>
                        <ul>
                          <li>Score at least 80% (8/10) to pass.</li>
                          <li>Each test allows 3 attempts per day.</li>
                          <li>If you fail 3 times, the test locks until tomorrow.</li>
                        </ul>
                        <button onClick={handleStartTest} disabled={isTestLocked}>
                          Start Test
                        </button>
                      </div>
                    ) : isTestLocked ? (
                      <div className="LockedMessage">
                        <p>You have reached the maximum attempts for today. Please try again tomorrow.</p>
                      </div>
                    ) : (
                      <div className="QuizSection">
                        <div className="AttemptsInfo">Attempts: {currentAttempts} / 3</div>
                        {testContent.quiz.map((q, i) => (
                          <div key={i} className="QuizItem">
                            <p><strong>Q{i + 1}:</strong> {q.question}</p>
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
                        <button className="SubmitQuizBtn" onClick={handleSubmitQuiz}>
                          Submit Quiz
                        </button>
                        {currentSubItemScore !== null && (
                          <div className="ScoreSection">
                            <p>Score: {currentSubItemScore} / {testContent.quiz.length}</p>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <p className="ContentText">{getDisplayContent()}</p>
                  )}
                </>
              )}
              {isAllModulesCompleted && (
                <div className="NextStep">
                  <h2>All required modules completed. Next step is unlocked.</h2>
                  <button className="NextStepBtn" onClick={() => handleModuleClick(4)}>Go to BotMock Pitching</button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <div className="ChatbotToggle" onClick={toggleChatbot}>
        <TbMessageChatbot size={40} />
      </div>
      {isChatbotActive && (
        <div className="ChatbotContainer">
          <div className="ChatbotMessages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "user" ? "ChatbotMessage ChatbotUserMessage" : "ChatbotMessage ChatbotBotMessage"}
              >
                <p className="ChatbotMessageText">{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="ChatbotInputArea">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              className="ChatbotInput"
            />
            <button onClick={sendMessageToChatbot} className="ChatbotSendBtn">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module;
