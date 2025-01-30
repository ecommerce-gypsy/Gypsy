import React from "react";
import { Link } from "react-router-dom"; // Import Link from React Router
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/customer-reviews">Customer Reviews</Link>
            </li>
            <li>
              <Link to="/gallery">About Us</Link>
            </li>
            <li>
              <Link to="/anklets">Our Products</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Info</h3>
          <ul>
            <li>
              <Link to="/shipping-returns">Shipping & Returns</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/faq">FAQs & Support</Link>
            </li>
            <li>
              <Link to="/terms-of-service">Terms of Service</Link>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>+91 9360495115</p>
          <p>Madras Christian College</p>
          <p>
            Email: <a href="mailto:roshnivr06@gmail.com">roshnivr06@gmail.com</a>
          </p>
          <p>Phone: 9876765676 (10 AM to 6:30 PM)</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Subscribe for exclusive offers and updates!</p>
        <form className="subscription-form">
          <input type="email" placeholder="Email" />
          <button type="submit">→</button>
        </form>
      </div>
      <div className="footer-socials">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
          Facebook
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
          Instagram
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
          YouTube
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
          LinkedIn
        </a>
      </div>
    </footer>
  );
};

export default Footer;
