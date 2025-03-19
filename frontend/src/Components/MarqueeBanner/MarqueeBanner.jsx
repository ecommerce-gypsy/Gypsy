import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./MarqueeBanner.css";

const messages = [
  "Welcome to our store – Where Craft Meets Passion",
  "Handmade with Love and Timeless Tradition",
  "Explore Our Exclusive Collection of Artisan Goods",
];

const MarqueeBanner = () => {
  const [index, setIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState("right");

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextMessage();
    }, 5000);
    return () => clearInterval(interval);
  }, [index]);

  // Move to the next message
  const nextMessage = () => {
    setAnimationDirection("right");
    setIndex((prevIndex) => (prevIndex === messages.length - 1 ? 0 : prevIndex + 1));
  };

  // Move to the previous message
  const prevMessage = () => {
    setAnimationDirection("left");
    setIndex((prevIndex) => (prevIndex === 0 ? messages.length - 1 : prevIndex - 1));
  };

  return (
    <div className="marquee-container">
      {/* Left Arrow */}
      <button className="arrow-btn left-arrow" onClick={prevMessage}>
        <FiChevronLeft />
      </button>

      {/* Message Section */}
      <div className="marquee-wrapper">
        <div className="message-box">
          <span key={index} className={`marquee-message ${animationDirection}`}>
            {messages[index]}
          </span>
        </div>
      </div>

      {/* Right Arrow */}
      <button className="arrow-btn right-arrow" onClick={nextMessage}>
        <FiChevronRight />
      </button>
    </div>
  );
};

export default MarqueeBanner;
