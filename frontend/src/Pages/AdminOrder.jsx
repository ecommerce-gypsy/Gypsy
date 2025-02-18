import React, { useState, useEffect } from 'react';
import './AdminOrder.css';
import Sidebar from '../Components/Sidebar/Sidebar';

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setErrorMessage('Error fetching orders: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      setOrders(orders.map((order) => (order._id === orderId ? updatedOrder : order)));
    } catch (err) {
      setErrorMessage('Error updating order status: ' + err.message);
    }
  };

  const handleDelete = async (orderId) => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }

    try {
      setOrders(orders.filter((order) => order._id !== orderId));

      const response = await fetch(`http://localhost:4000/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
    } catch (err) {
      setErrorMessage('Error deleting order: ' + err.message);
      setOrders([...orders]);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Order Management Section */}
      <div className="admin-container">
        <h1 className="admin-title">Order Management</h1>
        {loading && <p className="loading-text">Loading...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}
        {!loading && (
          <div className="table-container">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.userid ? order.userid.name : 'Unknown User'}</td>
                    <td>${order.totalPrice}</td>
                    <td>
                      <select
                        className="status-dropdown"
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(order._id)}>
                        Delete
                      </button>
                      
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrder;
