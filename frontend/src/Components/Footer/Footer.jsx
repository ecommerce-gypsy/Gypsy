import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // To display success or error message

  // Handle the form submission
  const handleSubscribe = async (e) => {
    e.preventDefault(); // Prevent the form from reloading the page

    if (!email) {
      setMessage("Please enter a valid email!");
      return;
    }

    try {
      // Send POST request to the backend to subscribe the user
      const response = await fetch("http://localhost:4000/subscribe-newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setMessage(data.message); // Success message
      } else {
        setMessage(data.message); // Error message
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/customer-reviews">Customer Reviews</Link></li>
            <li><Link to="/gallery">About Us</Link></li>
            <li><Link to="/anklets">Our Products</Link></li>
          </ul>
        </div>

        {/* Information */}
        <div className="footer-section">
          <h3>Information</h3>
          <ul>
            <li><Link to="/shipping-returns">Shipping & Returns</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/faq">FAQs & Support</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section contact-section">
          <h3>Contact Us</h3>
          <p>📞 +91 9360495115</p>
          <p>📍 Madras Christian College</p>
          <p>
            ✉️ Email:{" "}
            <a href="mailto:roshnivr06@gmail.com">roshnivr06@gmail.com</a>
          </p>
        </div>

        {/* Subscription Form */}
        <div className="footer-section footer-subscribe">
          <h3>Stay Updated</h3>
          <form className="subscription-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          {message && <p>{message}</p>} {/* Display the success/error message */}
        </div>
      </div>

      {/* Social Links */}
      <div className="footer-socials">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>

      {/* Admin Login */}
      <div className="footer-admin">
        <Link to="/login">Admin Login</Link>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Your Company. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
