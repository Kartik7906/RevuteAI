import React, { useState, useEffect } from "react";
import "./Education.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import EducationNavbar from "./EducationNavbar";
import EducationSidebar from "./EducationSidebar";
import testData from "../TestData";

const Education = () => {
  const [currentDay, setCurrentDay] = useState(() => {
    const savedDay = localStorage.getItem("currentDay");
    return savedDay ? JSON.parse(savedDay) : 1;
  });
  const [scores, setScores] = useState(() => {
    const savedScores = localStorage.getItem("scores");
    return savedScores ? JSON.parse(savedScores) : Array(7).fill(0);
  });
  const [openDays, setOpenDays] = useState(() => {
    const savedOpen = localStorage.getItem("openDays");
    return savedOpen ? JSON.parse(savedOpen) : Array(7).fill(false);
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("currentDay", JSON.stringify(currentDay));
  }, [currentDay]);

  useEffect(() => {
    localStorage.setItem("scores", JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem("openDays", JSON.stringify(openDays));
  }, [openDays]);

  const content = testData;

  const handleQuizSubmission = (day, selectedAnswers) => {
    const quiz = content[day - 1].quiz;
    const correctAnswers = quiz.map((q) => q.answer);
    let correctCount = 0;

    selectedAnswers.forEach((answer, index) => {
      if (answer === correctAnswers[index]) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / quiz.length) * 100);

    if (scorePercentage >= 80) {
      alert(
        `🎉 Congratulations! You scored ${scorePercentage}%. You passed Day ${day} quiz.`
      );
      const newScores = [...scores];
      newScores[day - 1] = scorePercentage;
      setScores(newScores);
      setCurrentDay(day + 1);
      setOpenDays((prev) => {
        const updated = [...prev];
        updated[day] = true; // Unlock the next day
        return updated;
      });
    } else {
      alert(
        `❌ You scored ${scorePercentage}%. You need at least 80% to pass. Please try again.`
      );
    }
  };

  const toggleDay = (day) => {
    if (openDays[day - 1] || day === currentDay) {
      setOpenDays((prev) => {
        const updated = [...prev];
        updated[day - 1] = !updated[day - 1];
        return updated;
      });
    }
  };

  const allDaysCompleted = scores.every((score) => score >= 80);

  return (
    <div className="education-page">
      <EducationNavbar />
      <EducationSidebar scores={scores} currentDay={currentDay} />
      <main className="education-content">
        {/* Interactive Banner */}
        <section className="interactive-banner">
          <h1>Welcome to Your BFSI Learning Journey</h1>
          <p>
            Unlock each step by completing daily tasks and quizzes to advance
            your professional knowledge.
          </p>
          {currentDay === 1 && (
            <button
              className="unlock-button"
              onClick={() =>
                setOpenDays((prev) => {
                  const updated = [...prev];
                  updated[0] = true;
                  return updated;
                })
              }
            >
              Unlock Your First Step
            </button>
          )}
        </section>

        {/* 7-Day Learning Journey */}
        <div className="education-days-container">
          {content.map((dayContent) => {
            const day = dayContent.day;
            const score = scores[day - 1];
            const isCompleted = score >= 80;
            const isActive = currentDay === day;
            const isLocked = day > currentDay;
            const isOpen = openDays[day - 1];

            return (
              <section
                key={day}
                className={`education-day-section ${
                  isActive
                    ? "education-active"
                    : isCompleted
                    ? "education-completed"
                    : "education-locked"
                }`}
                id={`day${day}`}
                aria-labelledby={`day${day}-heading`}
              >
                <div
                  className="education-day-header clickable"
                  onClick={() => toggleDay(day)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") toggleDay(day);
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`day${day}-content`}
                >
                  <h2 id={`day${day}-heading`}>Day {day}</h2>
                  <div className="education-progressbar">
                    <CircularProgressbar
                      value={score}
                      text={`${score}%`}
                      styles={buildStyles({
                        textColor: "#2c3e50",
                        pathColor:
                          score >= 80
                            ? "#28a745"
                            : score > 0
                            ? "#dc3545"
                            : "#007bff",
                        trailColor: "#d6d6d6",
                      })}
                      aria-label={`Progress: ${score}%`}
                    />
                  </div>
                </div>
                <div
                  id={`day${day}-content`}
                  className={`collapsible-content ${isOpen ? "open" : ""}`}
                >
                  {isActive ? (
                    <div className="education-content-section">
                      <article className="education-article">
                        {dayContent.article}
                      </article>
                      <div className="education-quiz-section">
                        <h3 className="quiz-heading">Quiz</h3>
                        {dayContent.quiz.map((q, idx) => (
                          <div key={idx} className="education-quiz-question">
                            <p className="quiz-question">{q.question}</p>
                            <div className="education-options">
                              {q.options.map((option, optIdx) => (
                                <label
                                  key={optIdx}
                                  className="education-option-label"
                                  htmlFor={`day${day}-q${idx}-option${optIdx}`}
                                >
                                  <input
                                    type="radio"
                                    id={`day${day}-q${idx}-option${optIdx}`}
                                    name={`day${day}-q${idx}`}
                                    value={optIdx}
                                  />
                                  {option}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button
                          className="education-submit-button"
                          onClick={() => {
                            const selectedAnswers = dayContent.quiz.map(
                              (_, idx) => {
                                const radios = document.getElementsByName(
                                  `day${day}-q${idx}`
                                );
                                let selectedValue = null;
                                radios.forEach((radio) => {
                                  if (radio.checked)
                                    selectedValue = parseInt(radio.value);
                                });
                                return selectedValue;
                              }
                            );

                            if (selectedAnswers.some((ans) => ans === null)) {
                              alert(
                                "Please answer all questions before submitting."
                              );
                              return;
                            }

                            handleQuizSubmission(day, selectedAnswers);
                          }}
                        >
                          Submit Quiz
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="education-status-message">
                      {isCompleted
                        ? "✅ Great job! Quiz completed successfully."
                        : isLocked
                        ? "🔒 Locked until previous quiz is passed."
                        : "🔓 Click to open."}
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Completion Section */}
        {allDaysCompleted && (
          <section className="completion-section">
            <h2>Congratulations! You’ve unlocked a new feature.</h2>
            <p>
              Now you are ready to introduce yourself. If you're ready, click
              below to proceed.
            </p>
            <button className="cta-button" onClick={() => navigate("/task1")}>
              Proceed to Task 1
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default Education;
