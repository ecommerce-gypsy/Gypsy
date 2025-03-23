const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const ProductS = require('../models/ProductS');

const router = express.Router();

router.get('/db', async (req, res) => {
  try {
    const currentDate = new Date();
    const fourMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 4));

    // Sales Summary for the Last 4 Months
    const salesData = await Order.aggregate([
      { $match: { orderedDate: { $gte: fourMonthsAgo } } },
      { $group: { _id: { $month: '$orderedDate' }, totalSales: { $sum: '$totalPrice' } } },
      { $sort: { _id: 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesSummary = salesData.map((data) => ({
      month: monthNames[data._id - 1],
      sales: data.totalSales,
    }));

    // Count of Pending Orders
    const newOrdersCount = await Order.countDocuments({ orderStatus: 'Pending' });

    // Total Income (Paid Orders)
    const totalIncome = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Total Expense (Sum of all order prices)
    const totalExpense = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Get Top-Selling Products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productid', totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
      { $sort: { totalSales: -1 } },
      { $limit: 3 }
    ]);

    // Fetch Product Details
    const productIds = topProducts.map((item) => item._id);
    const topProductDetails = await ProductS.find({ productid: { $in: topProducts.map((item) => Number(item._id)) } });

    // Merge product names with top-selling data
    const detailedTopProducts = topProducts.map((product) => {
      const productDetails = topProductDetails.find((p) => p.productid === product._id);
      return {
        productName: productDetails ? productDetails.productName : 'Unknown Product',
        totalSales: product.totalSales,
      };
    });

    // **Category-wise Sales for Pie Chart**
    const categorySales = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productid',
          foreignField: 'productid',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Format pie chart data
    const pieChartData = categorySales.map((item) => ({
      category: item._id || 'Unknown',
      sales: item.totalSales,
    }));

    // Response with dashboard data
    res.json({
      salesSummary,
      newOrders: newOrdersCount,
      totalIncome: totalIncome[0]?.total || 0,
      totalExpense: totalExpense[0]?.total || 0,
      topProducts: detailedTopProducts,
      pieChartData, // **Newly Added Data for Pie Chart**
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

module.exports = router;
