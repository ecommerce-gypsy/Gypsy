/*import React, { useState } from 'react';
import './LoginSignup.css';

export const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);
  const login = async()=>{
console.log("Login function executed");
  }
  const signup = async()=>{
    console.log("Signup function executed");
  }
//const [state,setState] = useState("Login");
  return (
    <div className="login-signup-container">
      <div className="form-wrapper">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form>
          {!isLogin && (
            <>
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" />
            </>
          )}
          <label>Email</label>
          <input type="email" placeholder="Enter your email" />
          <label>Password</label>
          <input type="password" placeholder="Enter your password" />
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
};*/
import React, { useState } from 'react';
import './LoginSignup.css';

export const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true); // Tracks whether the form is in Login or Sign Up mode
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });


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
    console.log('Login function executed with:', formData);
    try {
      // Send a POST request to the signup endpoint
      const response = await fetch('http://localhost:4000/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              name: formData.name, // Ensure formData.name is populated
              email: formData.email,
              password: formData.password,
          }),
      });

      // Parse the response JSON
      const data = await response.json();

      // Handle non-OK responses
      if (!response.ok) {
          // Check if the error is for an existing user
          if (data.error === "existing user found with same email address") {
              alert("A user with this email already exists. Please use a different email.");
          } else {
              throw new Error(data.message || 'Signup failed');
          }
          return; // Exit the function if there's an error
      }

      console.log('Signup successful:', data);

      // Store the auth token in local storage
      localStorage.setItem('auth_token', data.token);

      // Redirect to the homepage
      window.location.replace("/");
  } catch (error) {
      console.error('Error during signup:', error.message || error);
      alert(error.message || "Something went wrong during signup. Please try again.");
  }
    
  };

 // Signup function
 const signup = async () => {
  try {
      // Send a POST request to the signup endpoint
      const response = await fetch('http://localhost:4000/signup', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              name: formData.name, // Ensure formData.name is populated
              email: formData.email,
              password: formData.password,
          }),
      });

      // Parse the response JSON
      const data = await response.json();

      // Handle non-OK responses
      if (!response.ok) {
          // Check if the error is for an existing user
          if (data.error === "existing user found with same email address") {
              alert("A user with this email already exists. Please use a different email.");
          } else {
              throw new Error(data.message || 'Signup failed');
          }
          return; // Exit the function if there's an error
      }

      console.log('Signup successful:', data);

      // Store the auth token in local storage
      localStorage.setItem('auth_token', data.token);

      // Redirect to the homepage
      window.location.replace("/");
  } catch (error) {
      console.error('Error during signup:', error.message || error);
      alert(error.message || "Something went wrong during signup. Please try again.");
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
