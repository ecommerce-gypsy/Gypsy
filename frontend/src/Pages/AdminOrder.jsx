import React, { useState, useEffect } from 'react';
import './AdminOrder.css';
import Sidebar from '../Components/Sidebar/Sidebar';
import { FaEdit, FaTrash,FaEye } from "react-icons/fa";
import { ThreeDots } from 'react-loader-spinner';

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
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

  const openEditModal = (order) => {
    console.log(order);
    setEditOrder(order);
  };

  const closeEditModal = () => {
    setEditOrder(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/admin/orders/${editOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderStatus: editOrder.orderStatus,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      const updatedOrder = await response.json();
      setOrders(orders.map((order) => (order._id === editOrder._id ? updatedOrder : order)));
      closeEditModal();
    } catch (err) {
      setErrorMessage('Error updating order: ' + err.message);
    }
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

  const closeViewModal = () => {
    setViewOrder(null);
  };
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-container">
        <h1 className="admin-title">Order Management</h1>
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
                    <th>Actions</th>
                    <th>Orderd DAte</th>
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
        <div className="action-buttons">
          <button className="icon-btn" onClick={() => openEditModal(order)}>
            <FaEdit className="edit-icon" />
          </button>
          <button className="icon-btn" onClick={() => handleDelete(order._id)}>
            <FaTrash className="trash-icon" />
          </button>
          <button className="icon-btn" onClick={() => handleViewDetails(order._id)}>
            <FaEye className="view-icon" />
          </button>
        </div>
      </td>
      <td>{new Date(order.orderedDate).toLocaleDateString()}</td> {/* Display ordered date */}
      <td>{order.orderedTime}</td> {/* Display ordered time */}
    </tr>
  ))}
</tbody>

              </table>
            </div>
          </>
        )}
      </div>
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
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="modal-buttons">
                <button className="save-btn" type="submit">Save Changes</button>
                <button className="close-btn" type="button" onClick={closeEditModal}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {viewOrder && (
  <div className="modal-overlay">
    <div className="modal-container">
      <div className="modal-header">
        <h2>Order Details</h2>
        <button className="close-btn" onClick={closeViewModal}>X</button>
      </div>
      <div className="modal-body">
        <p><strong>Order ID:</strong> {viewOrder._id}</p>
        <p><strong>User:</strong> {viewOrder.userid?.name} ({viewOrder.userid?.email})</p>
        <p><strong>Status:</strong> {viewOrder.orderStatus}</p>
        <p><strong>Total Price:</strong> ${viewOrder.totalPrice}</p>
        
        <h3>Items:</h3>
        <ul className="order-items-list">
          {viewOrder.items.map((item, index) => (
            <li key={index} className="order-item">
              <img src={item.images?.[0]} alt={item.productName} className="order-item-image" />
              <div className="order-item-details">
                <strong>{item.productName}</strong>
                <p>{item.quantity} x ${item.price} = <strong>${item.quantity * item.price}</strong></p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminOrder;
  