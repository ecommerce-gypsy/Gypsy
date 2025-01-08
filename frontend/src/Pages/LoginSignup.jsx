import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';

export const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true); // Tracks whether the form is in Login or Sign Up mode
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate(); // For navigation

  // Toggle between Login and Sign Up forms
  const toggleForm = () => setIsLogin(!isLogin);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Login function
  const login = async () => {
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Login failed');

      // Store the token and username in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_name', data.username); // Assuming the backend returns the username

      console.log('Login successful:', data);

      // Redirect to the Account page
      navigate('/account');
    } catch (error) {
      console.error('Error during login:', error.message || error);
      alert(error.message || 'Something went wrong during login.');
    }
  };

  // Signup function
  const signup = async () => {
    try {
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Signup failed');

      // Store the token and username in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_name', data.username); // Assuming the backend returns the username

      console.log('Signup successful:', data);

      // Redirect to the Account page
      navigate('/account');
    } catch (error) {
      console.error('Error during signup:', error.message || error);
      alert(error.message || 'Something went wrong during signup.');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the page from reloading
    if (!isLogin && !formData.name) {
      alert('Please enter your name for signup!');
      return;
    }
    if (!formData.email || !formData.password) {
      alert('Please fill all the fields!');
      return;
    }
    if (isLogin) {
      login(); // Call the login function
    } else {
      signup(); // Call the signup function
    }
  };

  return (
    <div className="login-signup-container">
      <div className="form-wrapper">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </>
          )}
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <p onClick={toggleForm} className="toggle-text">
          {isLogin
            ? "Don't have an account? Sign up"
            : 'Already have an account? Login'}
        </p>
      </div>
    </div>
  );
};
