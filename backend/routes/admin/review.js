const express = require('express');
const mongoose = require('mongoose');
const Review = require('../../models/Review');
const User = require('../../models/Users');
const auth = require('../../middleware/auth');  
const adminMiddleware = require('../../middleware/isAdmin'); 

const router = express.Router();

// **Get all reviews for admin**
router.get('/', auth, adminMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find().populate('userid', 'name email'); // Populate user details
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// **Get reviews by status (active/inactive)**
router.get('/status/:status', auth, adminMiddleware, async (req, res) => {
  const { status } = req.params; // 'true' or 'false'
  try {
    const reviews = await Review.find({ status: status === 'true' }).populate('userid', 'name email');
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// **Update review status only**
router.put('/:id', auth, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;  // Only update the status
console.log(req.body);
  try {
    // Find and update only the status of the review
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { status },  
      { new: true } 
    ).populate('userid', 'name email');  // Populate user info on the updated review

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(updatedReview); // Send the updated review with populated user details
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});


// **Delete review**
router.delete('/:id', auth, adminMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// **Create a new review (if needed)**
router.post('/review', async (req, res) => {
  const { userid, productid, reviewText, rating } = req.body;
  try {
    const newReview = new Review({
      userid,
      productid,
      reviewText,
      rating,
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: "Error creating review", error: err });
  }
});

module.exports = router;
