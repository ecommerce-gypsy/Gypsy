import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaGoogle, FaLinkedinIn } from "react-icons/fa";
import "./AuthCard.css";

const AuthCard = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className={`auth-card ${isSignUp ? "sign-up-mode" : ""}`}>
        
        {/* Left Panel */}
        <div className={`auth-left ${isSignUp ? "signup" : "signin"}`}>
          <h2>{isSignUp ? "Welcome Back!" : "Hello, Friend!"}</h2>
          <p>
            {isSignUp
              ? "To keep connected with us, please log in with your personal info."
              : "Enter your details and start your journey with us!"}
          </p>
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "SIGN IN" : "SIGN UP"}
          </button>
        </div>

        {/* Right Panel */}
        <div className="auth-right">
          {isSignUp ? (
            <>
              <h2>Create Account</h2>
              <div className="auth-social">
                <button><FaFacebookF /></button>
                <button><FaGoogle /></button>
                <button><FaLinkedinIn /></button>
              </div>
              <input className="auth-input" type="text" placeholder="Name" autoComplete="off" />
              <input className="auth-input" type="email" placeholder="Email" autoComplete="off" />
              <input className="auth-input" type="password" placeholder="Password" autoComplete="new-password" />
              <button className="auth-btn">SIGN UP</button>
            </>
          ) : (
            <>
              <h2>Sign In</h2>
              <div className="auth-social">
                <button><FaFacebookF /></button>
                <button><FaGoogle /></button>
                <button><FaLinkedinIn /></button>
              </div>
              <input className="auth-input" type="email" placeholder="Email" autoComplete="off" />
              <input className="auth-input" type="password" placeholder="Password" autoComplete="new-password" />
              <button className="auth-btn">SIGN IN</button>

              {/* Navigation Links */}
              <p className="forgot-password" onClick={() => navigate("/ForgotPassword")}>
                Forgot Password?
              </p>
              <p className="dashboard-link" onClick={() => navigate("/SuperAdminLogin")}>
                Super Admin
              </p>
              <p className="dashboard-link" onClick={() => navigate("/SuperAdmin")}>
                Admin
              </p>
              <p className="dashboard-link" onClick={() => navigate("/SuperAdmin")}>
                Vendor
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
