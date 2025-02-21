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

router.get('/:productid', async (req, res) => {
    const { productid } = req.params;
    const { rating, sort } = req.query; 

    try {
        let query = { productid: productid };

        if (rating) {
            const minRating = parseInt(rating);
            if (minRating < 1 || minRating > 5) {
                return res.status(400).json({ message: 'Rating filter must be between 1 and 5.' });
            }
            query.rating = { $gte: minRating }; 
        }

        
        let sortOrder = {}; 
        if (sort) {
            if (sort === 'desc') {
                sortOrder = { rating: -1 }; 
            } else if (sort === 'asc') {
                sortOrder = { rating: 1 }; 
            } else {
                return res.status(400).json({ message: 'Sort must be "asc" or "desc".' });
            }
        } else {
            
            sortOrder = { createdAt: -1 }; 
        }

        // Fetch reviews with the filter and sorting applied
        const reviews = await Review.find(query)
            .populate('userid', 'name email avatar') 
            .sort(sortOrder);

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this product.' });
        }

        // Calculate average rating
        const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        const reviewStats = {
            averageRating: avgRating.toFixed(2),
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
