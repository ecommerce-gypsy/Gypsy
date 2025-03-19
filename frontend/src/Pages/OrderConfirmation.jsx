import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const OrderConfirmation = () => {
  const { orderId } = useParams();  // Extract orderId from the URL
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
            'Authorization': `Bearer ${token}`, // Add token to headers
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
    return <div>Error: {error}</div>;
  }

  if (!orderDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Order Confirmation</h2>
      <p>Order ID: {orderDetails._id}</p>
      <p>Total Price: ₹{orderDetails.totalPrice}</p>
      <p>Payment Status: {orderDetails.paymentStatus}</p>
      <h3>Shipping Address</h3>
      <p>{orderDetails.shippingAddress.name}</p>
      <p>{orderDetails.shippingAddress.address}</p>
      <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}</p>
      <p>{orderDetails.shippingAddress.country}</p>
      {/* Render ordered items */}
      <h3>Ordered Items</h3>
      <ul>
        {orderDetails.items.map(item => (
          <li key={item._id}> {/* Use item._id instead of item.productId */}
            {item.productName} - {item.quantity} x ₹{item.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderConfirmation;
