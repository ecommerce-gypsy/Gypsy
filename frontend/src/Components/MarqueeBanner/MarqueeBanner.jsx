import React, { useState } from "react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./MarqueeBanner.css";

const messages = [
  "Welcome to our store",
  "Handmade with love and tradition",
];

const MarqueeBanner = () => {
  const [index, setIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState("right");

  const prevMessage = () => {
    setAnimationDirection("left");
    setIndex((prevIndex) => (prevIndex === 0 ? messages.length - 1 : prevIndex - 1));
  };

  const nextMessage = () => {
    setAnimationDirection("right");
    setIndex((prevIndex) => (prevIndex === messages.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="marquee-container">
      {/* Social Media Icons */}
      <div className="social-icons">
        <FaFacebookF className="icon" />
        <FaInstagram className="icon" />
        <FaYoutube className="icon" />
      </div>

      {/* Message Section with Arrows */}
      <div className="marquee-wrapper">
        <button className="arrow-btn" onClick={prevMessage}>
          <FiChevronLeft />
        </button>

        <div className="message-box">
          <span key={index} className={`marquee-message ${animationDirection}`}>
            {messages[index]}
          </span>
        </div>

        <button className="arrow-btn" onClick={nextMessage}>
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default MarqueeBanner;
