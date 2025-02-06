import React, { useState } from 'react';

const Payment = () => {
  const [amount, setAmount] = useState(0);

  const handlePayment = async () => {
    try {
      // Step 1: Get the order details from the backend using fetch
      const response = await fetch('http://localhost:5000/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }), // Send the amount to the backend
      });

      const order = await response.json(); // Get the order details from the backend

      // Step 2: Define Razorpay options
      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Your Razorpay Key ID
        amount: order.amount, // Amount in paise
        currency: order.currency,
        order_id: order.id,
        handler: async (paymentResponse) => {
          // Step 3: Handle the payment success response
          const { payment_id, order_id, signature } = paymentResponse;

          const verifyData = {
            payment_id,
            order_id,
            signature,
          };

          // Step 4: Send the payment details to the backend for verification using fetch
          const verifyResponse = await fetch('http://localhost:5000/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(verifyData),
          });

          const verifyResult = await verifyResponse.json();
          if (verifyResult === 'Payment verification successful') {
            alert('Payment Successful');
          } else {
            alert('Payment Verification Failed');
          }
        },
        prefill: {
          name: 'Customer Name', // User's name
          email: 'customer@example.com', // User's email
          contact: '9876543210', // User's contact
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open(); // Open the Razorpay payment modal
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initiation failed');
    }
  };

  return (
    <div>
      <h2>Payment Page</h2>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default Payment;
