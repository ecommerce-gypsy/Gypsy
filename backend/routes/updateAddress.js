const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const Order = require('../models/Order');  
const authMiddleware = require('../middleware/auth');
const UserCartWishlist = require('../models/UserCartWishlist');
// Add address route
// Add address route
router.put('/add-address', authMiddleware, async (req, res) => {
  try {
    const { street, landmark, city, pincode, state, phone } = req.body;
    const userId = req.user.id;
console.log(req.body);
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add new address to the addresses array
    user.address.push({
      street,
      landmark,  // Ensure landmark is added
      city,
      pincode,   // Ensure pincode is added
      state,
      phone
    });

    const updatedUser = await user.save();
    res.status(200).json({
      message: 'Address added successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong, please try again later' });
  }
});

// Update address route
router.put('/update-address/:addressId', authMiddleware, async (req, res) => {
  try {
    const { street, landmark, city, pincode, country, phone } = req.body;
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.address.findIndex(address => address._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    user.address[addressIndex] = {
      ...user.address[addressIndex],
      street,
      landmark,  // Update landmark
      city,
      pincode,   // Update pincode
      country,
      phone
    };

    const updatedUser = await user.save();
    res.status(200).json({
      message: 'Address updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong, please try again later' });
  }
});

// Fetch user account details
router.get('/account', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      addresses: user.address,  // This will return all addresses as an array
    });
  } catch (error) {
    console.error("Error fetching account details:", error);
    res.status(500).json({ message: 'Error fetching account details' });
  }
});

router.delete('/delete-address/:addressId', authMiddleware, async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id;

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the address from the array
    user.address = user.address.filter(address => address._id.toString() !== addressId);
    await user.save();

    res.status(200).json({
      message: 'Address deleted successfully',
      user: user,  // Send the updated user object with the addresses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong, please try again later' });
  }
});


// Fetch orders for a specific user
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is decoded from the token

    // Find orders for this user
    const orders = await Order.find({ userid: userId }).populate('items.productid').exec(); // Populate product details (optional)

    if (!orders) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }

    // Respond with the orders
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});

module.exports = router;
