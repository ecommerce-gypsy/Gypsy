const mongoose = require('mongoose');
const User = require('../models/Users');

const OrderSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productid: {
          type: Number,
          required: true,
        },
        productName: { // ✅ Added product name
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        images: [
          {
            type: String,
          },
        ],
      },
    ],
    customDesign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomDesign', // ✅ Ensure this references the correct model
      default: null,
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: false }, // ✅ Optional phone number
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['Razorpay', 'Credit Card', 'Debit Card', 'UPI'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    razorpay_order_id: { type: String, required: false },
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Order', OrderSchema);
