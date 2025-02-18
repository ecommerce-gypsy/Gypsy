import React, { useState, useEffect } from 'react';
import './SalesReport.css';

export const SalesReport = () => {
  const [reportData, setReportData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchSalesReport = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      setLoading(false);
      return;
    }

    const query = new URLSearchParams();
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);

    try {
      const response = await fetch(`http://localhost:4000/report/sales-report?${query.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch sales report');
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setErrorMessage('Error fetching sales report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/admin/orders', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setErrorMessage('Error fetching orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
    fetchOrders();
  }, [startDate, endDate]);

  return (
    <div className="sales-report-container">
      <h1 className="sales-report-header">SALES AND REVENUE REPORT</h1>

      {/* Date Filters */}
      <div className="filters-container">
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button onClick={fetchSalesReport}>Generate Report</button>
      </div>

      {/* Summary Section - Side by Side Layout */}
      <div className="summary-container">
        <div className="report-box revenue-box">
          <h2>Total Revenue</h2>
          <p className="summary-value">${reportData?.totalRevenue}</p>
          <p className="summary-comparison">Compared to last month</p>
        </div>

        <div className="report-box orders-summary-box">
          <h2>Total Orders</h2>
          <p className="summary-value">{reportData?.totalOrders}</p>
          <p className="summary-comparison">Compared to last month</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="report-box orders-box">
        <h2>Recent Orders</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 7).map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.userid ? order.userid.email : 'Unknown User'}</td>
                <td>${order.totalPrice}</td>
                <td>{order.orderStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading & Error Messages */}
      {loading && <p className="loading-message">Loading...</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default SalesReport;
