const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Razorpay instance using keys from environment variables
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to create a payment order
router.post('/order', async (req, res) => {
  const { amount } = req.body; // Amount in INR (user input)

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
    currency: 'INR',
    receipt: 'receipt#1', // Unique receipt ID
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.json(order); // Send the Razorpay order details back to the frontend
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).send('Error creating Razorpay order');
  }
});

// Route to verify payment signature
router.post('/verify', (req, res) => {
  const { payment_id, order_id, signature } = req.body;

  // Construct the expected signature based on Razorpay's documentation
  const body = order_id + '|' + payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  // Compare the expected signature with the received one
  if (expectedSignature === signature) {
    res.status(200).send('Payment verification successful');
  } else {
    res.status(400).send('Payment verification failed');
  }
});

module.exports = router;
