const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');  // Assuming this is the model for orders

// Middleware for admin authentication (you already have this)
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');

// Sales report route with date range
router.get('/sales-report', auth, isAdmin, async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    // Handle the end date, default to current date if not provided
    const end = new Date(endDate || new Date());  
    end.setHours(23, 59, 59, 999);  // Set to the last millisecond of the end date

    // Handle the start date, default to 30 days before end date if not provided
    const start = new Date(startDate || end); 
    if (!startDate) {
      start.setDate(end.getDate() - 30);  // Subtract 30 days for default start date
    }
    start.setHours(0, 0, 0, 0);  // Set to the first millisecond of the start date

    // Log start and end dates for debugging
    console.log('Start date:', start);
    console.log('End date:', end);

    // Fetch orders from the database that fall within the date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }, 
    }).populate('userid', 'email');  // Populate user details if needed

    // Calculate the total sales and revenue
    const totalSales = orders.length;
    const totalRevenue = orders.reduce((total, order) => total + order.totalPrice, 0);

    // Return the sales report
    res.status(200).json({
      totalSales,
      totalRevenue,
      orders,  // Optionally include the list of orders as well
    });
  } catch (err) {
    console.error('Error generating sales report:', err);
    res.status(500).json({ message: 'Error generating sales report', error: err.message });
  }
});

module.exports = router;