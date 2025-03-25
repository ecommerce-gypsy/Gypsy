import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

export const Hero = () => {
  const navigate = useNavigate();

  // State for animated statistics
  const [stats, setStats] = useState({
    years: 0,
    orders: 0,
    clients: 0,
    employees: 0,
  });

  // Function to animate numbers smoothly
  const animateCount = (key, target, duration = 3000) => {
    let start = 0;
    const increment = target / (duration / 50);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        clearInterval(timer);
        setStats((prevStats) => ({ ...prevStats, [key]: target }));
      } else {
        setStats((prevStats) => ({
          ...prevStats,
          [key]: Math.ceil(start),
        }));
      }
    }, 50);
  };

  useEffect(() => {
    animateCount("years", 6);
    animateCount("orders", 200);
    animateCount("clients", 300);
    animateCount("employees", 10);
  }, []);

  return (
    <div className="hero-container">
      {/* Main Hero Section */}
      <div className="hero">
        <div className="hero-left">
          <div className="hero-text">
            <h1 className="fade-in">
              Preserving <span>Cultural Heritage</span>
            </h1>
            <p className="fade-in-delay">
              Celebrating and preserving the legacy of the Narikuravar
              community.
            </p>
          </div>

          {/* CTA Button */}
          <div className="hero-btn-container">
            <button
              className="explore-btn pulse"
              onClick={() => navigate("/Gallery")}
            >
              Explore Their Journey
            </button>
          </div>
        </div>
      </div>

      {/* Stat Containers with Improved Animations */}
      <div className="stats-section">
        <StatCard
          icon="https://cdn-icons-png.flaticon.com/128/684/684908.png"
          value={stats.years + "Y"}
          label="Years In Industry"
          delay="0s"
        />
        <StatCard
          icon="https://cdn-icons-png.flaticon.com/128/3154/3154880.png"
          value={stats.orders + "+"}
          label="Orders Dispatched"
          delay="0.5s"
        />
        <StatCard
          icon="https://cdn-icons-png.flaticon.com/128/2920/2920281.png"
          value={stats.clients + "+"}
          label="Years of Cultural Preservation"
          delay="1s"
        />
        <StatCard
          icon="https://cdn-icons-png.flaticon.com/128/4203/4203669.png"
          value={stats.employees + "+"}
          label="Community Members Engaged"
          delay="1.5s"
        />
      </div>
    </div>
  );
};

// StatCard Component for Clean Structure
const StatCard = ({ icon, value, label, delay }) => {
  return (
    <div className="stat-box professional-animation" style={{ animationDelay: delay }}>
      <img src={icon} alt={label} />
      <h2 className="stat-number">{value}</h2>
      <p>{label}</p>
    </div>
  );
};
