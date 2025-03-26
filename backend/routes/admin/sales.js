const express = require('express');
const mongoose = require('mongoose');
const Order = require('../../models/Order');
const Product = require('../../models/ProductS');
const Payment = require('../../models/Payment');
const router = express.Router();
const auth = require('../../middleware/auth');  
const isAdmin = require('../../middleware/isAdmin'); 

// Route to get total revenue
router.get('/admin/total-revenue', async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: ['Delivered', 'Shipped'] }, // Consider only delivered or shipped orders for revenue calculation
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ]);

    res.json({ totalRevenue: totalRevenue[0] ? totalRevenue[0].totalRevenue : 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to get total orders per month
router.get('/admin/orders-per-month', async (req, res) => {
  try {
    const ordersPerMonth = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' }, // Group by month (1 to 12)
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ]);

    res.json({ ordersPerMonth });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to get total orders by status
router.get('/admin/orders-by-status', async (req, res) => {
  try {
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus', // Group by order status
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    res.json({ ordersByStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Fetch pending orders
router.get('/pending-orders', auth, isAdmin, async (req, res) => {
    try {
      // Count how many orders are marked as 'Pending'
      const pendingOrdersCount = await Order.countDocuments({ orderStatus: 'Pending' });
  
      // Return the count of pending orders
      res.status(200).json({ pendingOrdersCount });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching pending orders', error: err.message });
    }
  });
  
  
  router.get('/out-of-stock', auth, isAdmin, async (req, res) => {
    try {
      // Count how many products have stock equal to 0
      const outOfStockCount = await Product.countDocuments({ stock: 0 });
  
      // Return the count of out-of-stock products
      res.status(200).json({ outOfStockCount });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching out of stock products', error: err.message });
    }
  });
  // Get Payment Details
router.get('/payment/:paymentId',  auth, isAdmin, async (req, res) => {
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

  
module.exports = router;
