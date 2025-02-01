import React, { useState, useEffect } from 'react';

export const SalesReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch the sales report data
  const fetchSalesReport = async () => {
    const token = localStorage.getItem('auth_token');  // Get the token from localStorage

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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Attach token in the Authorization header
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sales report');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setErrorMessage('Error fetching sales report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();  // Fetch the report when the component mounts
  }, [startDate, endDate]);  // Refetch whenever the date range changes

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Sales and Revenue Report</h1>

      {/* Date Filters */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </label>

        <label style={{ marginLeft: '20px' }}>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </label>

        <button
          onClick={fetchSalesReport}
          style={{ marginLeft: '20px', padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white' }}
        >
          Generate Report
        </button>
      </div>

      {/* Loading and Error Message */}
      {loading && <p>Loading...</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* Report Data Display */}
      {reportData && (
        <div>
          <h2>Summary</h2>
          <p>Total Revenue: ${reportData.totalRevenue}</p>
          <p>Total Orders: {reportData.totalOrders}</p>

          {/* Orders Table */}
          <h2>Orders</h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '20px',
              border: '1px solid #ddd',
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Order ID</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>User</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Total Price</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{order._id}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {order.userid ? order.userid.name : 'Unknown User'}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>${order.totalPrice}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{order.orderStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
