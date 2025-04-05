
const express = require('express');
const router = express.Router();

// Rule-based Q&A database
const chatbotRules = [
  {
    id: 1,
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy for unused items."
  },
  {
    id: 2,
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days."
  },

  {
    id: 4,
    question: "What payment methods do you accept?",
    answer: "We accept Razorpay."
  },
  {
    id: 6,
    question: "Do you have a physical store?",
    answer: "We're currently online-only, but you can visit our showroom by appointment."
  },
  {
    id: 7,
    question: "What are your customer service hours?",
    answer: "Our support team is available Monday-Friday, 9AM-5PM EST."
  },
  {
    id: 8,
    question: "Can I cancel my order?",
    answer: "You can cancel within 1 hour of placing your order if it hasn't shipped yet."
  },
  {
    id: 9,
    question: "Do you offer discounts for bulk orders?",
    answer: "Yes, please contact our sales team at sales@example.com for bulk pricing."
  },
  {
    id: 10,
    question: "How do I contact customer support?",
    answer: "Email us at roshnivr06@gmail.com or call 9360495115."
  }

  // Add more Q&A pairs
];

// Get all predefined questions
router.get('/questions', (req, res) => {
  res.json(chatbotRules.map(rule => ({ id: rule.id, question: rule.question })));
});

// Get answer by question ID
router.get('/answer/:id', (req, res) => {
  const questionId = parseInt(req.params.id);
  const rule = chatbotRules.find(rule => rule.id === questionId);
  
  if (!rule) {
    return res.status(404).json({ message: "Question not found" });
  }
  
  res.json({ answer: rule.answer });
});

module.exports = router;
