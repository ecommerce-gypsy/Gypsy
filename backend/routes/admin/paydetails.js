const express = require('express');
  const mongoose = require('mongoose');
  const Order = require('../../models/Order');
  const Product = require('../../models/ProductS');
  const Payment = require('../../models/Payment');
  const router = express.Router();
  const auth = require('../../middleware/auth');  
  const isAdmin = require('../../middleware/isAdmin'); 
  
  // Get all payments
router.get('/', auth,isAdmin, async (req, res) => {
    try {
      // Find all payments and populate the associated user and order
      const payments = await Payment.find()
        .populate('user', 'email name')  // Populate user details (email and name)
        .populate('order', 'orderNumber totalAmount items')  // Populate order details
        .exec();
  
      res.status(200).json(payments);
    } catch (err) {
      console.error('Error fetching payments:', err);
      res.status(500).json({ message: 'Error fetching payments' });
    }
  });
  
  // Get Payment Details
  router.get('/:paymentId',  auth, isAdmin, async (req, res) => {
    const { paymentId } = req.params;
    const userId = req.user.id; // Assuming you have a JWT authentication middleware to get the user's ID
  
    try {
      // Find the payment using the paymentId, and populate the order and user fields
      const payment = await Payment.findById(paymentId)
        .populate('order')  // Populate the associated order
        .populate('user')   // Populate the associated user
        .exec();
  
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found.' });
      }
  
      // Ensure the payment belongs to the authenticated user
      if (payment.user._id.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'You are not authorized to view this payment.' });
      }
  
      // Return the payment details
      res.status(200).json({ payment });
    } catch (err) {
      console.error('Error fetching payment:', err);
      res.status(500).json({ message: 'Something went wrong while fetching payment details.' });
    }
  });
  // Delete a payment
router.delete('/:paymentId', auth, isAdmin, async (req, res) => {
    const { paymentId } = req.params;
  
    try {
      // Find the payment by ID and delete it
      const payment = await Payment.findByIdAndDelete(paymentId);
  
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
  
      res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (err) {
      console.error('Error deleting payment:', err);
      res.status(500).json({ message: 'Error deleting payment' });
    }
  });
  
    
  module.exports = router;