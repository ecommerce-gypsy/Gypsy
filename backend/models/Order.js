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
        productName: { 
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
      ref: 'CustomDesign', 
      default: null,
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: false }, 
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    billingAddress: { 
      name: { type: String, required: true },
      phone: { type: String, required: false }, 
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
    orderedDate: {
      type: Date,
      default: Date.now, // Automatically sets to current date and time
    },
    orderedTime: {
      type: String,
      default: () => new Date().toLocaleTimeString(), // Automatically sets to current time
    }, // Optional for now
  },


  { timestamps: true } 
);

module.exports = mongoose.model('Order', OrderSchema);
