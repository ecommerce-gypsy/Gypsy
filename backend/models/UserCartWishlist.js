
const mongoose = require('mongoose');

const userCartWishlistSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', 
    required: true,
  },
  
  items: [
    {
      productid: {
       
        type:Number,
        required: true,
      },
    
      quantity: {
        type: Number,
        default: 0, 
        min: 0,
      },
      isInCart: {
        type: Boolean,
        required: true,
        default: false, 
      },productName:{ 
        type: String, 
        required: true },
      images: [{
        type: String,  // URL or file path for product images
      }],
     new_price: { type: Number, required: true },
      addedAt: {
        type: Date,
        default: Date.now, 
      },
    },
  ],
});

const UserCartWishlist = mongoose.model('UserCartWishlist', userCartWishlistSchema);
module.exports = UserCartWishlist;
