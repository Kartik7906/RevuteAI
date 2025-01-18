import React from "react";
import Navbar_Landingpage from "../Navbar_landingPage/Navbar_Landingpage";
import bgImage from "../../images/backgroundForintro.jpg";
import feedbackimg from "../../images/feedback.jpg";
import practiceing from "../../images/Practice.jpg";
import workplaceimg from "../../images/workplace.jpg";
import "./HomePage.css";
import { FaLightbulb } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { RiRobot3Fill } from "react-icons/ri";
import { IoStatsChartSharp } from "react-icons/io5";

const HomePage = () => {
  return (
    <>
      <div className="main-container">
        <Navbar_Landingpage />
        <div className="main-content">
          <div className="overlayer-text">
            <div className="overlayer-text-left">
              <h2>Immersive Soft Skills Training</h2>
            </div>
            <div className="overlayer-text-right">
              <p>
                Join 550,000+ professionals and boost your career with
                AI-powered training on public speaking, leadership, sales, and
                more.
              </p>
              <button>Let's Chat</button>
            </div>
          </div>
        </div>
        <div className="choose-us-container">
          <div className="choose-us-reason">
            <h2>Why RevuteAI?</h2>
            <div className="reasons">
              <div className="reason">
                <FaLightbulb />
                <h3>Proven success</h3>
                <span className="horizontal"></span>
                <p>
                  Join over 550,000 people across 130+ countries using
                  VirtualSpeech to upskill themselves.
                </p>
              </div>
              <div className="reason">
                <FaBookOpen />
                <h3>Learn by doing</h3>
                <span className="horizontal"></span>
                <p>
                  With over 55 hands-on practice exercises, you'll improve your
                  skills up to 4x faster.
                </p>
              </div>
              <div className="reason">
                <RiRobot3Fill />
                <h3>AI feedback</h3>
                <span className="horizontal"></span>
                <p>
                  After each practice session, you'll get AI-powered feedback on
                  areas you need practice.
                </p>
              </div>
              <div className="reason">
                <IoStatsChartSharp />
                <h3>Boost your career</h3>
                <span className="horizontal"></span>
                <p>
                  Our accredited courses help you get a promotion and progress
                  as a manager.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="IntroWhyUs">
          <img src={bgImage} alt="" />
          <div className="Overlayer2-toWhyUs">
            <h2>Different ways to practice</h2>
            <p>
              Our AI-powered exercises are designed to simulate real-world
              scenarios so you can apply your knowledge in a practical setting.
              Practice these exercises in VR, MR, or online.
            </p>
          </div>
        </div>
        <div className="learningPath">
          <div className="learningPath-container">
            <div className="learningPath-title">
              <h2>The learning journey</h2>
              <p>
                Our blended courses combine e-learning with practice and
                feedback.
              </p>
            </div>
            <div className="learningPath-cards">
              <div className="learningPath-card">
                <div className="cirecular-image-div">
                  <img src={workplaceimg} alt="Workplace Skills" />
                </div>
                <h3>Learn workplace skills</h3>
                <p>
                  Courses on presentation skills, leadership, sales, and more.
                  These teach you fundamental workplace skills.
                </p>
              </div>
              <div className="learningPath-card">
                <div className="cirecular-image-div">
                  <img src={practiceing} alt="Practice Learning" />
                </div>
                <h3>Practice what you learn</h3>
                <p>
                  Apply your learning with AI-powered practice exercises, either
                  online or in VR/MR.
                </p>
              </div>
              <div className="learningPath-card">
                <div className="cirecular-image-div">
                  <img src={feedbackimg} alt="Instant Feedback" />
                </div>
                <h3>Get instant feedback</h3>
                <p>
                  Receive instant feedback after each practice session so you
                  can easily identify areas to improve.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-homePage">
          <div className="footer-wrapper">
            <div className="footer-top">
              <div className="footer-column">
                <h3>PLATFORM</h3>
                <ul>
                  <li>AI Roleplays</li>
                  <li>Roleplay Studio</li>
                  <li>All Practice Exercises</li>
                  <li>Pricing</li>
                  <li>Skill Assessment</li>
                </ul>
              </div>
              <div className="footer-column">
                <h3>RESOURCES</h3>
                <ul>
                  <li>Blog</li>
                  <li>Case Studies</li>
                  <li>Webinars</li>
                </ul>
              </div>
              <div className="footer-column">
                <h3>LINKS</h3>
                <ul>
                  <li>Contact</li>
                  <li>About Us</li>
                  <li>Affiliates</li>
                  <li>Referral Scheme</li>
                  <li>Newsletter</li>
                </ul>
              </div>
              <div className="footer-column">
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
            <div className="footer-bottom">
              <p className="footer-company">2025 VirtualSpeech Ltd.</p>
              <p className="footer-links">Terms | Privacy | Accessibility</p>
              <div className="footer-social">
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
    </>
  );
};

export default HomePage;
