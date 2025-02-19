// authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const nodemailer = require('nodemailer');
const fs = require('fs');

const path = require('path');
//const sendSignupMail = require('../utils/sendSignupMail');
const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    let check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ success: false, message: "User with the same email already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const lastUser = await Users.findOne().sort({ userid: -1 });
    const newUserId = lastUser ? lastUser.userid + 1 : 1;

    const user = new Users({
      userid: newUserId,
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ user: { id: user.id, role: user.role, user_email: user.email } }, 'secret-ecom', { expiresIn: '1h' });

    await sendSignupMail(req.body.name, req.body.email); // Send welcome email

    res.json({ 
      success: true, 
      token, 
      username: user.name,  // Add username (name)
      email: user.email,    // Add email
      redirectUrl: '/' // Optional redirect URL based on user role or preference
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email });

    if (user) {
      const passCompare = await bcrypt.compare(req.body.password, user.password);
      
      if (passCompare) {
        const token = jwt.sign({ user: { id: user.id, role: user.role } }, 'secret-ecom', { expiresIn: '1h' });

        let redirectUrl = '';
        if (user.role === 'admin') {
          redirectUrl = '/admin';
        } else if (user.role === 'user') {
          redirectUrl = '/';
        } else if (user.role === 'vendor') {
          redirectUrl = '/anklets';
        }

        res.json({
          success: true,
          token,
          username: user.name,
          redirectUrl, 
          email: user.email
        });
      } else {
        res.status(400).json({ success: false, message: "Wrong password" });
      }
    } else {
      res.status(400).json({ success: false, message: "Email not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Function to send signup mail
const sendSignupMail = async (name, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sornapriyamvathapentagon@gmail.com", // Your email
        pass: "eouh aape mzwd gdcx" // Your app password
      }
    });

    const emailTemplate = fs.readFileSync(path.join(__dirname, "emailTemplate.html"), "utf-8");
    const customizedTemplate = emailTemplate.replace("{{name}}", name);

    const mailOptions = {
      from: '"RP" <sornapriyamvathapentagon@gmail.com>',
      to: email,
      subject: "Welcome to Your Store!",
      html: customizedTemplate
    };

    await transporter.sendMail(mailOptions);
    console.log("Signup email sent to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Export the router
module.exports = router;
