// LearnMore.js
import React from "react";
import {
  FaPhone,
  FaHandshake,
  FaLightbulb,
  FaComments,
  FaBriefcase,
} from "react-icons/fa";
import "./LearnMore.css";
import simulationImage from "../../images/simulationimage.webp";
import personalizationImage from "../../images/personalization.jpg";
import insightsImage from "../../images/insights.avif";
import workplace from "../../images/workplace.jpeg";
import multilingula from "../../images/practice.jpeg"
import feedback from "../../images/feedback.jpeg"
import { useEffect } from "react";

const LearnMore = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="learn-more-wrapper">
        {/* Hero Section */}
        <section className="learn-more-hero">
          <h1 className="hero-title">Practice with our AI Agent</h1>
          <p className="hero-description">
            Enable your team to practice every sales blocker scenarios,
            Objection handling, and negotiation with our AI Agent.
          </p>
        </section>

        {/* Learn More Section */}
        <section className="learn-more-container">
          <h1 className="learn-more-heading">
            Why use AI for mastering Sales?
          </h1>
          <div className="learn-more-content">
            {[
              {
                image: simulationImage,
                title: "Simulation of Live Scenario",
                description:
                  "We create a live scenario to practice a free-flow conversation with our AI agent.",
              },
              {
                image: personalizationImage,
                title: "Personalization",
                description:
                  "AI agents create a more personalized and engaging learning experience.",
              },
              {
                image: insightsImage,
                title: "Insights",
                description:
                  "Real-time feedback to accelerate learning and identify areas that need improvement.",
              },
            ].map((card, index) => (
              <div className="learn-more-card" key={index}>
                <div className="learn-more-image-container">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="learn-more-image"
                  />
                </div>
                <h2 className="learn-more-card-title">{card.title}</h2>
                <p className="learn-more-card-description">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Popular Training Scenarios */}
          <div className="popular-training-section">
            <div className="populat-training-section-centerpart">
              <h1 className="popular-training-heading">
                Popular Training Scenarios
              </h1>
              <p className="popular-training-description">
                Some of the popular roleplay situations our learners are
                practicing with:
              </p>
              <div className="popular-training-list">
                {[
                  {
                    icon: <FaPhone />,
                    text: "Customer Service",
                  },
                  {
                    icon: <FaHandshake />,
                    text: "Negotiating",
                  },
                  {
                    icon: <FaLightbulb />,
                    text: "Sales Pitching",
                  },
                  {
                    icon: <FaComments />,
                    text: "Difficult Conversations",
                  },
                  {
                    icon: <FaBriefcase />,
                    text: "On-field Sales",
                  },
                ].map((item, index) => (
                  <div className="training-item" key={index}>
                    <div className="icon-circle">{item.icon}</div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="thirdSection-learnmorepage">
          <div className="aboutlearnmore">
            {/* Div1 */}

            <div className="aboutlearnmore-div3">
              <div className="aboutlearnmore-text">
                <h2>Unlimited product portfolio</h2>
                <p>
                  Add any number of products and scenarios for your employees to
                  practice.
                </p>
              </div>
              <div className="aboutlearnmore-image">
                <img src={workplace} alt="Customize with Roleplay Studio" />
              </div>
            </div>

            {/* Div2 */}
            <div className="aboutlearnmore-div2">
              <div className="aboutlearnmore-image">
                <img
                  src={multilingula}
                  alt="Practice in different languages"
                />
              </div>
              <div className="aboutlearnmore-text">
                <h2>Multilingual</h2>
                <p>
                Practice sales pitch in 12+ Indic languages
                </p>
              </div>
            </div>

            {/* Div3 */}

            {/*  */}
            <div className="aboutlearnmore-div1">
              <div className="aboutlearnmore-image">
                <img src={feedback} alt="AI-powered feedback" />
              </div>
              <div className="aboutlearnmore-text">
                <h2>AI-powered feedback</h2>
                <p>
                visibility your team's performance  at single dashboard
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="Learnpage-footer-homePage">
          <div className="Learnpage-footer-wrapper">
            <div className="Learnpage-footer-top">
              <div className="Learnpage-footer-column">
                <h3>PLATFORM</h3>
                <ul>
                  <li>AI Roleplays</li>
                  <li>Enterprise</li>
                  <li>Book a demo</li>
                </ul>
              </div>
              <div className="Learnpage-footer-column">
                <h3>RESOURCES</h3>
                <ul>
                  <li>Blog</li>
                  <li>Case Studies</li>
                  <li>Webinars</li>
                </ul>
              </div>
            </div>
            <div className="Learnpage-footer-bottom">
              <p className="Learnpage-footer-company">2025 RevuteAI Ltd.</p>
              <p className="Learnpage-footer-links">
                Terms | Privacy | Accessibility
              </p>
              <div className="Learnpage-footer-social">
                contact@revuteai.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnMore;
