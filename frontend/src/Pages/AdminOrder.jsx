import React, { useState, useEffect } from 'react';

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch orders when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('auth_token'); // Get token from localStorage

      if (!token) {
        setErrorMessage('No token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching orders...");
        const response = await fetch('http://localhost:4000/admin/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Attach token in the Authorization header
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        console.log("Data: ", data);
        setOrders(data);
      } catch (err) {
        setErrorMessage('Error fetching orders: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle order status change
  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('auth_token'); // Get token from localStorage

    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Attach token in the Authorization header
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

  // Handle order deletion
  const handleDelete = async (orderId) => {
    const token = localStorage.getItem('auth_token'); // Get token from localStorage

    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }

    try {
      // Optimistic UI update: Remove order immediately
      setOrders(orders.filter((order) => order._id !== orderId));

      const response = await fetch(`http://localhost:4000/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Attach token in the Authorization header
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
    } catch (err) {
      setErrorMessage('Error deleting order: ' + err.message);
      // Revert optimistic update if delete fails
      setOrders([...orders]);
    }
  };

  return (
    <div>
      <h1>Admin - Order Management</h1>
      {loading && <p>Loading...</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {!loading && (
        <table>
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
                {/* Ensure order.userid is not null or undefined before accessing 'name' */}
                <td>{order.userid ? order.userid.name : 'Unknown User'}</td>
                <td>{order.totalPrice}</td>
                <td>
                  <select
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
                  <button
                    onClick={() => handleDelete(order._id)}
                    aria-label={`Delete order ${order._id}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrder;
