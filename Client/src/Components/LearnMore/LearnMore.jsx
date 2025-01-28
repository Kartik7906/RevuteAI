// LearnMore.js
import React from "react";
import { FaPhone, FaHandshake, FaLightbulb, FaComments, FaBriefcase } from "react-icons/fa";
import "./LearnMore.css";
import simulationImage from "../../images/simulationimage.webp";
import personalizationImage from "../../images/personalization.jpg";
import insightsImage from "../../images/insights.avif";

const LearnMore = () => {
  return (
    <div className="learn-more-wrapper">
      {/* Hero Section */}
      <section className="learn-more-hero">
        <h1 className="hero-title">Practice with AI Agent</h1>
        <p className="hero-description">
          Enable your team to practice every sales blocker scenario,
          rejection, and negotiation with our AI Agent.
        </p>
      </section>

      {/* Learn More Section */}
      <section className="learn-more-container">
        <h1 className="learn-more-heading">Why use AI for mastering Sales?</h1>
        <div className="learn-more-content">
          {[{
            image: simulationImage,
            title: "Simulation of Life Scenario",
            description: "AI creates a life scenario to practice a free-flow conversation."
          }, {
            image: personalizationImage,
            title: "Personalization",
            description: "AI agents create a more personalized and engaging learning experience."
          }, {
            image: insightsImage,
            title: "Insights",
            description: "Real-time feedback to accelerate learning and identify areas that need improvement."
          }].map((card, index) => (
            <div className="learn-more-card" key={index}>
              <div className="learn-more-image-container">
                <img
                  src={card.image}
                  alt={card.title}
                  className="learn-more-image"
                />
              </div>
              <h2 className="learn-more-card-title">{card.title}</h2>
              <p className="learn-more-card-description">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Popular Training Scenarios */}
        <div className="popular-training-section">
          <h1 className="popular-training-heading">Popular Training Scenarios</h1>
          <p className="popular-training-description">
            Some of the popular roleplay situations our learners are practicing with:
          </p>
          <div className="popular-training-list">
            {[{
              icon: <FaPhone />,
              text: "Customer Service"
            }, {
              icon: <FaHandshake />,
              text: "Negotiating"
            }, {
              icon: <FaLightbulb />,
              text: "Sales Pitching"
            }, {
              icon: <FaComments />,
              text: "Difficult Conversations"
            }, {
              icon: <FaBriefcase />,
              text: "On-field Sales"
            }].map((item, index) => (
              <div className="training-item" key={index}>
                <div className="icon-circle">{item.icon}</div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LearnMore;