import React, { useState } from "react";
import "./Elearning.css";
import companyLogo from "../../images/company_logo.jpeg";
import { useNavigate } from "react-router-dom";
import enrollImg from "../../images/enroll.jpg";
import { FaUser } from "react-icons/fa";

const Elearning = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("course");
  const [previewCourse, setPreviewCourse] = useState(null);

  const coursesData = [
    {
      title: "Soft Skills",
      subitems: [
        {
          title: "Grammar",
          subtopics: [
            "Parts of Speech",
            "Tenses",
            "Sentence Structure & Punctuation",
            "Professional vocabulary",
          ],
        },
        {
          title: "Communication",
          subtopics: [
            "Definition and scope of communication",
            "Reading",
            "Writing",
            "Listening",
            "Speaking",
            "Attire",
            "Persuasion Technique",
            "Phone etiquette",
          ],
        },
      ],
    },
    {
      title: "Sales Personal Skills",
      subitems: [
        {
          title: "Introduction to Sales",
          subtopics: ["Sales Vs. Marketing", "Role of a sales-person"],
        },
        {
          title: "Handling Objections",
          subtopics: [
            "Building Rapport and Trust",
            "Customer Pain points and trust indicators",
            "Conflict Resolution",
            "Case studies (By Domain Expert)",
          ],
        },
        {
          title: "Negotiation Skills",
          subtopics: [
            "Emotional Intelligence",
            "Decision making",
            "Value creation",
          ],
        },
        {
          title: "Tools and Framework",
          subtopics: [
            "CRM tool",
            "Lead generation & prospecting techniques",
            "Customer profiling & segmentation",
            "Pipeline management",
            {
              title: "Types of frameworks",
              subtopics: ["AIDA", "SPIN", "BANT"],
            },
          ],
        },
        {
          title: "Problem-Solving & Resilience",
          subtopics: [
            "Syllogisms",
            "Statement and assumptions",
            "Statement and conclusions",
            "Cause and Effect",
            "Case studies",
          ],
        },
        {
          title: "Time management",
          subtopics: [
            "How to: “Set clear goals, Prioritise tasks, plan your day, Eliminate time wasters, Use time management tools.”",
          ],
        },
        {
          title: "Advanced Sales techniques",
          subtopics: [
            "B2B and B2C sales",
            "Post-sale relationship",
            "Strategies for win-win solutions",
          ],
        },
      ],
    },
    {
      title: "Product Knowledge",
      subitems: [
        {
          title: "Foundation to BFSI",
          subtopics: [
            "Bank",
            "Financial Institution",
            "Insurance",
            "Fintech",
            "Regulatory bodies of BFSI",
          ],
        },
        {
          title: "Key instruments of BFSI",
          subtopics: [
            "KYC/ e-KYC form",
            "Account opening form",
            "Securities and Loan processing document",
            "Key terminologies",
            "Interest rates",
          ],
        },
        {
          title: "Products and services of BFSI",
          subtopics: [
            "SB, CB account",
            "Credit card",
            "Fixed Deposit",
            "Recurring Deposit",
            "Personal Loan",
            "Home loan",
            "Gold loan",
            "Auto loan",
            "Crop/ Agriculture loan",
            "Top-up loan",
          ],
        },
      ],
    },
  ];

  // Dummy data for Bot Mock Pitch
  const botMockPitchData = {
    title: "Bot Mock Pitch",
    subitems: [
      {
        title: "Pitching Techniques",
        subtopics: [
          "Understanding the audience",
          "Crafting your message",
          "Engaging the audience",
        ],
      },
      {
        title: "Demo Strategies",
        subtopics: [
          "Setting up the demo",
          "Live demonstration",
          "Handling questions",
        ],
      },
    ],
  };

  // Combine all courses
  const allCourses = [...coursesData, botMockPitchData];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const HandleJoinCoursebtn = () => {
    const userId = localStorage.getItem("userId");
    navigate(`/modules/${userId}`);
  };

  const openPreview = (courseTitle) => {
    const course = allCourses.find(
      (courseItem) => courseItem.title === courseTitle
    );
    setPreviewCourse(course);
  };

  const closePreview = () => {
    setPreviewCourse(null);
  };

  return (
    <div className="learningpage-mainContainer">
      <nav className="learningPage-Navbar">
        <div className="CompanyLogo-Here" onClick={() => navigate("/")}>
          <img src={companyLogo} alt="Company Logo" />
        </div>
        <div className="learningPageNavbar-rightsection">
          <button className="Logout-btn-design" onClick={handleLogout}>
            Logout
          </button>
          <div
            className="learningPageNavbar-circulardiv"
            onClick={() => navigate("/profile")}
          ><FaUser size={20}/></div>
        </div>
      </nav>

      <div className="learningpage-contentArea">
        <div className="learningPage-Uppercontent"></div>
        <div className="learnngPage-Lowercontent"></div>
      </div>

      <div className="learningPage-overFlowcontainer">
        <div className="learningPage-enrollCourseDiv">
          <div className="imagediv-enrollsection">
            <img src={enrollImg} alt="enroll image here" />
          </div>
          <div className="enrolment-details">
            <button className="joinCourse-btn" onClick={HandleJoinCoursebtn}>
              Join this Course
            </button>
            <div className="meta-item">
              <strong>Last Update</strong>
              <p>11/24/2021</p>
            </div>
            <div className="meta-item">
              <strong>Completion Time</strong>
              <p>34 minutes</p>
            </div>
            <div className="meta-item">
              <strong>Members</strong>
              <p>13470</p>
            </div>
            <div className="share-link">Share</div>
          </div>
        </div>

        <div className="learningPage-contentSection">
          <div className="learningPage-content-uppersection">
            <div className="banner-info">
              <h1 className="banner-title">RevuteAI e-Learning</h1>
              <p>
                Explore our well-structured courses that help you acquire good
                communication skills and strong marketing skills.
              </p>
              <div className="banner-stars">
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
                <span>⭐</span>
              </div>
            </div>
          </div>

          <div className="learningPage-content-lowersection">
            <div className="learningpage-toggleEffect">
              <ul className="learningPage-togglelist">
                <li
                  className="learningPage-toggleList-items"
                  onClick={() => setActiveTab("course")}
                >
                  Course
                </li>
                <li
                  className="learningPage-toggleList-items"
                  onClick={() => setActiveTab("reviews")}
                >
                  Reviews
                </li>
                <li
                  className="learningPage-toggleList-items"
                  onClick={() => setActiveTab("forum")}
                >
                  Forum
                </li>
              </ul>
            </div>

            {activeTab === "course" && (
              <div className="lessons-info">
                <div className="learningPage-CourseTimelineSection">
                  <p>eLearning</p>
                  <p>4 Lessons · 340 min</p>
                </div>
                <div className="lesson-row">
                  <div className="lesson-title">Soft Skills</div>
                  <button
                    className="lesson-preview-btn"
                    onClick={() => openPreview("Soft Skills")}
                  >
                    Preview
                  </button>
                  
                </div>
                <div className="lesson-row">
                  <div className="lesson-title">Sales Personal Skills</div>
                  <button
                    className="lesson-preview-btn"
                    onClick={() => openPreview("Sales Personal Skills")}
                  >
                    Preview
                  </button>
                  
                </div>
                <div className="lesson-row">
                  <div className="lesson-title">Product Knowledge</div>
                  <button
                    className="lesson-preview-btn"
                    onClick={() => openPreview("Product Knowledge")}
                  >
                    Preview
                  </button>
                </div>
                <div className="lesson-row">
                  <div className="lesson-title">Bot Mock Pitch</div>
                  <button
                    className="lesson-preview-btn"
                    onClick={() => openPreview("Bot Mock Pitch")}
                  >
                    Preview
                  </button>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="learningPage-reviewContainer">
                This is review:
              </div>
            )}

            {activeTab === "forum" && (
              <div className="learninPage-forumContainer">
                This is a forum container:
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Elegant Modal for course preview */}
      {previewCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{previewCourse.title}</h2>
              <button className="modal-close-btn" onClick={closePreview}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {previewCourse.subitems.map((subitem, idx) => (
                <div key={idx} className="modal-subitem">
                  <h3>{subitem.title}</h3>
                  <ul>
                    {subitem.subtopics.map((subtopic, i) =>
                      typeof subtopic === "string" ? (
                        <li key={i}>{subtopic}</li>
                      ) : (
                        <li key={i}>
                          <strong>{subtopic.title}</strong>
                          <ul>
                            {subtopic.subtopics.map((s, j) => (
                              <li key={j}>{s}</li>
                            ))}
                          </ul>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Elearning;
