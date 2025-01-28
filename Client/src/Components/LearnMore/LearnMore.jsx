import React from "react";
import "./LearnMore.css";
import simulationImage from "../../images/simulationimage.webp";
import personalizationImage from "../../images/personalization.jpg";
import insightsImage from "../../images/insights.avif";

const LearnMore = () => {
  return (
    <section className="learn-more-container">
      <h1 className="learn-more-heading">Why use AI for mastering the Sales</h1>
      <div className="learn-more-content">
        <div className="learn-more-card">
          <img
            src={simulationImage}
            alt="Simulation of life scenario"
            className="learn-more-image"
          />
          <h2 className="learn-more-card-title">Simulation of life scenario</h2>
          <p className="learn-more-card-description">
            AI creates a life scenario to practice a free-flow conversation.
          </p>
        </div>
        <div className="learn-more-card">
          <img
            src={personalizationImage}
            alt="Personalization"
            className="learn-more-image"
          />
          <h2 className="learn-more-card-title">Personalization</h2>
          <p className="learn-more-card-description">
            AI agents create a more personalized and engaging learning experience.
          </p>
        </div>
        <div className="learn-more-card">
          <img
            src={insightsImage}
            alt="Insights"
            className="learn-more-image"
          />
          <h2 className="learn-more-card-title">Insights</h2>
          <p className="learn-more-card-description">
            Real-time feedback to accelerate learning and identify areas that need improvement.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LearnMore;
