// Sidebar.jsx
import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

// Importing Icons
import cart from "../Assets/Cartt.png";
import list from "../Assets/Listt.png";
import admin from "../Assets/Admin.png";
import sales from "../Assets/Sales.png";
import order from "../Assets/order.png";
import dashboard from "../Assets/data.png";
import review from "../Assets/review.png";
import stock from "../Assets/stock.png";
import payment from "../Assets/payment.png";
import returnicon from "../Assets/returnicon.png";
import design from "../Assets/design.png";
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Logout Function
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      sessionStorage.removeItem("token");
      navigate("/login");
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
    {path:"/adminoutofstock",icon:stock,label: "Out Of Stock"},
    {path:"/adminpayment",icon:payment,label: "Admin Payment"},
    {path:"/adminreturns",icon:returnicon,label: "Admin Return"},
    {path:"/addcustomdesign",icon:design,label: "Add Custom Design"}
  ];

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>

      {/* Sidebar Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <Link to={item.path} key={index} className="sidebar-link">
            <div
              className={`sidebar-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <img src={item.icon} alt={item.label} className="sidebar-icon" />
              <p>{item.label}</p>
            </div>
          </Link>
        ))}
      </nav>

      {/* Divider for clean separation */}
      <div className="sidebar-divider"></div>

      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-button">
        <FaSignOutAlt className="logout-icon" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
