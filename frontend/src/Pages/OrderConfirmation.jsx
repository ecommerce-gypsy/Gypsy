import React, { useEffect, useState } from 'react';

const OrderConfirmation = ({ orderId }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4000/admin/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Order not found');
        }
        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!orderDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Order Confirmation</h2>
      <p>Order ID: {orderDetails.orderId}</p>
      <p>Total Price: {orderDetails.totalPrice}</p>
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
          <li key={item.productId}>
            {item.productId} - {item.quantity} x {item.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderConfirmation;
