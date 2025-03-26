import React, { useState, useEffect } from 'react';
import './AdminOrder.css';
import Sidebar from '../Components/Sidebar/Sidebar';
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { ThreeDots } from 'react-loader-spinner';

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editOrder, setEditOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setErrorMessage('No token found. Please log in.');
        setLoading(false);
        return;
      }

      let url = 'http://localhost:4000/admin/orders';
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }

      try {
        const response = await fetch(url, {
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
  }, [statusFilter]);

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

  const openEditModal = (order) => setEditOrder(order);
  const closeEditModal = () => setEditOrder(null);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await handleStatusChange(editOrder._id, editOrder.orderStatus);
    closeEditModal();
  };

  const handleViewDetails = async (orderId) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/admin/orders/${orderId}/details`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const orderDetails = await response.json();
      setViewOrder(orderDetails);
    } catch (err) {
      setErrorMessage('Error fetching order details: ' + err.message);
    }
  };

  const closeViewModal = () => setViewOrder(null);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-container">
        <h1 className="admin-title">Order Management</h1>

        <div className="filter-container">
          <label>Filter by Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <ThreeDots color="#0047FF" height={50} width={50} />
          </div>
        ) : (
          <>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            <div className="table-container">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Ordered Date</th>
                    <th>Ordered Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>{order.userid ? order.userid.name : 'Unknown User'}</td>
                      <td>₹{order.totalPrice}</td>
                      <td>
                        <select
                          className={`status-dropdown status-${order.orderStatus.toLowerCase()}`}
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td>{new Date(order.orderedDate).toLocaleDateString()}</td>
                      <td>{order.orderedTime}</td>
                      <td>
                        <button className="icon-btn" onClick={() => openEditModal(order)}>
                          <FaEdit className="edit-icon" />
                        </button>
                        <button className="icon-btn" onClick={() => handleDelete(order._id)}>
                          <FaTrash className="trash-icon" />
                        </button>
                        <button className="icon-btn" onClick={() => handleViewDetails(order._id)}>
                          <FaEye className="view-icon" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {/* Edit Modal */}
      {editOrder && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit Order</h2>
              <button className="close-btn" onClick={closeEditModal}>X</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <label>Status:</label>
              <select
                value={editOrder.orderStatus}
                onChange={(e) => setEditOrder({ ...editOrder, orderStatus: e.target.value })}
              >
                {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewOrder && (
  <div className="modal-overlay">
    <div className="modal-container">
      <h2>Order Details</h2>
      <p><strong>Order ID:</strong> {viewOrder._id}</p>
      <p><strong>User:</strong> {viewOrder.userid?.name} ({viewOrder.userid?.email})</p>
      <p><strong>Status:</strong> {viewOrder.orderStatus}</p>
      <p><strong>Total Price:</strong> ₹{viewOrder.totalPrice}</p>

      <h3>Items:</h3>
      {viewOrder.items && viewOrder.items.length > 0 ? (
        viewOrder.items.map((item) => (
          <div key={item._id} className="item-card">
            {/* Check if images exist */}
            {item.images && item.images.length > 0 ? (
              <img src={item.images[0]} alt={item.productName} className="item-image" />
            ) : (
              <div className="item-image-placeholder">No Image</div>
            )}
            <div className="item-info">
              <p><strong>{item.productName || 'Unknown Product'}</strong></p> {/* Display product name */}
              <p><strong>Product ID:</strong> {item.productid}</p> {/* Display product ID */}
              <p>Quantity: {item.quantity}</p>
              <p>Price: ₹{item.price}</p>
              <p>Total: ₹{item.quantity * item.price}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No items found in this order.</p>
      )}

      <button className="close-btn" onClick={closeViewModal}>Close</button>
    </div>
  </div>
)}


    </div>
  );
};

export default AdminOrder;
