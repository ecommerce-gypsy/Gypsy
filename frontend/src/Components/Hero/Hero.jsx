import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Hero.css";
import logo from "../Assets/People.png"; // Ensure the image path is correct


export const Hero = () => {
  const navigate = useNavigate(); // Initialize navigate for routing

  return (
    <div className="hero">
      <div className="hero-left">
        
        <div className="hero-text">
          <div className="hero-user">
            <p>Preserving</p>
          </div>
          <p>Culture & Heritage</p>
          <p>Of the Narikuravar Community</p>
        </div>
        <div
          className="hero-latest-btn"
          onClick={() => navigate("/Gallery")} // Navigate to the "/gallery" route
        >
          <div>Explore Their Journey</div>
        </div>
      </div>
      <div className="hero-right">
        <img src={logo} alt="Narikuravar Logo" className="hero-logo" />
      </div>
      
    </div>
  );
};
