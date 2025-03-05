
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Extract token from URL

  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      console.log("Token being sent:", token); // Debugging
      const response = await fetch(`http://localhost:4000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Reset failed');

      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/authcard'), 3000);
    } catch (error) {
      setMessage(error.message || 'Something went wrong.');
    }
  };

  return (
    <div className="reset-password-form">
      <div className="form-wrapper">
        <h2>Enter New Password</h2>
        <form onSubmit={handleResetPassword}>
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordForm;


