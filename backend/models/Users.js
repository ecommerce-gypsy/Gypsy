const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    userid: { 
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, 
    },
    password: {
      type: String,
      required: true,
    },
    // Address updated to include the new fields
    address: [{
      street: {
        type: String,
      },
      landmark: {  // Ensure landmark is included
        type: String,
        default: "", 
      },
      city: {
        type: String,
      },
      state:{
        type: String,
      },
      pincode: {  // Ensure pincode is included
        type: String,
      },
      country: {
        type: String,
      },
      phone: {
        type: String,
        default: "", 
      },
    }],
    phone_number: {
      type: String,
      default: "",  
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'vendor'],
      default: 'user',  // Default role is 'user'
    },
    date: {
      type: Date,
      default: Date.now,
    },
    resetToken:{
      type : String,
    },
    resetTokenExpiration: { type: Date, default: null },
}, { timestamps: true 
  });
  
  const User = mongoose.model('User', userSchema);
  module.exports = User;
  

