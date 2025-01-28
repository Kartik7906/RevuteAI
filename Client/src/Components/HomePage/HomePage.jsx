// src/components/HomePage/HomePage.jsx
import React, { useEffect, useState } from "react";
import Navbar_Landingpage from "../Navbar_landingPage/Navbar_Landingpage";
import bgImage from "../../images/backgroundForintro.jpg";
import feedbackimg from "../../images/feedback.jpg";
import practiceing from "../../images/Practice.jpg";
import workplaceimg from "../../images/workplace.jpg";
import thumbnail_img from "../../images/7536311.jpg";
import "./HomePage.css";
import { FaLightbulb, FaBookOpen } from "react-icons/fa";
import { RiRobot3Fill } from "react-icons/ri";
import { IoStatsChartSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();

  const [index, setIndex] = useState(0);
  const texts = ["Product Knowledge", "Soft Skills"];

  const handleCoursesNavigation = () => {
    navigate("/demo");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 3000); // Change text every 3 seconds
    return () => clearInterval(interval);
  }, [texts.length]);

  const handleLearnmore = () => {
    navigate("/learnmore");
  };
  
  return (
    <div className="homepage-main-container">
      <Navbar_Landingpage />
      <div className="homepage-main-content">
        <motion.div
          className="homepage-overlayer-text"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="homepage-overlayer-text-left">
            <h2>
              Elevate Your Sales Performance with{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={texts[index]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8 }}
                  className="animated-text"
                >
                  {texts[index]}
                </motion.span>
              </AnimatePresence>
            </h2>
          </div>
          <div className="homepage-overlayer-text-right">
            <p>
              Boost your lead conversion rate with AI-powered training and
              achieve 3x higher close rates.
            </p>
            <button onClick={handleCoursesNavigation}>Book a Demo</button>
          </div>
        </motion.div>
      </div>

      <div className="homepage-roleplay-section">
        {/* Left Side - Image */}
        <div className="homepage-roleplay-image">
          <img
            src={thumbnail_img} // Ensure this path is correct
            alt="AI-Powered Roleplays"
          />
        </div>

        {/* Right Side - Text */}
        <div className="homepage-roleplay-text">
          <h2>AI-Powered Roleplays</h2>
          <p>
            Enable your team to practice every sales blocker scenario,
            rejection, and negotiation with our AI Agent.
          </p>
          <button onClick={handleLearnmore} className="homepage-learn-more-btn">
            Learn More
          </button>
        </div>
      </div>

      <div className="homepage-choose-us-container">
        <div className="homepage-choose-us-reason">
          <h2>Why RevuteAI?</h2>
          <div className="homepage-reasons">
            <div className="homepage-reason">
              <FaBookOpen className="homepage-icon" />
              <h3>Learn by Doing</h3>
              <span className="homepage-horizontal"></span>
              <p>
              With over 100+ real-time scenarios, you will improve your skills up to 4x faster.
              </p>
            </div>
            <div className="homepage-reason">
              <RiRobot3Fill className="homepage-icon" />
              <h3>AI Feedback</h3>
              <span className="homepage-horizontal"></span>
              <p>
                After each practice session, you'll get AI-powered feedback on
                areas you need to practice.
              </p>
            </div>
            <div className="homepage-reason">
              <IoStatsChartSharp className="homepage-icon" />
              <h3>Multilingual</h3>
              <span className="homepage-horizontal"></span>
              <p>
               Practice in various Indian languages.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="homepage-learningPath">
        <div className="homepage-learningPath-container">
          <div className="homepage-learningPath-title">
            <h2>The Learning Journey</h2>
            <p>
              Our blended courses combine e-learning with practice and feedback.
            </p>
          </div>
          <div className="homepage-learningPath-cards">
            <div className="homepage-learningPath-card">
              <div className="homepage-circular-image-div">
                <img src={workplaceimg} alt="Workplace Skills" />
              </div>
              <h3>Learn workplace skills</h3>
              <p>
               Learn soft skills, communication, product knowledge and effective sales strategies.
              </p>
            </div>
            <div className="homepage-learningPath-card">
              <div className="homepage-circular-image-div">
                <img src={practiceing} alt="Practice Learning" />
              </div>
              <h3>Practice what you learn</h3>
              <p>
              Apply your learning with AI Agents for practice exercises
              </p>
            </div>
            <div className="homepage-learningPath-card">
              <div className="homepage-circular-image-div">
                <img src={feedbackimg} alt="Instant Feedback" />
              </div>
              <h3>Get instant feedback</h3>
              <p>
              Receive instant feedback after each practice session so you can easily identify areas to improve.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="homepage-footer-homePage">
        <div className="homepage-footer-wrapper">
          <div className="homepage-footer-top">
            <div className="homepage-footer-column">
              <h3>PLATFORM</h3>
              <ul>
                <li>AI Roleplays</li>
                <li>Roleplay Studio</li>
                <li>All Practice Exercises</li>
                <li>Pricing</li>
                <li>Skill Assessment</li>
              </ul>
            </div>
            <div className="homepage-footer-column">
              <h3>RESOURCES</h3>
              <ul>
                <li>Blog</li>
                <li>Case Studies</li>
                <li>Webinars</li>
              </ul>
            </div>
            <div className="homepage-footer-column">
              <h3>LINKS</h3>
              <ul>
                <li>Contact</li>
                <li>About Us</li>
                <li>Affiliates</li>
                <li>Referral Scheme</li>
                <li>Newsletter</li>
              </ul>
            </div>
            <div className="homepage-footer-column">
              <h3>SUPPORT</h3>
              <ul>
                <li>Help Center</li>
                <li>Platform Video Tour</li>
                <li>VR Features</li>
                <li>VR App Guide</li>
                <li>Supported VR Headsets</li>
              </ul>
            </div>
          </div>
          <div className="homepage-footer-bottom">
            <p className="homepage-footer-company">2025 RevuteAI Ltd.</p>
            <p className="homepage-footer-links">
              Terms | Privacy | Accessibility
            </p>
            <div className="homepage-footer-social">
              <i className="fab fa-facebook-f">F</i>
              <i className="fab fa-x-twitter">X</i>
              <i className="fab fa-youtube">Y</i>
              <i className="fab fa-linkedin-in">in</i>
              <i className="fab fa-tiktok">T</i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
