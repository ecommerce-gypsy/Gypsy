import React, { useState } from 'react';
import './custom.css'; // Importing CSS for styling

const custom = () => {
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  const handleClick = () => {
    setShowWelcomeMessage(true);
  };

  return (
    <div className="custom-container">
      <button className="custom-btn" onClick={handleClick}>
        Go to Customization
      </button>

      {showWelcomeMessage && (
        <div className="welcome-message">
          <h1>Welcome to the Customization Page</h1>
        </div>
      )}
    </div>
  );
};

export default custom;
