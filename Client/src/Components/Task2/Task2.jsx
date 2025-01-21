import React from "react";
import "./Task2.css";
import { useNavigate } from "react-router-dom"; 

const App = () => {
  const navigate = useNavigate();
  const handleOpenInNewTab = () => {
    navigate('/botpage');
  };

  return (
    <div className="task2-container">
      <div>
        <div className="txt-msg">
          Welcome! Ready to begin? Click 'Start Test' to proceed.
        </div>
        <button onClick={handleOpenInNewTab} className="starttest-btn">
          Start Test
        </button>
      </div>
    </div>
  );
};

export default App;
