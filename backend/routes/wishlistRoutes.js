const express = require('express');
const router = express.Router();
const Product = require('../models/ProductS');
const UserCartWishlist = require('../models/UserCartWishlist');
const authenticateToken = require('../middleware/authenticateToken');  // Adjust path based on your project structure

// Add product to wishlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productid, productName, images, new_price } = req.body;
    const userid = req.user.id;

    const product = await Product.findOne({ productid });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const result = await UserCartWishlist.updateOne(
      { userid },
      {
        $addToSet: {
          items: {
            productid,
            productName,
            new_price,
            images,
            isInCart: false,
          },
        },
      },
      { upsert: true }
    );

    res.status(200).json({ success: true, message: 'Product added to Wishlist', result });

  } catch (error) {
    console.error('Error adding product to Wishlist:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// Remove product from wishlist
router.post('/remove', authenticateToken, async (req, res) => {
  try {
    const { productid } = req.body;
    const userid = req.user.id;

    const product = await Product.findOne({ productid });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cart = await UserCartWishlist.findOne({ userid });
    const productInCart = cart.items.find(item => item.productid === productid && item.isInCart === false);

    if (!productInCart) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }

    const result = await UserCartWishlist.updateOne(
      { userid, 'items.productid': productid, 'items.isInCart': false },
      {
        $pull: { items: { productid, isInCart: false } },
      }
    );

    res.status(200).json({ success: true, message: 'Product removed from wishlist' });

  } catch (error) {
    console.error('Error removing product from wishlist:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// Get wishlist items
router.get('/get', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await UserCartWishlist.findOne({ userid: userId });

    if (!cart) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    const itemsInWishlist = cart.items.filter(item => item.isInCart === false);
    res.json({ items: itemsInWishlist });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching wishlist." });
  }
});

module.exports = router;
