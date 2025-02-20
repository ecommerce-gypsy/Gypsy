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

    try {
       
        const reviews = await Review.find({ productid: productid }).populate('userid', 'name');  

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this product.' });
        }

        res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
module.exports = router;
