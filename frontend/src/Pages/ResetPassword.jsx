
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import './ResetPassword.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reset failed');

      setMessage('A reset link has been sent to your email.');
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="form-wrapper">
        <h2>Reset Password</h2>
        <p>Enter your email to receive a password reset link.</p>
        <form onSubmit={handleReset}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
        {message && <p className="message">{message}</p>}
        <p onClick={() => navigate('/login')} className="back-to-login">
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;


