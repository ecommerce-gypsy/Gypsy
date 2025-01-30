import React, { useState } from "react";
import "./Faq.css"; // Ensure this file exists in the same folder

const faqData = [
  { question: "How can I track my order?", answer: "You can track your order using the tracking ID sent to your email." },
  { question: "Do you provide Cash on Delivery (COD)?", answer: "Yes, we offer Cash on Delivery for selected locations." },
  { question: "How can I share my pictures for customization?", answer: "You can upload your images in the customization section during checkout." },
  { question: "Do you offer international shipping?", answer: "Yes, we ship worldwide. Additional charges may apply for international orders." },
  { question: "How much time does delivery take?", answer: "Delivery time varies based on location but typically takes 5-7 business days." },
  { question: "Is it possible to receive my order within 2-3 days?", answer: "Express shipping is available for certain locations at an additional cost." },
  { question: "What payment methods do you accept?", answer: "We accept credit cards, debit cards, PayPal, and UPI payments." },
  { question: "Can I cancel or modify my order after placing it?", answer: "Yes, you can cancel or modify your order within 24 hours of placing it." },
  { question: "Do you offer returns and exchanges?", answer: "Yes, we have a 7-day return policy. Please check our return policy page for more details." },
  { question: "Are your products eco-friendly?", answer: "Yes, we use sustainable materials and eco-friendly packaging." }
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      {faqData.map((faq, index) => (
        <div key={index} className="faq-item">
          <button className="faq-question" onClick={() => toggleFAQ(index)}>
            {faq.question} <span>{openIndex === index ? "▲" : "▼"}</span>
          </button>
          {openIndex === index && <p className="faq-answer">{faq.answer}</p>}
        </div>
      ))}
    </div>
  );
};

export default Faq;
