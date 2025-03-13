const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Users = require('../models/Users');
const Review = require('../models/Review');
const authenticateToken = require('../middleware/authenticateToken');  

router.post('/', authenticateToken, async (req, res) => {
    const { productid, rating, reviewText } = req.body;
    const userId = req.user.id;  

    try {

        const order = await Order.findOne({
            userid: userId,
            'items.productid': productid,
            orderStatus: 'Delivered',  
        });
        console.log(order);

        if (!order) {
            return res.status(400).json({ message: 'You must purchase this product before reviewing it.' });
        }

       
        const newReview = new Review({
            userid: userId,
            productid: productid,
            rating: rating,
            reviewText: reviewText,
        });

        await newReview.save();
        res.status(201).json({ message: 'Review posted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Add this route to check if a user has purchased a product
router.get('/has-purchased/:productid', authenticateToken, async (req, res) => {
    const { productid } = req.params;
    const userId = req.user.id;  
  
    try {
      const order = await Order.findOne({
        userid: userId,
        'items.productid': productid,
        orderStatus: 'Delivered',
      });
  
      if (order) {
        return res.status(200).json({ hasPurchased: true });
      } else {
        return res.status(200).json({ hasPurchased: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
router.get('/:productid', async (req, res) => {
    const { productid } = req.params;
    const { rating, sort } = req.query; // Destructure rating and sort from query params

    try {
        let query = { productid: productid };

        // Apply rating filter if provided (filter by minimum rating)
        if (rating) {
            const minRating = parseInt(rating);
            if (minRating < 1 || minRating > 5) {
                return res.status(400).json({ message: 'Rating filter must be between 1 and 5.' });
            }
            query.rating = { $gte: minRating }; // Filter reviews where rating is greater than or equal to minRating
        }

        // Sorting logic
        let sortOrder = {}; // Default sort order (by creation date)
        if (sort) {
            if (sort === 'desc') {
                sortOrder = { rating: -1 }; // Sort by rating in descending order
            } else if (sort === 'asc') {
                sortOrder = { rating: 1 }; // Sort by rating in ascending order
            } else {
                return res.status(400).json({ message: 'Sort must be "asc" or "desc".' });
            }
        } else {
            // Default sorting by most recent
            sortOrder = { createdAt: -1 }; // If no sort specified, default to sorting by date descending
        }

        // Fetch reviews with the filter and sorting applied
        const reviews = await Review.find(query)
            .populate('userid', 'name email avatar') // Optional: Populate user info
            .sort(sortOrder);

        // If no reviews found for this product
        if (reviews.length === 0) {
            return res.status(200).json({
                reviews: [],
                reviewStats: {
                    averageRating: "0.00", // Send 0.00 for averageRating
                    numberOfReviews: 0, // Send 0 for numberOfReviews
                }
            });
        }

        // Calculate average rating
        const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        const reviewStats = {
            averageRating: avgRating.toFixed(2), // Rounded to 2 decimal places
            numberOfReviews: reviews.length,
        };

        // Send the reviews and stats
        res.status(200).json({ reviews, reviewStats });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;