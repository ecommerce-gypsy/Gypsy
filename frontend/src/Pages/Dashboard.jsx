// Dashboard.jsx
import React from "react";
import "./Dashboard.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Sidebar from '../Components/Sidebar/Sidebar';



// Register ChartJS Components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  // Chart Data
  const lineData = {
    labels: ["Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Sales",
        data: [120, 540, 245, 370],
        borderColor: "#ff5c77",
        backgroundColor: "rgba(255, 92, 119, 0.2)",
        fill: true,
      },
    ],
  };

  return (
  
    <div className="dashboard-container">
          
      {/* Header */}
      <div className="dashboard-header">
        <h2>Ecommerce Dashboard</h2>
        <input type="text" placeholder="Search..." className="search-bar" />
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        {[
          { title: "New Orders", value: "35,673", color: "#8e44ad" },
          { title: "Total Income", value: "$14,966", color: "#2ecc71" },
          { title: "Total Expense", value: "25,626", color: "#3498db" },
          { title: "New Users", value: "32,566", color: "#f39c12" },
        ].map((item, index) => (
          <div key={index} className="stats-card" style={{ borderBottom: `5px solid ${item.color}` }}>
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Summary & Top Products */}
      <div className="dashboard-main">
        <div className="chart-container">
          <h3>Summary</h3>
          <Line data={lineData} />
        </div>

        <div className="top-products">
          <h3>Top Selling Products</h3>
          {[
            { name: "Homepod", price: "$129.00" },
            { name: "MacBook Pro", price: "$699.00" },
            { name: "Apple Watch", price: "$399.00" },
          ].map((product, index) => (
            <div key={index} className="product-item">
              <p>{product.name}</p>
              <span>{product.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Activity & Recent Products */}
      <div className="bottom-section">
        <div className="order-activity">
          <h3>Order Activity</h3>
          {["Delivered", "Shipped", "Dispatched", "Received"].map((status, index) => (
            <p key={index}>{status}</p>
          ))}
        </div>

        <div className="recent-products">
          <h3>Recent Products</h3>
          <div className="carousel">
            <p>Carousel with header (Replace with actual image slider)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
