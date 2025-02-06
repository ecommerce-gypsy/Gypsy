const mongoose = require('mongoose');
const Order = require('./Order');  
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
        match: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, // Email format validation
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        default: "", 
    },
    phone_number: {
        type: String,
        default: "",  
    },
    role: {
        type: String,
        enum: ['user', 'admin','vendor'],
        default: 'user',  // Default role is 'user'
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Use "userSchema" for the model name, not the string "Users"
//module.exports = mongoose.model('Users', userSchema);
const User = mongoose.model('User', userSchema);
module.exports = User;