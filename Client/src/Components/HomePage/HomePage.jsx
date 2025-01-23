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
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const handelCoursesNavigation = () => {
    navigate("/course");
  };
  return (
    <>
      <div className="homepage-main-container">
        <Navbar_Landingpage />
        <div className="homepage-main-content">
          <div className="homepage-overlayer-text">
            <div className="homepage-overlayer-text-left">
              <h2>Elevate Your BFSI Career with AI-Powered Training</h2>
            </div>
            <div className="homepage-overlayer-text-right">
              <p>
              Upskill and unlock new opportunities in the financial sector with our AI-powered learning platform. 550,000+ professionals trust us to boost their careers. Achieve 3x higher close rates. Transform your sales performance today.
              </p>
              <button onClick={handelCoursesNavigation}>Explore Courses</button>
            </div>
          </div>
        </div>
        <div className="homepage-choose-us-container">
          <div className="homepage-choose-us-reason">
            <h2>Why RevuteAI?</h2>
            <div className="homepage-reasons">
              <div className="homepage-reason">
                <FaLightbulb />
                <h3>Proven success</h3>
                <span className="homepage-horizontal"></span>
                <p>
                  Join over 550,000 people across 130+ countries using
                  VirtualSpeech to upskill themselves.
                </p>
              </div>
              <div className="homepage-reason">
                <FaBookOpen />
                <h3>Learn by doing</h3>
                <span className="homepage-horizontal"></span>
                <p>
                  With over 55 hands-on practice exercises, you'll improve your
                  skills up to 4x faster.
                </p>
              </div>
              <div className="homepage-reason">
                <RiRobot3Fill />
                <h3>AI feedback</h3>
                <span className="homepage-horizontal"></span>
                <p>
                  After each practice session, you'll get AI-powered feedback on
                  areas you need practice.
                </p>
              </div>
              <div className="homepage-reason">
                <IoStatsChartSharp />
                <h3>Boost your career</h3>
                <span className="homepage-horizontal"></span>
                <p>
                  Our accredited courses help you get a promotion and progress
                  as a manager.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="homepage-IntroWhyUs">
          <img src={bgImage} alt="" />
          <div className="homepage-Overlayer2-toWhyUs">
            <h2>Different ways to practice</h2>
            <p>
              Our AI-powered exercises are designed to simulate real-world
              scenarios so you can apply your knowledge in a practical setting.
              Practice these exercises in VR, MR, or online.
            </p>
          </div>
        </div>
        <div className="homepage-learningPath">
          <div className="homepage-learningPath-container">
            <div className="homepage-learningPath-title">
              <h2>The learning journey</h2>
              <p>
                Our blended courses combine e-learning with practice and
                feedback.
              </p>
            </div>
            <div className="homepage-learningPath-cards">
              <div className="homepage-learningPath-card">
                <div className="homepage-cirecular-image-div">
                  <img src={workplaceimg} alt="Workplace Skills" />
                </div>
                <h3>Sales Mastery in BFSI</h3>
                <p>
                Learn effective sales strategies tailored for the Banking, Financial Services, and Insurance sectors.
                </p>
              </div>
              <div className="homepage-learningPath-card">
                <div className="homepage-cirecular-image-div">
                  <img src={practiceing} alt="Practice Learning" />
                </div>
                <h3>BFSI Domain Knowledge</h3>
                <p>
                Gain in-depth understanding of banking products, insurance, and financial services workflows.
                </p>
              </div>
              <div className="homepage-learningPath-card">
                <div className="homepage-cirecular-image-div">
                  <img src={feedbackimg} alt="Instant Feedback" />
                </div>
                <h3>Placement Assistance Program</h3>
                <p>
                Receive resume-building guidance, interview preparation, and placement support with top BFSI companies.
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
              <p className="homepage-footer-company">2025 VirtualSpeech Ltd.</p>
              <p className="homepage-footer-links">Terms | Privacy | Accessibility</p>
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
    </>
  );
};

export default HomePage;
