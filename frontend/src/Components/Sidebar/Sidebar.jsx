// Sidebar.jsx
import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";

// Importing Icons
import cart from "../Assets/Cartt.png";
import list from "../Assets/Listt.png";
import admin from "../Assets/Admin.png";
import sales from "../Assets/Sales.png";
import order from "../Assets/order.png";
import dashboard from "../Assets/data.png";
import review from "../Assets/review.png";

const Sidebar = () => {
  const navigate = useNavigate();

  // ✅ Logout Function
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      console.log("Logging out...");
      sessionStorage.removeItem("token"); // Clear session storage
      navigate("/login"); // Redirect to login page
    }
  };

  // ✅ Sidebar Menu Items
  const menuItems = [
    { path: "/dashboard", icon: dashboard, label: "Dashboard" },
    { path: "/addproduct", icon: cart, label: "Add Product" },
    { path: "/listproduct", icon: list, label: "Product List" },
    { path: "/admin", icon: sales, label: "Admin" },
    { path: "/adminuser", icon: admin, label: "Admin User" },
    { path: "/adminorder", icon: order, label: "Admin Order" },
    { path: "/reviewlist", icon: review, label: "Admin Review" },
  ];

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h2>Admin Dashboard</h2>
      </div>

      {/* Sidebar Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <Link to={item.path} key={index} className="sidebar-link">
            <div className="sidebar-item">
              <img src={item.icon} alt={item.label} className="sidebar-icon" />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-button">
        <FaSignOutAlt className="logout-icon" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
