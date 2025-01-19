import React, { useContext } from 'react'; // Removed unused useState
import { NavLink } from 'react-router-dom'; // Use NavLink instead of Link
import './Navbar.css';
import logo from '../Assets/logo.png'; // Path to your logo
import cart from '../Assets/cart.png'; // Path to your cart icon
import heart from '../Assets/heart-logo.png'; // Path to your heart icon
import user from '../Assets/user.png'; // Path to your user icon
import { CartContext } from '../../Context/CartContext';
// Import CartContext

export const Navbar = () => {
  // Access cartCount from CartContext
  const { cartCount } = useContext(CartContext);

  return (
    <div className="navbar">
      {/* Logo Section */}
      <div className="nav-logo">
        <img src={logo} alt="Logo" />
        <p>Narikurava Jewelery</p>
      </div>

      {/* Navigation Menu */}
      <ul className="nav-menu">
        <li>
          <NavLink to="/"  activeClassName="active">
            HOME
          </NavLink>
        </li>
        <li>
          <NavLink to="/anklets" activeClassName="active">
            ANKLETS
          </NavLink>
        </li>
        <li>
          <NavLink to="/neckpieces" activeClassName="active">
            NECKPIECES
          </NavLink>
        </li>
        <li>
          <NavLink to="/bracelets" activeClassName="active">
            BRACELETS
          </NavLink>
        </li>
      </ul>

      {/* Icons and Login Section */}
      <div className="nav-icons">
        {/* Wishlist */}
        <NavLink to="/wishlist">
          <div className="nav-icon">
            <img src={heart} alt="Heart" className="nav-heart-logo" />
          </div>
        </NavLink>

        {/* Cart */}
        <div className="nav-cart">
          <NavLink to="/cart" className="nav-cart-link">
            <img src={cart} alt="Cart" className="nav-cart-icon" />
            <div className="nav-cart-count">{cartCount}</div> {/* Dynamic count */}
          </NavLink>
        </div>

        {/* Login Button */}
        <NavLink to="/login">
          <img src={user} alt="User" className="nav-user-icon" />
        </NavLink>
      </div>
    </div>
  );
};
