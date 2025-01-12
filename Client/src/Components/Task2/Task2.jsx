import React from 'react';
import './Task2.css'

const App = () => {
  const handleOpenInNewTab = () => {
    window.open('https://azure-4sk4.onrender.com', '_blank');
  };

  return (
    <div className='task2-container'>
    <div>
    <div className='txt-msg'>
    Welcome! Ready to begin? Click 'Start Test' to proceed.
    </div>
    <button
        onClick={handleOpenInNewTab}
        className='starttest-btn'
      >
        Start Test
      </button>
    </div>
    </div>
  );
};

export default App;