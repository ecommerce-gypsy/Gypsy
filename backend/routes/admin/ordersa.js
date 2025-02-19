const express = require('express');
const Order = require('../../models/Order'); 
const router = express.Router();
const User = require('../../models/Users');  
const auth = require('../../middleware/auth');  // Authentication middleware
const isAdmin = require('../../middleware/isAdmin'); 


// Get all orders
router.get('/', auth, isAdmin,async (req, res) => {
  try {
    const orders = await Order.find().populate('userid', 'name email');
    console.log(orders); // Log to check if userid is populated properly
    res.status(200).json(orders);
    
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

// Get specific order by ID
router.get('/:id',auth, async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id)
      .populate('userid', 'name email')
      .populate('customDesign', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
});

// Update order status
router.put('/:id/status',auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  // Validate the status
  if (!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(orderStatus)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus, updatedAt: Date.now() },
      { new: true } // Return the updated order
    ).populate('userid', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status', error: err.message });
  }
});

// Delete an order
router.delete('/:id',auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting order', error: err.message });
  }
});

module.exports = router;
