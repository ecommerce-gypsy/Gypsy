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
  Filler,
} from "chart.js";
import { motion } from "framer-motion";

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
  Filler
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    salesSummary: [],
    newOrders: 0,
    totalIncome: 0,
    totalExpense: 0,
    topProducts: [],
    categoryData: null,
    recentProducts: [],
  });
  const [hasNotification, setHasNotification] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/dashboard/db")
      .then((res) => res.json())
      .then((data) => {
        const formattedCategoryData = {};
        data.pieChartData?.forEach((item) => {
          formattedCategoryData[item.category] = item.sales;
        });

        setDashboardData({
          ...data,
          categoryData: formattedCategoryData,
        });
      })
      .catch((error) => console.error("Error fetching dashboard data:", error));

    fetch("http://localhost:4000/newcollections")
      .then((res) => res.json())
      .then((data) => {
        setDashboardData((prevData) => ({
          ...prevData,
          recentProducts: data,
        }));
      })
      .catch((error) => console.error("Error fetching recent products:", error));
  }, []);

  // Line chart data with enhanced styling
  const lineData = {
    labels: dashboardData.salesSummary?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Sales (₹)",
        data: dashboardData.salesSummary?.map((item) => item.sales) || [],
        borderColor: "#7e3af2",
        backgroundColor: "rgba(126, 58, 242, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#7e3af2",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Line chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif"
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1a1c23',
        bodyColor: '#1a1c23',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `₹${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            return '₹' + value;
          }
        }
      }
    }
  };

  const categoryData = dashboardData.categoryData ?? { anklets: 0, bracelets: 0, neckpieces: 0 };

  // Pie chart data with enhanced styling
  const pieData = {
    labels: ["Anklets", "Bracelets", "Neckpieces"],
    datasets: [
      {
        data: [
          categoryData.anklets || 0,
          categoryData.bracelets || 0,
          categoryData.neckpieces || 0,
        ],
        backgroundColor: ["#7e3af2", "#16bdca", "#a8a8ff"],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  // Pie chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1a1c23',
        bodyColor: '#1a1c23',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ₹${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Slider settings for the carousel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle notification click
  const handleNotificationClick = () => {
    setHasNotification(false);
  };

  return (
    <motion.div 
      className="dashboard-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <motion.div 
          className="dashboard-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1>Dashboard</h1>
            <p className="welcome-text">Welcome back! Here's what's happening with your store today.</p>
          </div>
          <div className="search-container">
            <input type="text" placeholder="Search..." className="search-bar" />
            <motion.button 
              className="notification-btn"
              onClick={handleNotificationClick}
              animate={hasNotification ? { 
                rotate: [0, -10, 10, -10, 10, 0],
                transition: { 
                  repeat: Infinity, 
                  repeatDelay: 5,
                  duration: 0.5 
                } 
              } : {}}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="fas fa-bell"></i>
              {hasNotification && <span className="notification-dot"></span>}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="stats-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="stats-card"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="card-icon" style={{ backgroundColor: 'rgba(126, 58, 242, 0.1)' }}>
              <i className="fas fa-shopping-bag" style={{ color: '#7e3af2' }}></i>
            </div>
            <div className="card-content">
              <p className="card-title">New Orders</p>
              <h3 className="card-value">{dashboardData.newOrders || 0}</h3>
              <p className="card-change positive">+2.5% from yesterday</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="stats-card"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="card-icon" style={{ backgroundColor: 'rgba(22, 189, 202, 0.1)' }}>
              <i className="fas fa-rupee-sign" style={{ color: '#16bdca' }}></i>
            </div>
            <div className="card-content">
              <p className="card-title">Total Income</p>
              <h3 className="card-value">{formatCurrency(dashboardData.totalIncome || 0)}</h3>
            </div>
          </motion.div>
          
          <motion.div 
            className="stats-card"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="card-icon" style={{ backgroundColor: 'rgba(245, 101, 101, 0.1)' }}>
              <i className="fas fa-money-bill-wave" style={{ color: '#f56565' }}></i>
            </div>
            <div className="card-content">
              <p className="card-title">Total Expense</p>
              <h3 className="card-value">{formatCurrency(dashboardData.totalExpense || 0)}</h3>
            </div>
          </motion.div>
          
          <motion.div 
            className="stats-card"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="card-icon" style={{ backgroundColor: 'rgba(237, 137, 54, 0.1)' }}>
              <i className="fas fa-users" style={{ color: '#ed8936' }}></i>
            </div>
            <div className="card-content">
              <p className="card-title">New Users</p>
              <h3 className="card-value">3</h3>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          className="charts-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="line-chart-container"
            whileHover={{ scale: 1.01 }}
          >
            <div className="chart-header">
              <h3>Monthly Sales Performance</h3>
            </div>
            <div className="chart-wrapper">
              {dashboardData.salesSummary.length > 0 ? (
                <Line data={lineData} options={lineOptions} />
              ) : (
                <div className="chart-loading">Loading sales data...</div>
              )}
            </div>
          </motion.div>

          <motion.div 
            className="pie-chart-container"
            whileHover={{ scale: 1.01 }}
          >
            <div className="chart-header">
              <h3>Sales by Category</h3>
            </div>
            <div className="chart-wrapper">
              {categoryData ? (
                <Pie data={pieData} options={pieOptions} />
              ) : (
                <div className="chart-loading">Loading category data...</div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="bottom-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Top Products */}
          <motion.div 
            className="top-products-container"
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="section-header">
              <h3>Top Selling Products</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="products-list">
              {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
                dashboardData.topProducts.map((product, index) => (
                  <motion.div 
                    key={index} 
                    className="product-item"
                    whileHover={{ backgroundColor: 'rgba(126, 58, 242, 0.05)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="product-rank">{index + 1}</div>
                    <div className="product-info">
                      <p className="product-name">{product.productName}</p>
                      <p className="product-sales">{formatCurrency(product.totalSales)}</p>
                    </div>
                    <div className="sales-badge">
                      <span>{Math.floor((product.totalSales / dashboardData.totalIncome) * 100)}%</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="no-products">Loading top products...</div>
              )}
            </div>
          </motion.div>

          {/* Recent Products */}
          <motion.div 
            className="recent-products-container"
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="section-header">
              <h3>New Arrivals</h3>
              <button className="view-all-btn">View All</button>
            </div>
            {dashboardData.recentProducts && dashboardData.recentProducts.length > 0 ? (
              <Slider {...sliderSettings}>
                {dashboardData.recentProducts.map((product, index) => (
                  <motion.div 
                    key={index} 
                    className="carousel-item"
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="product-image-container">
                      <img src={product.imageUrl} alt={product.productName} className="product-image" />
                      <button className="quick-view-btn">Quick View</button>
                    </div>
                    <div className="product-details">
                      <p className="product-name">{product.productName}</p>
                      <p className="product-price">{formatCurrency(product.price)}</p>
                      <div className="product-rating">
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star-half-alt"></i>
                        <span>(24)</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </Slider>
            ) : (
              <div className="no-products">Loading recent products...</div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;  