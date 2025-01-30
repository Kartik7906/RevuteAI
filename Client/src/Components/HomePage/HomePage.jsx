import React, { useEffect, useState } from "react";
import Navbar_Landingpage from "../Navbar_landingPage/Navbar_Landingpage";
import feedbackimg from "../../images/feedback.jpg";
import practiceing from "../../images/Practice.jpg";
import workplaceimg from "../../images/workplace.jpg";
import videoclip from "../../images/videoClip.gif";
import "./HomePage.css";
import { FaLightbulb, FaBookOpen } from "react-icons/fa";
import { RiRobot3Fill } from "react-icons/ri";
import { IoStatsChartSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";

const HomePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const serviceId = "service_e3wphqs";
    const templateId = "template_m8ao98k";
    const userId = "7YcnQZuizCdA4HVeN";

    emailjs
      .send(serviceId, templateId, formData, userId)
      .then(() => {
        alert("Your message has been sent successfully!");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      })
      .catch((error) => {
        console.error("Failed to send the message", error);
        alert("Failed to send the message. Please try again.");
      });
  };

  const texts = [
    "Product Knowledge",
    "Soft Skills",
    "Lead Conversion Strategies",
  ];
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const typingSpeed = 150;
  const deletingSpeed = 100;
  const pauseTime = 2000;

  const handleCoursesNavigation = () => {
    navigate("/requestdemo");
  };

  useEffect(() => {
    let typingTimer;

    const handleTyping = () => {
      const currentText = texts[index];
      if (isDeleting) {
        setDisplayText(currentText.substring(0, displayText.length - 1));
        if (displayText.length === 0) {
          setIsDeleting(false);
          setIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }
      } else {
        setDisplayText(currentText.substring(0, displayText.length + 1));
        if (displayText.length === currentText.length) {
          typingTimer = setTimeout(() => setIsDeleting(true), pauseTime);
          return;
        }
      }
      typingTimer = setTimeout(
        handleTyping,
        isDeleting ? deletingSpeed : typingSpeed
      );
    };

    typingTimer = setTimeout(
      handleTyping,
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(typingTimer);
  }, [displayText, isDeleting, texts, index]);

  const handleLearnmore = () => {
    navigate("/learnmore");
  };

  useEffect(() => {
    if (location.hash === '#footer') {
      const footerElement = document.getElementById('footer');
      if (footerElement) {
        footerElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="homepage-main-container">
      <Navbar_Landingpage />
      <div className="homepage-main-content">
        <div className="homepage-overlayer-text-left">
          <h2>
            Elevate Your Sales Team Performance with{" "}
            <span className="animated-text">{displayText}</span>
            <span className="cursor">|</span>
          </h2>
        </div>
        <div className="homepage-overlayer-text-right">
          <p>
            Boost your lead conversion rate with AI-powered training and achieve
            3x higher close rates.
          </p>
          <button onClick={handleCoursesNavigation}>Book a Demo</button>
        </div>
      </div>

      <div className="homepage-roleplay-section">
        <div className="homepage-roleplay-image">
          <img src={videoclip} alt="AI-Powered Roleplays" />
        </div>

        {/* Right Side - Text */}
        <div className="homepage-roleplay-text">
          <h2>AI-Powered Roleplays</h2>
          <p>
            Enable your team to practice every sales blocker scenarios,
            Objection handling, and negotiation with our AI Agent.
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
                With over 100+ real-time scenarios, accelerate your skilling 4x
                faster.
              </p>
            </div>
            <div className="homepage-reason">
              <RiRobot3Fill className="homepage-icon" />
              <h3>AI Feedback</h3>
              <span className="homepage-horizontal"></span>
              <p>
                After each practice session, Get AI-powered feedback on
                areas you need to practice.
              </p>
            </div>
            <div className="homepage-reason">
              <IoStatsChartSharp className="homepage-icon" />
              <h3>Multilingual</h3>
              <span className="homepage-horizontal"></span>
              <p>Practice in 12+ Indian languages.</p>
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
              <h3>Learn On demand skills</h3>
              <p>
                Learn soft skills, communication, product knowledge and
                effective sales strategies.
              </p>
            </div>
            <div className="homepage-learningPath-card">
              <div className="homepage-circular-image-div">
                <img src={practiceing} alt="Practice Learning" />
              </div>
              <h3>Practice what you learn</h3>
              <p>Apply your learning with AI Agents for practice exercises</p>
            </div>
            <div className="homepage-learningPath-card">
              <div className="homepage-circular-image-div">
                <img src={feedbackimg} alt="Instant Feedback" />
              </div>
              <h3>Get instant feedback</h3>
              <p>
                Receive instant feedback after each practice session so you can
                easily identify areas of improvement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* footer start from here: */}
      <div className="homepage-footer-homePage">
  <div className="homepage-footer-wrapper">
    <div className="homepage-footer-top">
      <div className="homepage-footer-column">
        <h3>PLATFORM</h3>
        <ul>
        <li>Enterprise</li>
          <li>AI Roleplays</li>
          <li>Book a demo</li>
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
      <div className="contact-form-section" id="footer">
        <h3>Contact Us</h3>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <textarea
              id="message"
              name="message"
              placeholder="Write your message here"
              value={formData.message}
              onChange={handleChange}
              required
              rows="4"
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">
            Send Message
          </button>
        </form>
      </div>
    </div>
    <div className="homepage-footer-bottom">
      <p className="homepage-footer-company">2025 RevuteAI Ltd.</p>
      <p className="homepage-footer-links">
        Terms | Privacy | Accessibility
      </p>
      <div className="homepage-footer-social">
          contact@revuteai.com
      </div>
    </div>
  </div>
</div>


      {/* footer ends here */}
    </div>
  );
};

export default HomePage;
