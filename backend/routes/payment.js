const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require("path");
require('dotenv').config();
const fs = require("fs");
const Payment = require('../models/Payment.js');
const Product = require('../models/ProductS.js');
const Order = require('../models/Order.js');
const UserCartWishlist = require('../models/UserCartWishlist.js');
const authenticateToken = require("../middleware/authenticateToken");
const nodemailer = require('nodemailer');
const router = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create an Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || !currency) {
      return res.status(400).json({ message: "Amount and currency are required." });
    }

    const amountInPaise = amount * 100; 

    // Create the order
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order); // Return Razorpay order details to the frontend
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error });
  }
});

// Verify the Payment
router.post('/verify-payment', authenticateToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentAmount } = req.body;
  const userid = req.user.id;
  
  try {
    // Generate the expected signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(sign.toString())
        .digest("hex");

    // Verify the signature
    if (razorpay_signature !== expectedSign) {
      console.error("Payment signature mismatch:", razorpay_signature, expectedSign);  // Add error logging here
      return res.status(400).json({ message: "Payment signature mismatch" });
    }

    // If the signature matches, save the payment details in the database
    const payment = new Payment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user: userid,
      paymentAmount,  
    });

    await payment.save();
    
    res.json({
      message: "Payment Verified Successfully"
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

// Send Confirmation Email
const sendConfirmationEmail = (orderData, userEmail) => {
  const templatePath = path.join(__dirname, '../templates/OrderMail.html');
  let emailTemplate = fs.readFileSync(templatePath, "utf-8");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sornapriyamvathapentagon@gmail.com", 
      pass: "eouh aape mzwd gdcx"    
    }
  });
   
  let orderDetails = "";
  orderData.items.forEach(item => {
    orderDetails += `<p>${item.quantity} x ${item.productid} - ₹${item.price}</p>`;
  });

  const emailContent = emailTemplate
    .replace("{{name}}", orderData.shippingAddress.name)
    .replace("{{order_details}}", orderDetails)
    .replace("{{total_price}}", orderData.totalPrice)
    .replace("{{shipping_address}}", `${orderData.shippingAddress.name}<br>${orderData.shippingAddress.address}<br>${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}<br>${orderData.shippingAddress.country}`)
    .replace("{{payment_method}}", orderData.paymentMethod);

  const mailOptions = {
    from: `"RP" <${process.env.EMAIL_USER}>`,
    to: userEmail, 
    subject: 'Order Confirmation',
    html: emailContent,  
  };

  return transporter.sendMail(mailOptions);
};

router.post("/checkout", authenticateToken, async (req, res) => {
  const { items, shippingAddress, billingAddress, paymentMethod, totalPrice, userEmail, razorpay_order_id, razorpay_payment_id } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty." });
  }

  const missingFields = [];

  if (!shippingAddress) missingFields.push("shippingAddress");
  if (!paymentMethod) missingFields.push("paymentMethod");
  if (!totalPrice) missingFields.push("totalPrice");
  if (!razorpay_order_id) missingFields.push("razorpay_order_id");
  if (!razorpay_payment_id) missingFields.push("razorpay_payment_id");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}.`
    });
  }

  try {
    // Loop through cart items and fetch product details
    for (const item of items) {
      const product = await Product.findOne({ productid: item.productid });

      if (!product) {
        return res.status(400).json({ message: `Product with ID ${item.productid} not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.productName}. Only ${product.stock} available.`,
        });
      }

      // Add productName and other relevant fields from the product model
      item.productName = product.productName;  // Add product name to the item
      item.price = product.new_price;  // Add price (new_price) from the product model

      // Update product stock after the order
      product.stock -= item.quantity;
      await product.save();
    }

    // If no billing address, assume it is the same as shipping address
    const finalBillingAddress = billingAddress || shippingAddress;

    // Create a new order and save it to the database
    const newOrder = new Order({
      userid: userId,
      items,
      shippingAddress,
      billingAddress: finalBillingAddress,
      paymentMethod, 
      totalPrice,
      orderStatus: "Pending",
      paymentStatus: "Pending", // Initially set as Pending
      razorpay_order_id,
      razorpay_payment_id,  
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedOrder = await newOrder.save();
    
    // Clear the cart
    await UserCartWishlist.updateOne(
      { userid: userId },
      { $set: { items: [] } }
    );

    // Send confirmation email
    await sendConfirmationEmail(newOrder, userEmail);

    // Now update the payment with the orderId
    const payment = await Payment.findOne({
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
    });

    if (payment) {
      payment.orderId = savedOrder._id; // Update with the new orderId
      await payment.save();
    } else {
      console.error("Payment not found to associate with the order");
    }

    res.status(201).json({
      message: "Order placed successfully and cart cleared.",
      orderId: newOrder._id,
      orderDetails: newOrder,
    });
  } catch (err) {
    console.error("Error during checkout:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});


module.exports = router;

/*const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/ProductS"); // Assuming you have a Product model
const UserCartWishlist = require("../models/UserCartWishlist"); // Assuming cart model is here
require("dotenv").config();

// Initialize Razorpay instance with secure environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Create Razorpay Order (POST /create-order)
router.post("/create-order", async (req, res) => {
    try {
      const { amount, currency } = req.body;
  
      if (!amount || !currency) {
        return res.status(400).json({ message: "Amount and currency are required." });
      }
  
      // Convert amount to paise (assuming amount is in INR)
      const amountInPaise = amount * 100;
  
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: `receipt_${Date.now()}`,
      });
  
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Error creating order", error });
    }
  });
  // Verify Payment (POST /verify-payment)
router.post("/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
      const order = await Order.findOne({ razorpay_order_id });
  
      if (!order) {
        return res.status(404).json({ message: "Order not found!" });
      }
  
      // Check if the payment has already been processed
      if (order.paymentStatus === "Paid") {
        return res.status(400).json({ message: "Payment already processed for this order." });
      }
  
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
  
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Payment verification failed!" });
      }
  
      // Save Payment Details
      const payment = new Payment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: order.amount, // Store amount as well for reference
        currency: order.currency, // Store currency
      });
  
      await payment.save();
  
      // Update Order Status to "Paid"
      order.paymentStatus = "Paid";
      order.orderStatus = "Processing"; // You can adjust this based on your order flow
      order.paymentMethod = "Razorpay";
      await order.save();
  
      res.json({ message: "Payment successful!", order });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Error verifying payment", error });
    }
  });
  // Checkout (POST /checkout)
router.post("/checkout", authenticateToken, async (req, res) => {
    const { items, shippingAddress, paymentMethod, totalPrice, userEmail } = req.body;
    const userId = req.user.id;
  
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }
  
    if (!shippingAddress || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields." });
    }
  
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const productDetails = [];
  
      // Loop through cart items to get product details
      for (const item of items) {
        const product = await Product.findOne({ productid: item.productid }).session(session);
  
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.productid} not found.` });
        }
  
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Not enough stock for ${product.productName}. Only ${product.stock} available.`,
          });
        }
  
        product.stock -= item.quantity;
        await product.save({ session });
  
        productDetails.push({
          productid: product.productid,
          productName: product.productName,
          images: product.images && product.images.length > 0 ? product.images[0] : "default.jpg", // Example fallback image
          price: product.new_price,
          quantity: item.quantity,
        });
  
        console.log("Product added to order:", productDetails[productDetails.length - 1]);
      }
  
      // Create a new order in the database
      const newOrder = new Order({
        userid: userId,
        items: productDetails,
        shippingAddress,
        paymentMethod,
        totalPrice,
        orderStatus: "Pending",
        paymentStatus: "Pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      await newOrder.save({ session });
  
      console.log("New order saved:", newOrder);
  
      // Clear the user's cart after placing the order
      await UserCartWishlist.updateOne(
        { userid: userId },
        { $set: { items: [] } }, // Empty the cart
        { session }
      );
  
      // Commit the transaction
      await session.commitTransaction();
  
      // Send confirmation email (optional step)
      await sendConfirmationEmail(newOrder, userEmail); // Make sure this function is defined
  
      res.status(201).json({
        message: "Order placed successfully and cart cleared.",
        orderId: newOrder._id,
        orderDetails: newOrder,
      });
    } catch (err) {
      console.error("Error during checkout:", err);
      await session.abortTransaction();
      res.status(500).json({ message: "Something went wrong. Please try again." });
    } finally {
      session.endSession();
    }
  });
  
module.exports = router;




const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require("path");
const mongoose = require('mongoose');
require('dotenv').config();
const fs = require("fs");
const Payment = require('../models/Payment.js');
const Product = require('../models/ProductS.js');
const Order = require('../models/Order.js');  
const UserCartWishlist = require('../models/UserCartWishlist.js'); 
const authenticateToken = require("../middleware/authenticateToken");
const nodemailer = require('nodemailer');
const router = express.Router();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

// Create an Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || !currency) {
      return res.status(400).json({ message: "Amount and currency are required." });
    }

    const amountInPaise = amount * 100; 

    // Create the order
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order); // Return Razorpay order details to the frontend
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating order", error });
  }
});

// Verify the Payment
router.post('/verify-payment', authenticateToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentAmount } = req.body; // Include paymentAmount here
  const userid = req.user.id;
  console.log("req.body", req.body); 

  try {
    // Generate the expected signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(sign.toString())
        .digest("hex");

    console.log("expectedSign", expectedSign); 

    // Verify the signature
    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Payment signature mismatch" });
    }

    // If the signature matches, save the payment details in the database
    const payment = new Payment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user: userid,
      paymentAmount,  
    });

    await payment.save();
    console.log("Payment Saved");
    // Respond with success
    res.json({
      message: "Payment Verified Successfully"
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});


 const sendConfirmationEmail = (orderData, userEmail) => {
  
    const templatePath = path.join(__dirname, '../templates/OrderMail.html');
    let emailTemplate = fs.readFileSync(templatePath, "utf-8");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: "sornapriyamvathapentagon@gmail.com", 
          pass: "eouh aape mzwd gdcx"    
      }
  });
   
    let orderDetails = "";
    orderData.items.forEach(item => {
      orderDetails += `<p>${item.quantity} x ${item.productid} - ₹${item.price}</p>`;
    });
  
    const emailContent = emailTemplate
      .replace("{{name}}", orderData.shippingAddress.name)
      .replace("{{order_details}}", orderDetails)
      .replace("{{total_price}}", orderData.totalPrice)
      .replace("{{shipping_address}}", `${orderData.shippingAddress.name}<br>${orderData.shippingAddress.address}<br>${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}<br>${orderData.shippingAddress.country}`)
      .replace("{{payment_method}}", orderData.paymentMethod);
  
    const mailOptions = {
      from: `"RP" <${process.env.EMAIL_USER}>`,
      to: userEmail, 
      subject: 'Order Confirmation',
      html: emailContent,  
    };
  
    return transporter.sendMail(mailOptions);
  };

// Checkout route to save the order in the database
router.post("/checkout", authenticateToken, async (req, res) => {
  const { items, shippingAddress, paymentMethod, totalPrice, userEmail, razorpay_order_id, razorpay_payment_id } = req.body;
  console.log("PM",paymentMethod);
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty." });
  }
  const missingFields = [];

  if (!items || items.length === 0) {
    missingFields.push("items");
  }

  if (!shippingAddress) {
    missingFields.push("shippingAddress");
  }

  if (!paymentMethod) {
    missingFields.push("paymentMethod");
  }

  if (!totalPrice) {
    missingFields.push("totalPrice");
  }

  if (!razorpay_order_id) {
    missingFields.push("razorpay_order_id");
  }

  if (!razorpay_payment_id) {
    missingFields.push("razorpay_payment_id");
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}.`
    });
  }

  if (!shippingAddress || !paymentMethod || !totalPrice || !razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ message: "Missing required fields Checkout." });
  }

  try {
    // Loop through cart items and fetch product details
    for (const item of items) {
      const product = await Product.findOne({ productid: item.productid });

      if (!product) {
        return res.status(400).json({ message: `Product with ID ${item.productid} not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.productName}. Only ${product.stock} available.`,
        });
      }

      // Add productName and other relevant fields from the product model
      item.productName = product.productName;  // Add product name to the item
      item.price = product.new_price;  // Add price (new_price) from the product model

      // Update product stock after the order
      product.stock -= item.quantity;
      await product.save();

      console.log("Product added to order:", product);
    }

    // Create a new order and save it to the database
    const newOrder = new Order({
      userid: userId,
      items,
      shippingAddress,
      paymentMethod, 
      totalPrice,
      orderStatus: "Pending",
      paymentStatus: "Paid",
      razorpay_order_id,  
      razorpay_payment_id,  
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedOrder = await newOrder.save();
    console.log("Saved Order:", savedOrder);  // Check the saved order in the console
    

    // Clear the cart
    await UserCartWishlist.updateOne(
      { userid: userId },
      { $set: { items: [] } } 
    );

    // Send confirmation email
    await sendConfirmationEmail(newOrder, userEmail);

    res.status(201).json({
      message: "Order placed successfully and cart cleared.",
      orderId: newOrder._id,
      orderDetails: newOrder,
    });
    console.log("ORder PLACED");
  } catch (err) {
    console.error("Error during checkout:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});


module.exports = router;
*/