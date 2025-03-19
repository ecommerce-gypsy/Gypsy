import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
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
          <p>+91 9360495115</p>
          <p>Madras Christian College</p>
          <p>Email: <a href="mailto:roshnivr06@gmail.com">roshnivr06@gmail.com</a></p>
        </div>

        {/* Subscription Form */}
        <div className="footer-section footer-subscribe">
          <h3>Stay Updated</h3>
          <form className="subscription-form">
            <input type="email" placeholder="Your email" required />
            <button type="submit">→</button>
          </form>
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
