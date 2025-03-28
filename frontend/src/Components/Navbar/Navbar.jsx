import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart from "../Assets/cart.png";
import heart from "../Assets/heart-logo.png";
import user from "../Assets/userr.png";
import { CartContext } from "../../Context/CartContext";
import MarqueeBanner from "../MarqueeBanner/MarqueeBanner";
import { CategoryMenu } from '../../Components/CategoryMenu/CategoriesMenu';

export const Navbar = () => {
  const { cartCount } = useContext(CartContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(""); 
 const navigate = useNavigate();
  // Handle logout function
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload(); 
    navigate("/authcard");
  };

  // Fetch user email from localStorage when component mounts
  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  return (
    <div className="navbar">
      <div className="marquee container">
      {/* Logo Section */}<MarqueeBanner/>
      </div>
      <div className="nav-logo">
        <img src={logo} alt="Logo" />
      </div>

      {/* Navigation Menu */}
      <ul className="nav-menu">
      
        <li>
          <Link to="/">HOME</Link>
        </li>
        <li>
          <Link to="/anklets">ANKLETS</Link>
        </li>
        <li>
          <Link to="/neckpieces">NECKPIECES</Link>
        </li>
        <li>
          <Link to="/bracelets">BRACELETS</Link>
        </li>
        <li>
          <Link to="/earrings">EARRINGS</Link>
        </li>
        <li>
          <Link to="/CustomDesignPage">CUSTOMIZATION</Link>
        </li>
      </ul>

      {/* Icons and User Section */}
      <div className="nav-icons">
        <Link to="/wishlist" className="nav-icon">
          <img src={heart} alt="Wishlist" />
        </Link>

        <div className="nav-cart">
          <Link to="/cart" className="nav-cart-link">
            <img src={cart} alt="Cart" />
            <div className="nav-cart-count">{cartCount}</div>
          </Link>
        </div>

        {/* User Icon with Dropdown */}
        <div
          className="nav-user-container"
          onClick={() => setDropdownOpen(!isDropdownOpen)}
        >
          <div className="nav-user">
            <Link to="/authcard">
              <img src={user} alt="User" />
            </Link>
            <span className={`nav-arrow ${isDropdownOpen ? "open" : ""}`}>
              &#9662;
            </span>{" "}
            {/* ▼ Arrow */}
          </div>

          {/* User Dropdown */}
          {isDropdownOpen && (
            <div className="user-dropdown">
              <div className="user-info">
                <img src={user} alt="User" />
                {/* Display user email dynamically from localStorage */}
                <span>{userEmail || "Guest"}</span> {/* Fallback to "Guest" if email is not set */}
              </div>
              <hr />
              <Link to="/account" className="dropdown-item">
                Profile
              </Link>
              <Link to="/settings" className="dropdown-item">
                Settings
              </Link>
              <button className="logout-button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
