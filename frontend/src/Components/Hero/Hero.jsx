import React from 'react';
import './Hero.css';
import user from '../Assets/user.png'; // Ensure the image exists
import home from '../Assets/home.png'; // Ensure the image exists
import logo from '../Assets/logo.png'; // Ensure the image exists

export const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-left">
        <h2>NEW ARRIVALS ONLY</h2>
        <div className="hero-text">
          <div className="hero-user">
            <p>New</p>
            <img src={user} alt="User Icon" />
          </div>
          <p>Collections</p>
          <p>For Everyone</p>
        </div>
        <div className="hero-latest-btn">
          <div>Latest Collection</div>
          <img src={home} alt="Home Icon" />
        </div>
      </div>
      <div className="hero-right">
        <img src={logo} alt="Logo" className="hero-logo" />
      </div>
    </div>
  );
};
