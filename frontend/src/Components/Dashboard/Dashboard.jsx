import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { UserCircle } from "@radix-ui/react-icons";
import "./Dashboard.css";

// Data for Line Chart
const data = [
  { year: 1972, value: 0.1 },
  { year: 1975, value: 0.15 },
  { year: 1980, value: 0.05 },
  { year: 1982, value: 0.2 },
];

// Data for Pie Chart (Top Selling Products)
const pieData = [
  { name: "Able Pro", value: 16300, color: "#FF7E5F" },
  { name: "Photoshop", value: 26421, color: "#38EF7D" },
  { name: "Figma", value: 18400, color: "#0072FF" },
];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="card orange">
          <h2>$30,200</h2>
          <p>All Earnings</p>
        </div>
        <div className="card green">
          <h2>290+</h2>
          <p>Page Views</p>
        </div>
        <div className="card red">
          <h2>145</h2>
          <p>Tasks Completed</p>
        </div>
        <div className="card blue">
          <h2>500</h2>
          <p>Downloads</p>
        </div>
      </div>

      {/* Sales Analytics Chart */}
      <div className="sales-card">
        <h3>Sales Analytics</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="year" stroke="#888" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Activity & Top Selling Products */}
      <div className="stats-grid">
        {/* Top Selling Products */}
        <div className="top-selling-container">
          <h3>Top Selling Products</h3>
          <div className="chart-container">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50} // Reduced size
                  innerRadius={30} // Optional: for a donut style
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Product List */}
            <ul className="product-list">
              {pieData.map((product, index) => (
                <li key={index} className="product-item">
                  <span
                    className="product-color"
                    style={{ background: product.color }}
                  ></span>
                  {product.name}: {product.value} sales
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* User Activity */}
        <div className="user-activity">
          <h3>User Activity</h3>
          <div className="activity-item">
            <UserCircle className="w-10 h-10 text-gray-500" />
            <p>John Doe commented on a project.</p>
          </div>
          <div className="activity-item">
            <UserCircle className="w-10 h-10 text-gray-500" />
            <p>Jane Smith liked a post.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
