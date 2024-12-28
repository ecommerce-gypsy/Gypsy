import React from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';
import user from '../assets/user.png';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="nav-logo">
              <img src={logo} alt="Logo" />
              <p></p>
            </div>
            <img src={user} alt="User" className="nav-user-icon" />
    </div>
  );
};

export default Navbar;