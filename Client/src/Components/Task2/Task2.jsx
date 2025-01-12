import React from 'react';

const App = () => {
  const handleOpenInNewTab = () => {
    window.open('https://azure-4sk4.onrender.com', '_blank');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <button
        onClick={handleOpenInNewTab}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Start Test
      </button>
    </div>
  );
};

export default App;