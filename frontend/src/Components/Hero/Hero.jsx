import React from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";
import logo from "../Assets/People.png"; 
import MarqueeBanner from "../MarqueeBanner/MarqueeBanner";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-container">
      {/* Marquee Banner at the Top */}
      <MarqueeBanner />
      
      {/* Hero Section */}
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
            onClick={() => navigate("/Gallery")}
          >
            <div>Explore Their Journey</div>
          </div>
        </div>
        <div className="hero-right">
          <img src={logo} alt="Narikuravar Logo" className="hero-logo" />
        </div>
      </div>
    </div>
  );
};
