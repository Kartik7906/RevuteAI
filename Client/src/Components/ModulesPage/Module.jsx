import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { TbMessageChatbot } from "react-icons/tb"
import { IoChevronBack } from "react-icons/io5"
import { FaChevronDown, FaUser } from "react-icons/fa"
import axios from "axios"
import "./Module.css"
import companyLogo from "../../images/company_logo.jpeg"
import modulesData from "../modulesData"

const Module = () => {
  const navigate = useNavigate()
  const [expandedModuleId, setExpandedModuleId] = useState(null)
  const [expandedSubItemsMap, setExpandedSubItemsMap] = useState({})
  const [selectedModuleId, setSelectedModuleId] = useState(null)
  const [selectedSubItemName, setSelectedSubItemName] = useState("")
  const [selectedTopicName, setSelectedTopicName] = useState("")
  const [completedModules, setCompletedModules] = useState({})
  const [completedSubItems, setCompletedSubItems] = useState({})
  const [completedTopics, setCompletedTopics] = useState({})
  const [subItemAttempts, setSubItemAttempts] = useState({})
  const [subItemScores, setSubItemScores] = useState({})
  const [backendProgress, setBackendProgress] = useState(0)
  const [isAllModulesCompleted, setIsAllModulesCompleted] = useState(false)
  const [userAnswers, setUserAnswers] = useState({})
  const [currentSubItemScore, setCurrentSubItemScore] = useState(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isChatbotActive, setIsChatbotActive] = useState(false)
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [recordingIndex, setRecordingIndex] = useState(null)
  const [supportsSpeech, setSupportsSpeech] = useState(false)
  const [supportsRecognition, setSupportsRecognition] = useState(false)
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const recognition = useRef(null)
  const recordingIndexRef = useRef(recordingIndex)
  const userId = localStorage.getItem("userId")
  const username = localStorage.getItem("username")

  useEffect(() => {
    if (!userId) {
      navigate("/")
      return
    }
    fetchUserProgress()
  }, [userId, navigate, selectedModuleId])

  const fetchUserProgress = async () => {
    try {
      const r = await axios.get(`http://localhost:8000/api/module/${userId}`)
      if (!r.data || !r.data.modules) return
      setBackendProgress(r.data.progress || 0)
      const cm = {}
      const cs = {}
      const ct = {}
      const siAttempts = {}
      const siScores = {}
      r.data.modules.forEach((mod) => {
        cm[mod.moduleId] = !!mod.completed
        if (mod.subItems && mod.subItems.length > 0) {
          cs[mod.moduleId] = {}
          ct[mod.moduleId] = {}
          siAttempts[mod.moduleId] = {}
          siScores[mod.moduleId] = {}
          mod.subItems.forEach((sub) => {
            cs[mod.moduleId][sub.subItemName] = !!sub.completed
            siAttempts[mod.moduleId][sub.subItemName] = sub.attempts || 0
            siScores[mod.moduleId][sub.subItemName] = sub.score
            ct[mod.moduleId][sub.subItemName] = {}
            if (sub.topics && sub.topics.length > 0) {
              sub.topics.forEach((topic) => {
                ct[mod.moduleId][sub.subItemName][topic.topicName] = !!topic.completed
              })
            }
          })
        }
      })
      setCompletedModules(cm)
      setCompletedSubItems(cs)
      setCompletedTopics(ct)
      setSubItemAttempts(siAttempts)
      setSubItemScores(siScores)
      const allDone = modulesData.slice(0, 3).every((m) => cm[m.id.toString()])
      setIsAllModulesCompleted(allDone)
    } catch (e) {}
  }

  const handleModuleClick = (moduleId) => {
    const firstIncomplete = modulesData.find((m) => !completedModules[m.id.toString()] && m.id < moduleId && m.id !== 4)
    if (firstIncomplete && firstIncomplete.id < moduleId) {
      alert("Please complete previous modules first.")
      return
    }
    if (moduleId === 4 && !modulesData.slice(0, 3).every((m) => completedModules[m.id.toString()])) {
      alert("You must complete all previous modules to access BotMock Pitching.")
      return
    }
    setExpandedModuleId((p) => (p === moduleId ? null : moduleId))
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null)
      setSelectedSubItemName("")
      setSelectedTopicName("")
    } else {
      setSelectedModuleId(moduleId)
      setSelectedSubItemName("")
      setSelectedTopicName("")
      setUserAnswers({})
      setCurrentSubItemScore(null)
    }
  }

  const handleSubItemClick = (moduleId, subItemName, skipCheck = false) => {
    const modDef = modulesData.find((m) => m.id === moduleId)
    if (!modDef || !modDef.subItems) return
    const subIndex = modDef.subItems.findIndex((s) => s.name === subItemName)
    if (!skipCheck && subIndex > 0) {
      const prevSub = modDef.subItems[subIndex - 1]
      const done = completedSubItems[moduleId.toString()] && completedSubItems[moduleId.toString()][prevSub.name]
      if (!done) {
        alert("Complete the previous section first.")
        return
      }
    }
    setExpandedSubItemsMap((prev) => {
      const already = prev[moduleId] === subItemName
      return { ...prev, [moduleId]: already ? null : subItemName }
    })
    if (selectedSubItemName === subItemName) {
      setSelectedSubItemName("")
      setSelectedTopicName("")
    } else {
      setSelectedModuleId(moduleId)
      setSelectedSubItemName(subItemName)
      setSelectedTopicName("")
      setUserAnswers({})
      setCurrentSubItemScore(null)
    }
  }

  const handleTopicClick = (moduleId, subItemName, topicName) => {
    setSelectedModuleId(moduleId)
    setSelectedSubItemName(subItemName)
    setSelectedTopicName(topicName)
    setUserAnswers({})
    setCurrentSubItemScore(null)
  }

  const handleMarkTopicCompleted = async (moduleId, subItemName, topicName) => {
    try {
      await axios.post(`http://localhost:8000/api/module/${userId}/completeTopic`, {
        moduleId: moduleId.toString(),
        subItemName,
        topicName,
        username
      })
      fetchUserProgress()
    } catch (e) {}
  }

  const getDisplayContent = () => {
    const m = modulesData.find((x) => x.id === selectedModuleId)
    if (!m) return ""
    if (!selectedSubItemName) return m.moduleContent
    const s = m.subItems.find((x) => x.name === selectedSubItemName)
    if (!s) return m.moduleContent
    if (selectedTopicName && s.topics) {
      const t = s.topics.find((x) => x.name === selectedTopicName)
      return t ? t.content : s.content
    }
    return s.content
  }

  const breadcrumb = () => {
    const m = modulesData.find((x) => x.id === selectedModuleId)
    if (!m) return ""
    let path = m.title
    if (selectedSubItemName) path += " >> " + selectedSubItemName
    if (selectedTopicName) path += " >> " + selectedTopicName
    return path
  }

  const isTestSubItem = (name) => name.toLowerCase().includes("test")

  const handleAnswerChange = (qIndex, value) => {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: value }))
  }

  const isAnswerMissing = (q, i) => {
    if (q.options) return userAnswers[i] === undefined
    return !userAnswers[i] || userAnswers[i].trim() === ""
  }

  const handleSubmitQuiz = async () => {
    if (isSubmittingQuiz) return
    setIsSubmittingQuiz(true)
    setRecordingIndex(null)
    window.speechSynthesis.cancel()
    const content = getDisplayContent()
    if (!content || !Array.isArray(content.quiz) || content.quiz.length === 0) {
      setIsSubmittingQuiz(false)
      return
    }
    const answers = content.quiz.map((_, i) => userAnswers[i] || "")
    try {
      const p = {
        moduleId: selectedModuleId,
        subItemName: selectedSubItemName,
        userAnswers: answers,
        username
      }
      const r = await axios.post(`http://localhost:8000/api/module/${userId}/submitScore`, p)
      if (r.data.error) {
        alert(r.data.error)
      } else {
        await fetchUserProgress()
        const m = modulesData.find((x) => x.id === selectedModuleId)
        if (m && r.data.passed) {
          const idx = m.subItems.findIndex((s) => s.name === selectedSubItemName)
          if (idx < m.subItems.length - 1) {
            const n = m.subItems[idx + 1]
            handleSubItemClick(selectedModuleId, n.name, true)
          } else {
            const nm = modulesData.find((x) => x.id === selectedModuleId + 1)
            if (nm) handleModuleClick(nm.id)
          }
        }
      }
    } catch (e) {
      alert(e.response?.data?.error || "Failed to submit quiz. Please try again.")
    }
    setIsSubmittingQuiz(false)
  }

  useEffect(() => {
    if (selectedSubItemName && isTestSubItem(selectedSubItemName)) {
      setShowInstructions(true)
    } else {
      setShowInstructions(false)
    }
  }, [selectedSubItemName])

  const handleStartTest = () => {
    setShowInstructions(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate("/")
  }

  const toggleChatbot = () => {
    setIsChatbotActive(!isChatbotActive)
  }

  const sendMessageToChatbot = async () => {
    if (!chatInput.trim()) return
    const msg = { text: chatInput, sender: "user" }
    const updated = [...messages, msg]
    setMessages(updated)
    try {
      const r = await axios.post("http://localhost:8000/api/chat", { userMessage: chatInput })
      const botRes = { text: r.data.botReply, sender: "bot" }
      setMessages([...updated, botRes])
    } catch (e) {}
    setChatInput("")
  }

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      recognition.current = new SR()
      recognition.current.continuous = false
      recognition.current.interimResults = true
      recognition.current.lang = "en-US"
      recognition.current.onerror = () => {
        setRecordingIndex(null)
        alert("Speech recognition failed. Please type your answer.")
      }
    }
  }, [])

  useEffect(() => {
    setSupportsSpeech("speechSynthesis" in window)
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setSupportsRecognition(!!SR)
    if (SR) {
      recognition.current = new SR()
      recognition.current.continuous = false
      recognition.current.interimResults = true
      recognition.current.lang = "en-US"
      recognition.current.onresult = (e) => {
        const tr = Array.from(e.results).map((r) => r[0].transcript).join("")
        if (recordingIndexRef.current !== null) handleAnswerChange(recordingIndexRef.current, tr)
      }
      recognition.current.onerror = () => {
        setRecordingIndex(null)
      }
      recognition.current.onend = () => {
        if (recordingIndexRef.current !== null) recognition.current.start()
      }
    }
    return () => {
      if (recognition.current) recognition.current.stop()
    }
  }, [])

  useEffect(() => {
    recordingIndexRef.current = recordingIndex
  }, [recordingIndex])

  const speakQuestion = (text) => {
    if (supportsSpeech) {
      const u = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(u)
    }
  }

  const toggleRecording = (index) => {
    if (recordingIndex === index) {
      setRecordingIndex(null)
      recognition.current?.stop()
    } else {
      setRecordingIndex(index)
      recognition.current?.start()
    }
  }

  const modDef = modulesData.find((m) => m.id === selectedModuleId)
  const subItemDef = modDef?.subItems?.find((s) => s.name === selectedSubItemName)
  const isTest = subItemDef && isTestSubItem(subItemDef.name)
  const testContent = isTest ? getDisplayContent() : null
  const currentAttempts = subItemAttempts[selectedModuleId?.toString()]?.[selectedSubItemName] || 0
  const isTestLocked = currentAttempts >= 3
  const isTestAlreadyDone = completedSubItems[selectedModuleId?.toString()]?.[selectedSubItemName]

  return (
    <div className="ModulePage-MainContainer">
      <div className="ModulePage-elements">
        <nav className="ModulePage-Navbar">
          <div className="CompanyLogo-Container" onClick={() => navigate("/")}>
            <img src={companyLogo} alt="Company Logo" />
          </div>
          <div className="Navbar-rightSection">
            <button className="Logout-btn" onClick={handleLogout}>Logout</button>
            <div className="UserAvatar" onClick={() => navigate("/profile")}>
              <FaUser size={20} />
            </div>
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
                const expanded = expandedModuleId === mod.id
                const selected = selectedModuleId === mod.id
                return (
                  <li key={mod.id}>
                    <div className={`ModuleItem ${selected ? "selected" : ""}`} onClick={() => handleModuleClick(mod.id)}>
                      <div className="ModuleTitle">
                        {mod.title}
                        <div className={completedModules[mod.id.toString()] ? "ModuleCompletionIndicator completed" : "ModuleCompletionIndicator"} />
                      </div>
                      <FaChevronDown className={expanded ? "rotate-icon" : ""} />
                    </div>
                    {expanded && mod.subItems && (
                      <ul className="ModuleSubItems">
                        {mod.subItems.map((sub, idx) => {
                          const isExp = expandedSubItemsMap[mod.id] === sub.name
                          const subSelected = selectedSubItemName === sub.name
                          return (
                            <li key={idx}>
                              <div onClick={() => handleSubItemClick(mod.id, sub.name)} className={subSelected ? "selectedSubItem" : ""}>
                                {sub.name}
                                <FaChevronDown className={isExp ? "rotate-icon" : ""} />
                              </div>
                              {isExp && sub.topics && (
                                <ul className="ModuleTopics">
                                  {sub.topics.map((top, tIndex) => {
                                    const tSelected = selectedTopicName === top.name
                                    const done = completedTopics[mod.id.toString()]?.[sub.name]?.[top.name]
                                    return (
                                      <li key={tIndex}>
                                        <div onClick={() => handleTopicClick(mod.id, sub.name, top.name)} className={tSelected ? "selectedTopic" : ""}>
                                          {top.name}
                                          {done && <span className="TopicDoneIndicator">✓</span>}
                                        </div>
                                        {!done && (
                                          <button className="MarkCompletedBtn" onClick={(e) => {
                                            e.stopPropagation()
                                            handleMarkTopicCompleted(mod.id, sub.name, top.name)
                                          }}>
                                            Mark as Completed
                                          </button>
                                        )}
                                      </li>
                                    )
                                  })}
                                </ul>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
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
                        <p>You have already completed this test.</p>
                        <p>Your Score: {subItemScores[selectedModuleId.toString()]?.[selectedSubItemName] ?? "N/A"}</p>
                      </div>
                    ) : showInstructions ? (
                      <div className="InstructionsCard">
                        <h3>Instructions</h3>
                        <ul>
                          <li>Answer all questions to proceed.</li>
                          <li>You only have 3 attempts per day to pass.</li>
                          <li>If you fail all 3 attempts, the test is locked until tomorrow.</li>
                        </ul>
                        <button onClick={handleStartTest} disabled={isTestLocked}>Start Test</button>
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
                            <p><strong>Q{i + 1}:</strong> {q.question}
                              {supportsSpeech && (
                                <button className="PlayButton" onClick={() => speakQuestion(q.question)} title="Play question">
                                  ▶️
                                </button>
                              )}
                            </p>
                            {q.options ? (
                              <ul>
                                {q.options.map((opt, idx) => (
                                  <li key={idx}>
                                    <label>
                                      <input type="radio" name={`question-${i}`} value={idx} checked={userAnswers[i] === idx} onChange={() => handleAnswerChange(i, idx)} />
                                      {opt}
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="SpeechSection">
                                {supportsRecognition && (
                                  <button className={`RecordButton ${recordingIndex === i ? "recording" : ""}`} onClick={() => toggleRecording(i)}>
                                    {recordingIndex === i ? "⏹ Stop Recording" : "⏺ Record Answer"}
                                  </button>
                                )}
                                <input type="text" value={userAnswers[i] || ""} onChange={(e) => handleAnswerChange(i, e.target.value)} placeholder="Speak or type your answer..." className="AnswerInput" />
                                <p className="TranscriptDisplay">{userAnswers[i] ? `Transcript: ${userAnswers[i]}` : ""}</p>
                                {!supportsRecognition && <p className="BrowserWarning">Note: Speech recognition is not supported in your browser</p>}
                              </div>
                            )}
                          </div>
                        ))}
                        <button className="SubmitQuizBtn" onClick={handleSubmitQuiz} disabled={isSubmittingQuiz || (testContent && testContent.quiz.some((q, i) => isAnswerMissing(q, i)))}>
                          {isSubmittingQuiz ? "Submitting..." : "Submit Quiz"}
                        </button>
                        {subItemScores[selectedModuleId?.toString()]?.[selectedSubItemName] != null && (
                          <div className="ScoreSection">
                            <p>Score: {subItemScores[selectedModuleId][selectedSubItemName]} / {testContent.quiz.length}</p>
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
                  <button className="NextStepBtn" onClick={() => handleModuleClick(4)}>
                    Go to BotMock Pitching
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <div className="ChatbotToggle" onClick={toggleChatbot}>
        <TbMessageChatbot size={30} />
      </div>
      {isChatbotActive && (
        <div className="ChatbotContainer">
          <div className="ChatbotMessages">
            {messages.map((msg, i) => (
              <div key={i} className={msg.sender === "user" ? "ChatbotMessage ChatbotUserMessage" : "ChatbotMessage ChatbotBotMessage"}>
                <p className="ChatbotMessageText">{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="ChatbotInputArea">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type your message..." className="ChatbotInput" />
            <button onClick={sendMessageToChatbot} className="ChatbotSendBtn">Send</button>
          </div>
        </div>
      )}
    </div>
  )
}
export default Module
