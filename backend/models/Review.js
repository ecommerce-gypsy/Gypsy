const mongoose = require('mongoose');
const User = require('./Users'); // Assuming User model is already defined

const ReviewSchema = new mongoose.Schema({
  userid: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     required: true,
   },
  productid: {
    type: Number,
    ref: 'Product',  // The product being reviewed
    required: true,
  },
  reviewText: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,  // Rating should be between 1 and 5
  },
  status: {
    type: Boolean,
    default: true,  // Review can be marked as active/inactive (e.g., if it's flagged)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the Review model
module.exports = mongoose.model('Review', ReviewSchema);
