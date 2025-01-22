import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#customer-reviews">Customer Reviews</a></li>
            
            
            <li><a href="#about-us">About Us</a></li>
        
          </ul>
        </div>
        <div className="footer-section">
          <h3>Info</h3>
          <ul>
            <li><a href="#shipping-returns">Shipping & Returns</a></li>
            <li><a href="#privacy-policy">Privacy Policy</a></li>
            <li><a href="#faqs">FAQs & Support</a></li>
            <li><a href="#terms-of-service">Terms of Service</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>+91 9360495115</p>
      
          <p>Madras Christian College</p>
          <p>Email: <a href="mailto:roshnivr06@gmail.com">roshnivr06@gmail.com</a></p>
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
        <a href="#facebook" className="social-icon">Facebook</a>
        <a href="#instagram" className="social-icon">Instagram</a>
        <a href="#youtube" className="social-icon">YouTube</a>
        <a href="#linkedin" className="social-icon">LinkedIn</a>
      </div>
    </footer>
  );
};

export default Footer;
