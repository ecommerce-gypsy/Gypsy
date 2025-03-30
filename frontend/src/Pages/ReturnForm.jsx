import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const ReturnForm = () => {
  const [reason, setReason] = useState('');
  const [condition, setCondition] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const { orderId, productId } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderId || !productId) {
      setMessage('Error: Missing order or product information');
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setMessage('Error: Please log in to submit a return request');
        return;
      }

      const response = await fetch('http://localhost:4000/api/return/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          productId,
          reason,
          condition,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Return request failed');
      }

      const data = await response.json();
      setMessage('Return request successfully submitted!');
      setReason('');
      setCondition('');
    } catch (error) {
      setMessage('Error submitting return request: ' + error.message);
    }
  };

  return (
    <div className="return-form-container">
      <h3>Request Return</h3>
      <p>Order ID: {orderId || 'N/A'}</p>
      <p>Product ID: {productId || 'N/A'}</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Reason for Return:</label>
          <textarea
            placeholder="Reason for return"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows="4"
            style={{ width: '100%', margin: '10px 0' }}
          />
        </div>
        <div>
          <label>Product Condition:</label>
          <input
            type="text"
            placeholder="Condition of product (e.g., New, Damaged)"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
            style={{ width: '100%', margin: '10px 0' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 16px', background: '#FF5733', color: 'white', border: 'none', borderRadius: '4px' }}>
          Submit Return Request
        </button>
      </form>
      {message && <p style={{ color: message.includes('Error') ? 'red' : 'green', marginTop: '10px' }}>{message}</p>}
    </div>
  );
};

export default ReturnForm;