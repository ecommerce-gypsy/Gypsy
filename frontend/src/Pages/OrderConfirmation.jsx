import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './OrderConfirmation.css'; // Import the CSS file

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4000/orderscon/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Order not found or Unauthorized');
        }

        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!orderDetails) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h2>Order Confirmation</h2>
          <div className="confirmation-badge">Order Placed Successfully</div>
        </div>
        
        <div className="order-summary">
          <div className="summary-item">
            <span className="summary-label">Order ID:</span>
            <span className="summary-value">{orderDetails._id}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Price:</span>
            <span className="summary-value">₹{orderDetails.totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Payment Status:</span>
            <span className={`status-badge ${orderDetails.paymentStatus.toLowerCase()}`}>
              {orderDetails.paymentStatus}
            </span>
          </div>
        </div>

        <div className="shipping-section">
          <h3>Shipping Address</h3>
          <div className="shipping-details">
            <p>{orderDetails.shippingAddress.name}</p>
            <p>{orderDetails.shippingAddress.address}</p>
            <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}</p>
            <p>{orderDetails.shippingAddress.country}</p>
          </div>
        </div>

        <div className="ordered-items">
          <h3>Ordered Items</h3>
          <ul className="items-list">
            {orderDetails.items.map(item => (
              <li key={item._id} className="item-card">
                <div className="item-info">
                  <span className="item-name">{item.productName}</span>
                  <span className="item-quantity">{item.quantity} × ₹{item.price.toFixed(2)}</span>
                </div>
                <div className="item-total">₹{(item.quantity * item.price).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;