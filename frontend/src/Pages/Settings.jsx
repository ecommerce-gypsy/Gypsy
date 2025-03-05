import React, { useState } from "react";
import "./Settings.css"; // Import the CSS file

const Settings = () => {
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  return (
    <div className="settings-container">
      <div className="settings-card">
        {/* Title */}
        <h2 className="settings-title">Settings</h2>

        {/* Log Out Everywhere Section */}
        <div className="logout-section">
          <button
            onClick={() => setShowLogoutMessage(!showLogoutMessage)}
            className="logout-button"
          >
            🔒 Log out everywhere
          </button>

          <p className="logout-description">
            If you've lost a device or have security concerns, log out everywhere to ensure the security of your account.
          </p>

          {/* Show logout message when button is clicked */}
          {showLogoutMessage && (
            <div className="logout-message">
              <button className="logout-confirm-button">Log out everywhere</button>
              <span className="logout-message-text">You will be logged out on this device as well.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
