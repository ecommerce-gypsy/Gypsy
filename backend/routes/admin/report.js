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

    // Set 'endDate' as today's date if not provided
    const end = new Date(endDate || new Date());  // Defaults to today if endDate is not provided
    end.setHours(23, 59, 59, 999); // Set to the last millisecond of the current day

    // Set 'startDate' as 30 days before 'endDate' if not provided
    const start = new Date(startDate || end); // Defaults to endDate if startDate is not provided
    if (!startDate) {
      start.setDate(end.getDate() - 30); // Subtract 30 days for default start date
    }
    start.setHours(0, 0, 0, 0); // Set to the first millisecond of the start day

    // Log start and end dates for debugging
    console.log('Start date:', start);
    console.log('End date:', end);

    // Fetch orders from the database that fall within the date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }, // Query for orders created within the date range
    }).populate('userid', 'name email'); // Populate user details if needed

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
