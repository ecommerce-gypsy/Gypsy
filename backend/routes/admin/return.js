const express = require('express');
const router = express.Router();
const Return = require('../../models/Return');
const authMiddleware = require('../../middleware/auth');
const Product = require('../../models/ProductS'); // Assuming you have authentication middleware

// Route to create a return
router.post('/returns', authMiddleware, async (req, res) => {
  const { orderId, productId, reason, condition } = req.body;
  const userId = req.user.id; // Assuming authMiddleware adds user to req

  try {
    // Basic validation
    if (!orderId || !productId || !reason || !condition) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newReturn = new Return({
      orderId,
      userId,
      productId,
      reason,
      condition,
      status: 'Pending', // Initial status
      createdAt: new Date(),
    });

    const savedReturn = await newReturn.save();
    res.status(201).json({
      success: true,
      return: savedReturn,
      message: 'Return request created successfully'
    });
  } catch (err) {
    console.error('Error creating return:', err);
    res.status(500).json({ error: 'Server error, unable to create return' });
  }
});

// Route to update return status
router.patch('/returns/:returnId', authMiddleware, async (req, res) => {
  const { status } = req.body;
  
  try {
    // Validate status
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided' });
    }

    const returnRequest = await Return.findByIdAndUpdate(
      req.params.returnId,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!returnRequest) {
      return res.status(404).json({ error: 'Return request not found' });
    }

    res.status(200).json({
      success: true,
      return: returnRequest,
      message: 'Return status updated successfully'
    });
  } catch (err) {
    console.error('Error updating return:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/returns/user', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    
    try {
      // Ensure the logged-in user is trying to access only their returns
      if (req.user.id !== userId) {
        return res.status(403).json({ error: 'Forbidden: You can only access your own returns' });
      }
  
      const returns = await Return.find({ userId })
        .sort({ createdAt: -1 }); // Sorting by creation date in descending order
  
      res.status(200).json({
        success: true,
        returns
      });
    } catch (err) {
      console.error('Error fetching returns:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
// Optional: Get all returns for a user
router.get('/returns', authMiddleware, async (req, res) => {
  try {
    const returns = await Return.find()
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      returns
    });
  } catch (err) {
    console.error('Error fetching returns:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;