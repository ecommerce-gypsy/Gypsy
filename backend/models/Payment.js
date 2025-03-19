const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PaymentSchema = new Schema({
    razorpay_order_id: {
        type: String,
        required: true,
    },
    razorpay_payment_id: {
        type: String,
        required: true,
    },
    razorpay_signature: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending',
    },
    paymentAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['Razorpay', 'Credit Card', 'Debit Card', 'UPI'],
        default: 'Razorpay',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Link the payment to a user
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order' // Ensure that every payment is linked to an order
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = model('Payment', PaymentSchema);
