const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require("dotenv");
const fs = require('fs');
const path = require('path');

dotenv.config();

const router = express.Router();
const otpStorage = new Map(); 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* =============================== OTP BASED SIGNUP =============================== */

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await Users.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); 
    otpStorage.set(email, { otp, expiresAt: Date.now() + 300000 }); 

    // Send OTP via Email
    await transporter.sendMail({
      from: `RP COLLECTIONS <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Signup",
      html: `<p>Your OTP for signup is: <b>${otp}</b></p><p>It is valid for 5 minutes.</p>`
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const sendSignupMail = async (name, email) => {
  try {
    console.log("Inside sendSignupMail function");

    const templatePath = path.join(__dirname, "../templates/emailTemplate.html");
    let emailTemplate = fs.readFileSync(templatePath, "utf-8");

    // Customizing the template with user's name
    const customizedTemplate = emailTemplate.replace("{{name}}", name);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"RP" <${process.env.EMAIL_USER}>`,   // Send from your email
      to: email,                                  // Send to the user email
      subject: "Welcome to Your Store!",          // Subject line
      html: customizedTemplate                    // HTML content of the email
    };

    console.log("Sending email to:", email);
    // Sending the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);

  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Verify OTP and Register User
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    // Check if OTP exists and is valid
    if (!otpStorage.has(email)) {
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    const storedOtpData = otpStorage.get(email);
    if (storedOtpData.otp !== parseInt(otp) || Date.now() > storedOtpData.expiresAt) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    otpStorage.delete(email); // Remove OTP after verification

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find the last user to generate new user ID
    const lastUser = await Users.findOne().sort({ userid: -1 });
    const newUserId = lastUser ? lastUser.userid + 1 : 1;

    // Create new user and save
    const user = new Users({
      userid: newUserId,
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ user: { id: user.id, email: user.email } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log("Before sending signup email");

    // Send signup confirmation email
    await sendSignupMail(name, email);

    console.log("Signup mail sent");

    // Respond with success and user data
    res.json({ success: true, token, username: user.name, email: user.email, redirectUrl: '/' });
    
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =============================== LOGIN =============================== */

router.post('/login', async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ success: false, message: "Email not found" });
    }

    const passCompare = await bcrypt.compare(req.body.password, user.password);
    
    if (!passCompare) {
      return res.status(400).json({ success: false, message: "Wrong password" });
    }

    const token = jwt.sign({ user: { id: user.id, email: user.email, role: user.role } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    let redirectUrl = user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/anklets' : '/';

    res.json({ success: true, token, username: user.name, email: user.email, redirectUrl });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =============================== PASSWORD RESET =============================== */

// Request Password Reset
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Email not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1-hour expiration
    await user.save();

    const resetLink = `http://localhost:3000/reset-password-form?token=${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`
    });

    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await Users.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Users.updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetToken: 1, resetTokenExpiration: 1 } // Remove token after reset
      }
    );

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Verify OTP Route

router.post('/verify-otp', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!otpStorage.has(email)) {
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    const storedOtpData = otpStorage.get(email);
    if (storedOtpData.otp !== parseInt(otp) || Date.now() > storedOtpData.expiresAt) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    otpStorage.delete(email); // Remove OTP after verification

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique user ID
    const lastUser = await Users.findOne().sort({ userid: -1 });
    const newUserId = lastUser ? lastUser.userid + 1 : 1;

    // Create and save new user
    const user = new Users({
      userid: newUserId,
      name,
      email,
      password: hashedPassword,
    });

    await user.save(); // Save user to DB

    // Generate JWT token
    const token = jwt.sign(
      { user: { id: user.id, email: user.email } },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      username: user.name,
      email: user.email,
      redirectUrl: "/",
      message: "OTP verified & account created successfully!",
    });
    console.log("Before sending signup email");

    // Send signup confirmation email
    await sendSignupMail(name, email);

    console.log("Signup mail sent");
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
