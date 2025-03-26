import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaGoogle, FaLinkedinIn } from "react-icons/fa";
import "./AuthCard.css";
import sign from "../Components/Assets/signin.png";
import Footer from '../Components/Footer/Footer';


const AuthCard = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const navigate = useNavigate();
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  useEffect(() => {
    const authToken = localStorage.getItem("auth_token");
    if (authToken) {
      navigate("/account");  // Redirect to account page if already logged in
    }
  }, [navigate]);
  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Send OTP to Email
  const sendOtp = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");

      setIsOtpSent(true);
      alert("OTP sent to your email!");
    } catch (error) {
      console.error("Error sending OTP:", error.message || error);
      alert(error.message || "Failed to send OTP.");
    }
  };

  // Verify OTP and Signup
  const handleSignup = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp, name: formData.name, password: formData.password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "OTP verification failed");

      // Store Auth Data
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_name", data.username);
      localStorage.setItem("user_email", data.email);

      console.log("Signup successful:", data);
      navigate(data.redirectUrl || "/account");
    } catch (error) {
      console.error("Error during signup:", error.message || error);
      alert(error.message || "Signup failed.");
    }
  };

  // Handle Login
  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      // Store Auth Data
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_name", data.username);
      localStorage.setItem("user_email", data.email);

      console.log("Login successful:", data);
      navigate(data.redirectUrl || "/account");
    } catch (error) {
      console.error("Error during login:", error.message || error);
      alert(error.message || "Login failed.");
    }
  };
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
  
    // Check password strength
    if (password.length < 8) {
      setPasswordStrength("Weak");
    } else if (isPasswordValid(password)) {
      setPasswordStrength("Strong");
    } else {
      setPasswordStrength("Medium");
    }
  };
  
  const isPasswordValid = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };
  const handlePasswordFocus = () => {
    setPasswordFocus(true);
  };
  
  const handlePasswordBlur = () => {
    setPasswordFocus(false);
  };
  

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill all required fields!");
      return;
    }
    if (isSignUp && !formData.name) {
      alert("Please enter your name for signup!");
      return;
    }

    if (isSignUp) {
      // Check password validity
      if (!isPasswordValid(formData.password)) {
        alert("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol.");
        return;
      }

      if (!isOtpSent) {
        sendOtp();
      } else {
        handleSignup();
      }
    } else {
      handleLogin();
    }
  };

  return (
    <>
    <div className="auth-container">
      <div className={`auth-card ${isSignUp ? "sign-up-mode" : ""}`}>
        {/* Left Panel */}
        <div className={`auth-left ${isSignUp ? "signup" : "signin"}`}>
    
        <img src={sign} alt="Sign Illustration" />

          <h2>{isSignUp ? "Welcome Back!" : "Hello, Welcome to our Store... We're thrilled to have you here !"}</h2>
          <p>
            {isSignUp
              ? "To keep connected with us, please log in with your personal info."
              : "Enter your details and start purchasing with us!"}
          </p>
       
 

          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "SIGN IN" : "SIGN UP"}
          </button>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          <h2>{isSignUp ? "Create Account" : "Sign In"}</h2>
          <div className="auth-social">
            <button><FaFacebookF /></button>
            <button><FaGoogle /></button>
            <button><FaLinkedinIn /></button>
          </div>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <input
                className="auth-input"
                type="text"
                name="name"
                placeholder="Name"
                autoComplete="off"
                value={formData.name}
                onChange={handleChange}
              />
            )}
            <input
              className="auth-input"
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="off"
              value={formData.email}
              onChange={handleChange}
            />
           <input
  className="auth-input"
  type="password"
  name="password"
  placeholder="Password"
  autoComplete="new-password"
  value={formData.password}
  onChange={handlePasswordChange}
  onFocus={handlePasswordFocus}
  onBlur={handlePasswordBlur}
/>

{/* Password Strength and Validation Tips */}
{/* Password Strength and Validation Tips */}
{passwordFocus && (
  <div className="password-strength-tips">
    <p>Password should be:</p>
    <ul>
      <li>At least 8 characters long</li>
      <li>Contain at least one uppercase letter</li>
      <li>Contain at least one lowercase letter</li>
      <li>Contain at least one number</li>
      <li>Contain at least one special character (@$!%*?&)</li>
    </ul>

    {/* Display Strength Box and Text */}
    <div className="password-strength-container">
      <div className={`password-strength-box ${passwordStrength.toLowerCase()}`}>
      </div>
      <span className={`password-strength-text ${passwordStrength.toLowerCase()}`}>
        {passwordStrength}
      </span>
    </div>
  </div>
)}

            {/* OTP Input Field */}
            {isSignUp && isOtpSent && (
              <input
                className="auth-input"
                type="text"
                name="otp"
                placeholder="Enter OTP"
                autoComplete="off"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            )}

            <button className="auth-btn" type="submit">
              {isSignUp ? (isOtpSent ? "VERIFY OTP & SIGN UP" : "SEND OTP") : "SIGN IN"}
            </button>
          </form>

          {!isSignUp && (
            <p className="forgot-password" onClick={() => navigate("/reset-password")}>
              Forgot Password?
            </p>
          )}
        </div>
        
      </div>
    

    </div>
      <Footer/></>
  );
};

export default AuthCard;
