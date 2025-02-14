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
  const [moduleScores, setModuleScores] = useState({});
  const [backendProgress, setBackendProgress] = useState(0);
  const [isAllModulesCompleted, setIsAllModulesCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentModuleScore, setCurrentModuleScore] = useState(null);

  const [isChatbotActive, setIsChatbotActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  const [showInstructions, setShowInstructions] = useState(false);

  const [attempts, setAttempts] = useState(0);

  const token = localStorage.getItem("token");
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
      const response = await axios.get(
        `http://localhost:8000/api/module/${userId}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const userProgress = response.data;
      if (!userProgress || !userProgress.modules) return;

      setBackendProgress(userProgress.progress || 0);

      const newCompletedModules = {};
      const newCompletedSubItems = {};
      const newCompletedTopics = {};
      const newModuleScores = {};

      userProgress.modules.forEach((mod) => {
        newCompletedModules[mod.moduleId] = !!mod.completed;
        if (mod.score !== null && mod.score !== undefined) {
          newModuleScores[mod.moduleId] = mod.score;
        }

        if (mod.subItems && mod.subItems.length > 0) {
          newCompletedSubItems[mod.moduleId] = {};
          newCompletedTopics[mod.moduleId] = {};

          mod.subItems.forEach((sub) => {
            newCompletedSubItems[mod.moduleId][sub.subItemName] =
              !!sub.completed;
            newCompletedTopics[mod.moduleId][sub.subItemName] = {};

            if (sub.topics && sub.topics.length > 0) {
              sub.topics.forEach((topic) => {
                newCompletedTopics[mod.moduleId][sub.subItemName][
                  topic.topicName
                ] = !!topic.completed;
              });
            }
          });
        }
      });

      setCompletedModules(newCompletedModules);
      setCompletedSubItems(newCompletedSubItems);
      setCompletedTopics(newCompletedTopics);
      setModuleScores(newModuleScores);

      const allDone = modulesData.every(
        (m) => newCompletedModules[m.id.toString()]
      );
      setIsAllModulesCompleted(allDone);

      if (selectedModuleId) {
        const moduleProg = userProgress.modules.find(
          (m) => m.moduleId === selectedModuleId.toString()
        );
        setAttempts(moduleProg ? moduleProg.attempts || 0 : 0);
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  const handleModuleClick = (moduleId) => {
    const nextModule = modulesData.find(
      (m) => !completedModules[m.id.toString()]
    );
    if (
      !completedModules[moduleId.toString()] &&
      nextModule &&
      nextModule.id !== moduleId
    ) {
      alert("Please complete previous modules first.");
      return;
    }

    setExpandedModuleId((prev) => (prev === moduleId ? null : moduleId));

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

    const subIndex = mData.subItems.findIndex((s) => s.name === subItemName);
    if (subIndex > 0) {
      const prevSub = mData.subItems[subIndex - 1];
      if (!completedSubItems[moduleId.toString()]?.[prevSub.name]) {
        alert("Complete the previous section first.");
        return;
      }
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

  const handleMarkTopicCompleted = async (moduleId, subItemName, topicName) => {
    try {
      const key = moduleId.toString();
      const updatedTopics = { ...completedTopics };
      if (!updatedTopics[key]) updatedTopics[key] = {};
      if (!updatedTopics[key][subItemName]) {
        updatedTopics[key][subItemName] = {};
      }
      updatedTopics[key][subItemName][topicName] = true;
      setCompletedTopics(updatedTopics);

      await axios.post(
        `http://localhost:8000/api/module/${userId}/completeTopic`,
        {
          moduleId: moduleId.toString(),
          subItemName,
          topicName,
          username,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      fetchUserProgress();
    } catch (error) {
      alert("Error marking topic as completed.");
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const currentModuleDataObj = modulesData.find(
    (m) => m.id === selectedModuleId
  );

  const getDisplayContent = () => {
    if (!currentModuleDataObj) return "";
    if (selectedSubItemName) {
      const subItem = currentModuleDataObj.subItems.find(
        (s) => s.name === selectedSubItemName
      );
      if (!subItem) return currentModuleDataObj.moduleContent;
      if (selectedTopicName && subItem.topics) {
        const topicObj = subItem.topics.find(
          (t) => t.name === selectedTopicName
        );
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

  const handleSubmitQuiz = async () => {
    const content = getDisplayContent();
    if (!content?.quiz) return; // no quiz content

    const quiz = content.quiz;
    let score = 0;
    // calculate raw score
    quiz.forEach((item, i) => {
      if (userAnswers[i] === item.answer) {
        score += 1;
      }
    });

    try {
      const response = await axios.post(
        `http://localhost:8000/api/module/${userId}/submitScore`,
        {
          moduleId: currentModuleDataObj.id.toString(),
          score,
          username,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      alert(
        `You scored ${score} out of ${quiz.length}. Module passed successfully!`
      );
      setCurrentModuleScore(score);
      setModuleScores((prev) => ({
        ...prev,
        [currentModuleDataObj.id.toString()]: score,
      }));
      setCompletedModules((prev) => ({
        ...prev,
        [currentModuleDataObj.id.toString()]: true,
      }));

      const nextModule = modulesData.find(
        (m) => !completedModules[m.id.toString()]
      );
      if (nextModule) {
        setSelectedModuleId(nextModule.id);
        setExpandedModuleId(nextModule.id);
        setSelectedSubItemName("");
        setSelectedTopicName("");
        setUserAnswers({});
        setCurrentModuleScore(null);
      }

      fetchUserProgress();
    } catch (error) {
      if (error.response && error.response.data) {
        alert(
          `${error.response.data.error} (Attempt: ${
            error.response.data.attempts || attempts
          })`
        );
        if (error.response.data.attempts !== undefined) {
          setAttempts(error.response.data.attempts);
        }
      } else {
        alert("Error submitting quiz score.");
      }
      console.error(error);
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
    } catch (error) {
      alert("Error sending message to chatbot.");
      console.error(error);
    }
    setChatInput("");
  };

  useEffect(() => {
    if (selectedSubItemName === "Practice Section" && currentModuleDataObj) {
      setShowInstructions(true);
    } else {
      setShowInstructions(false);
    }
  }, [selectedSubItemName, currentModuleDataObj]);

  const handleStartTest = () => {
    setShowInstructions(false);
  };

  // Check if attempts >= 3 -> disable test ***
  const isTestDisabled = attempts >= 3;

  return (
    <div className="ModulePage-MainContainer">
      <div className="ModulePage-elements">
        <nav className="ModulePage-Navbar">
          <div className="CompanyLogo-Container" onClick={() => navigate("/")}>
            <img src={companyLogo} alt="Company Logo" />
          </div>
          <div className="Navbar-rightSection">
            <button className="Logout-btn" onClick={handleLogout}>
              Logout
            </button>
            <div className="UserAvatar" onClick={() => navigate("/profile")} />
          </div>
        </nav>

        <div className="ModulePage-middleSection">
          <aside className="Modulepage-sidebar">
            <div className="ModulesSection">
              <p
                className="BackToDashboard"
                onClick={() => navigate("/elearning")}
              >
                <IoChevronBack /> Go to Dashboard
              </p>
              <p className="Course-title">Placement Guarantee Course - 2025</p>
              <div className="ProgressBar">
                <div
                  className="ProgressCompleted"
                  style={{ width: `${backendProgress}%` }}
                />
              </div>
              <p className="ProgressText">{backendProgress}% complete</p>
            </div>

            <ul className="SidebarList">
              {modulesData.map((module) => {
                const isExpanded = expandedModuleId === module.id;
                const isSelected = selectedModuleId === module.id;
                const score = moduleScores[module.id.toString()];
                return (
                  <li key={module.id}>
                    <div
                      className={`ModuleItem ${isSelected ? "selected" : ""}`}
                      onClick={() => handleModuleClick(module.id)}
                    >
                      <div className="ModuleTitle">
                        {module.title}
                        <div
                          className={
                            completedModules[module.id.toString()]
                              ? "ModuleCompletionIndicator completed"
                              : "ModuleCompletionIndicator"
                          }
                        />
                      </div>
                      {score !== undefined && (
                        <p className="ModuleScore">Score: {score}</p>
                      )}
                      <FaChevronDown
                        className={isExpanded ? "rotate-icon" : ""}
                      />
                    </div>
                    {isExpanded && (
                      <ul className="ModuleSubItems">
                        {module.subItems.map((sub, i) => {
                          const expandedSub =
                            expandedSubItemsMap[module.id] === sub.name;
                          const isSubSelected =
                            selectedSubItemName === sub.name;
                          return (
                            <li key={i}>
                              <div
                                onClick={() =>
                                  handleSubItemClick(module.id, sub.name)
                                }
                                className={
                                  isSubSelected ? "selectedSubItem" : ""
                                }
                              >
                                {sub.name}
                                <FaChevronDown
                                  className={expandedSub ? "rotate-icon" : ""}
                                />
                              </div>
                              {expandedSub &&
                                sub.topics &&
                                sub.topics.length > 0 && (
                                  <ul className="ModuleTopics">
                                    {sub.topics.map((topic, tIndex) => {
                                      const isTopicSelected =
                                        selectedTopicName === topic.name;
                                      const topicDone =
                                        completedTopics[module.id.toString()]?.[
                                          sub.name
                                        ]?.[topic.name];
                                      return (
                                        <li key={tIndex}>
                                          <div
                                            onClick={() =>
                                              handleTopicClick(
                                                module.id,
                                                sub.name,
                                                topic.name
                                              )
                                            }
                                            className={
                                              isTopicSelected
                                                ? "selectedTopic"
                                                : ""
                                            }
                                          >
                                            {topic.name}
                                            {topicDone && (
                                              <span className="TopicDoneIndicator">
                                                ✓
                                              </span>
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
          </aside>

          <main className="ModulePage-contentArea">
            <div className="Breadcrumb">{breadcrumb()}</div>
            <div className="ContentCard">
              {selectedModuleId && (
                <>
                  <h2>{currentModuleDataObj?.title}</h2>

                  {selectedSubItemName === "Practice Section" &&
                  typeof getDisplayContent() === "object" &&
                  getDisplayContent()?.quiz ? (
                    <div className="QuizSection">
                      <div className="AttemptsInfo">
                        Attempts: {attempts} / 3
                      </div>

                      {showInstructions ? (
                        <div className="InstructionsCard">
                          <h3>Instructions</h3>
                          <ul>
                            <li>
                              You must score at least 80% to unlock the next
                              module.
                            </li>
                            <li>
                              If you fail (score below 80%), you have only 3
                              attempts per day.
                            </li>
                            <li>
                              After 3 attempts in one day, the test is disabled
                              until tomorrow.
                            </li>
                            <li>
                              Use your attempts wisely to improve your score.
                            </li>
                          </ul>
                          {/* Disable "Start Test" if attempts >= 3 */}
                          <button
                            onClick={handleStartTest}
                            disabled={isTestDisabled}
                          >
                            Start Test
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* If user has attempts < 3, show the quiz. Otherwise, show a locked message */}
                          {isTestDisabled ? (
                            <div className="LockedMessage">
                              <p>
                                You have reached the maximum attempts for today.
                                Please try again tomorrow.
                              </p>
                            </div>
                          ) : (
                            <>
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
                                            onChange={() =>
                                              handleAnswerChange(i, idx)
                                            }
                                          />
                                          {opt}
                                        </label>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                              <button
                                className="SubmitQuizBtn"
                                onClick={handleSubmitQuiz}
                              >
                                Submit Quiz
                              </button>
                              {currentModuleScore !== null && (
                                <div className="ScoreSection">
                                  <p>
                                    Score: {currentModuleScore} out of{" "}
                                    {getDisplayContent().quiz.length}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="ContentText">{getDisplayContent()}</p>
                  )}
                </>
              )}

              {isAllModulesCompleted && (
                <div className="NextStep">
                  <h2>
                    All modules completed. You have unlocked the next step.
                  </h2>
                  <button className="NextStepBtn">Next Step</button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Chatbot Toggle Button */}
      <div className="ChatbotToggle" onClick={toggleChatbot}>
        <TbMessageChatbot size={40}/>
      </div>

      {/* Chatbot Container */}
      {isChatbotActive && (
        <div className="ChatbotContainer">
          <div className="ChatbotMessages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "user"
                    ? "ChatbotMessage ChatbotUserMessage"
                    : "ChatbotMessage ChatbotBotMessage"
                }
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
            <button onClick={sendMessageToChatbot} className="ChatbotSendBtn">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module;
