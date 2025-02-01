const User = require('../models/Users');  // Assuming this path is correct

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);  // Assuming you store user ID in req.user
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    next();  // Continue to the next middleware or route handler
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = isAdmin;
