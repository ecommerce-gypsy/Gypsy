// authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
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

    await sendSignupMail(req.body.name, req.body.email); 

    res.json({ 
      success: true, 
      token, 
      username: user.name,  
      email: user.email,    
      redirectUrl: '/' 
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
        user: "sornapriyamvathapentagon@gmail.com", 
        pass: "eouh aape mzwd gdcx" 
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

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Email not found" });
    }

    const resetToken = jwt.sign({ user: { id: user.id } }, 'secret-ecom', { expiresIn: '1h' });
console.log(resetToken);
    await sendResetPasswordMail(user.name, user.email, resetToken);

    res.json({
      success: true,
      message: "Password reset email sent. Please check your inbox."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, 'secret-ecom');

    const user = await Users.findById(decoded.user.id);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password has been reset successfully."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

const sendResetPasswordMail = async (name, email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sornapriyamvathapentagon@gmail.com", 
        pass: "eouh aape mzwd gdcx" 
      }
    });

    const resetUrl = `http://localhost:4000/reset-password?token=${resetToken}`;

    const emailTemplate = fs.readFileSync(path.join(__dirname, "../resetEmailTemplate.html"), "utf-8");
    const customizedTemplate = emailTemplate.replace("{{name}}", name).replace("{{resetUrl}}", resetUrl);

    const mailOptions = {
      from: '"RP" <sornapriyamvathapentagon@gmail.com>',
      to: email,
      subject: "Password Reset Request",
      html: customizedTemplate
    };

    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", email);
  } catch (error) {
    console.error("Error sending reset password email:", error);
  }
};

module.exports = router;
