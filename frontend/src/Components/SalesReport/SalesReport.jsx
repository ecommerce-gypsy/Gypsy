import React, { useState, useEffect } from 'react';
import './SalesReport.css';

export const SalesReport = () => {
  const [reportData, setReportData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState(0); // Number of pending orders
  const [outOfStockProducts, setOutOfStockProducts] = useState(0); // Number of out-of-stock products
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch sales report, total revenue, and orders per month
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
      const [revenueResponse, ordersPerMonthResponse] = await Promise.all([
        fetch(`http://localhost:4000/api/sales/admin/total-revenue?${query.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        }),
        fetch(`http://localhost:4000/api/sales/admin/orders-per-month?${query.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (!revenueResponse.ok || !ordersPerMonthResponse.ok) throw new Error('Failed to fetch sales report');
      
      const revenueData = await revenueResponse.json();
      const ordersPerMonthData = await ordersPerMonthResponse.json();

      setReportData({
        totalRevenue: revenueData.totalRevenue,
        totalOrders: ordersPerMonthData.ordersPerMonth.reduce((sum, month) => sum + month.totalOrders, 0),
        ordersPerMonth: ordersPerMonthData.ordersPerMonth,
      });
    } catch (err) {
      setErrorMessage('Error fetching sales report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent orders
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

  // Fetch pending orders
  const fetchPendingOrders = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/sales/pending-orders', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch pending orders');
      const data = await response.json();
      setPendingOrders(data.pendingOrdersCount); // Assuming this returns the count
    } catch (err) {
      setErrorMessage('Error fetching pending orders: ' + err.message);
    }
  };

 // Fetch out of stock products count
const fetchOutOfStockProducts = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    setErrorMessage('No token found. Please log in.');
    setLoading(false);
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/sales/out-of-stock', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch out of stock products');
    
    const data = await response.json();
    
    // Here we expect the response to contain 'outOfStockCount' and not an array
    setOutOfStockProducts(data.outOfStockCount); // Set the count directly from the response
  } catch (err) {
    setErrorMessage('Error fetching out of stock products: ' + err.message);
  }
};


  useEffect(() => {
    fetchSalesReport();
    fetchOrders();
    fetchPendingOrders();
    fetchOutOfStockProducts();
  }, [startDate, endDate]);

  return (
    <div className="sales-report-container">
      <h1 className="sales-report-header">SALES AND REVENUE REPORT</h1>

      {/* Date Filters */}
      <div className="filters-wrapper">
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
      </div>

      {/* Summary Section */}
      <div className="summary-container">
        <div className="report-box revenue-box">
          <h2>Total Revenue</h2>
          <p className="summary-value">₹{reportData?.totalRevenue}</p>
          <p className="summary-comparison">Compared to last month</p>
        </div>

        <div className="report-box orders-summary-box">
          <h2>Total Orders</h2>
          <p className="summary-value">{reportData?.totalOrders}</p>
          <p className="summary-comparison">Compared to last month</p>
        </div>

        {/* Pending Orders */}
        <div className="report-box pending-orders-box">
          <h2>Pending Orders</h2>
          <p className="summary-value">{pendingOrders}</p>
        </div>

        {/* Out of Stock Products */}
        <div className="report-box out-of-stock-box">
          <h2>Out of Stock Products</h2>
          <p className="summary-value">{outOfStockProducts}</p>
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
