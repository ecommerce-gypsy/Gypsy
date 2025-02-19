import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { UserCircle } from "@radix-ui/react-icons";
import "./Dashboard.css"; // Import CSS

const data = [
  { year: 1972, value: 0.1 },
  { year: 1975, value: 0.15 },
  { year: 1980, value: 0.05 },
  { year: 1982, value: 0.2 },
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

      {/* User Activity & Application Sales */}
      <div className="stats-grid">
        {/* Application Sales */}
        <div className="table-container">
          <h3>Application Sales</h3>
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Sales</th>
                <th>Avg Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Able Pro</td>
                <td>16,300</td>
                <td>$53</td>
                <td>$15,652</td>
              </tr>
              <tr>
                <td>Photoshop</td>
                <td>26,421</td>
                <td>$35</td>
                <td>$18,785</td>
              </tr>
            </tbody>
          </table>
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
