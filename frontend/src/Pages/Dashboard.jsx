import React, { useState, useEffect } from "react";
import { Line, Pie } from "react-chartjs-2";
import Sidebar from "../Components/Sidebar/Sidebar";
import "./Dashboard.css";
import Slider from "react-slick";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,  // Import the Filler plugin
} from "chart.js";

// Register the necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler  // Register the Filler plugin
);

 // Import the slider component

// Register ChartJS Components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  // State to store dynamic data
  const [dashboardData, setDashboardData] = useState({
    salesSummary: [],
    newOrders: 0,
    totalIncome: 0,
    totalExpense: 0,
    topProducts: [],
    categoryData: null,
    recentProducts: [], // Default to an empty array
  });

  // Fetch data from the backend when the component mounts
  useEffect(() => {
    // Fetch dashboard data
    fetch("http://localhost:4000/api/dashboard/db")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Dashboard Data:", data); // Debugging

        // Transform pieChartData array into an object
        const formattedCategoryData = {};
        data.pieChartData.forEach((item) => {
          formattedCategoryData[item.category] = item.sales;
        });

        setDashboardData({
          ...data,
          categoryData: formattedCategoryData,
        });
      })
      .catch((error) => console.error("Error fetching dashboard data:", error));

    // Fetch recent products
    fetch("http://localhost:4000/newcollections")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Recent Products:", data); // Debugging

        // Check if data contains products
        setDashboardData((prevData) => ({
          ...prevData,
          recentProducts: data, // Update the state with recent products
        }));
      })
      .catch((error) => console.error("Error fetching recent products:", error));

  }, []);

  // Prepare line chart data for monthly sales
  const lineData = {
    labels: dashboardData.salesSummary?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Sales",
        data: dashboardData.salesSummary?.map((item) => item.sales) || [],
        borderColor: "#ff5c77",
        backgroundColor: "rgba(255, 92, 119, 0.2)",
        fill: true,
        tension: 0.4, // Smooth curve effect
      },
    ],
  };

  const categoryData = dashboardData.categoryData ?? { anklets: 0, bracelets: 0, neckpieces: 0 };

  const pieData = {
    labels: ["Anklets", "Bracelets", "Neckpieces"], // Capitalized labels
    datasets: [
      {
        data: [
          categoryData.anklets || 0,
          categoryData.bracelets || 0,
          categoryData.neckpieces || 0,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverOffset: 4,
      },
    ],
  };

  // Slider settings for the carousel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Show 3 products at a time
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2, // Show 2 products on small screens
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1, // Show 1 product on very small screens
        },
      },
    ],
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <h2>Ecommerce Dashboard</h2>
          <input type="text" placeholder="Search..." className="search-bar" />
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stats-card" style={{ borderBottom: "5px solid #8e44ad" }}>
            <h3>New Orders</h3>
            <p>{dashboardData.newOrders || 0}</p>
          </div>
          <div className="stats-card" style={{ borderBottom: "5px solid #2ecc71" }}>
            <h3>Total Income</h3>
            <p>₹{dashboardData.totalIncome || 0}</p>
          </div>
          <div className="stats-card" style={{ borderBottom: "5px solid #3498db" }}>
            <h3>Total Expense</h3>
            <p>₹{dashboardData.totalExpense || 0}</p>
          </div>
          <div className="stats-card" style={{ borderBottom: "5px solid #f39c12" }}>
            <h3>New Users</h3>
            <p>3</p>
          </div>
        </div>

        {/* Sales Summary Chart & Pie Chart */}
        <div className="charts-section">
          <div className="chart-container">
            <h3>Sales Summary (Monthly)</h3>
            {dashboardData.salesSummary.length > 0 ? (
              <Line data={lineData} />
            ) : (
              <p>Loading sales data...</p>
            )}
          </div>

          {/* Pie Chart for Category Distribution */}
          <div className="chart-container">
            <h3>Category Distribution</h3>
            {categoryData ? (
              <Pie data={pieData} />
            ) : (
              <p>Loading category data...</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="top-products">
          <h3>Top Selling Products</h3>
          {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
            dashboardData.topProducts.map((product, index) => (
              <div key={index} className="product-item">
                <p>{product.productName}</p>
                <span>₹{product.totalSales.toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p>Loading top products...</p>
          )}
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
            {dashboardData.recentProducts && dashboardData.recentProducts.length > 0 ? (
              <Slider {...sliderSettings}>
                {dashboardData.recentProducts.map((product, index) => (
                  <div key={index} className="carousel-item">
                    <img src={product.imageUrl} alt={product.productName} />
                    <p>{product.productName}</p>
                    <span>₹{product.price}</span>
                  </div>
                ))}
              </Slider>
            ) : (
              <p>Loading recent products...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
