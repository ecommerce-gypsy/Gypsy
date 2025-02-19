const express = require('express');
const router = express.Router();
const Product = require('../models/ProductS');
const UserCartWishlist = require('../models/UserCartWishlist');
const authenticateToken = require('../middleware/authenticateToken');

// Add product to cart
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
            isInCart: true,
          },
        },
      },
      { upsert: true }
    );

    res.status(200).json({ success: true, message: 'Product added to Cart', result });

  } catch (error) {
    console.error('Error adding product to Cart:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// Remove product from cart
router.post('/remove', authenticateToken, async (req, res) => {
  try {
    const { productid } = req.body;
    const userid = req.user.id;

    const product = await Product.findOne({ productid });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cart = await UserCartWishlist.findOne({ userid });
    const productInCart = cart.items.find(item => item.productid === productid && item.isInCart === true);

    if (!productInCart) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    const result = await UserCartWishlist.updateOne(
      { userid, 'items.productid': productid, 'items.isInCart': true },
      {
        $pull: { items: { productid, isInCart: true } },
      }
    );

    res.status(200).json({ success: true, message: 'Product removed from cart' });

  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

// Get cart items
router.get('/get', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await UserCartWishlist.findOne({ userid: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    const itemsInCart = cart.items.filter(item => item.isInCart === true);
    res.json({ items: itemsInCart });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cart." });
  }
});

// Update cart item quantity
router.post('/update', authenticateToken, async (req, res) => {
  const { productid, quantity } = req.body;
  
  try {
    const userId = req.user.id;
    const userCart = await UserCartWishlist.findOne({ userid: userId });

    if (!userCart) {
      return res.status(404).json({ message: "User cart not found" });
    }

    const cartItem = userCart.items.find(item => item.productid === productid && item.isInCart === true);

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart with isInCart set to true" });
    }

    // Fetch product to check available stock
    const product = await Product.findOne({ productid });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure requested quantity does not exceed stock
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items are available in stock.` });
    }

    cartItem.quantity = quantity;
    await userCart.save();

    res.json({ message: "Cart updated successfully", updatedCart: userCart });

  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

module.exports = router;
