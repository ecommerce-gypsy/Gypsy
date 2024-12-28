import React, { useContext } from 'react'; // Removed unused useState
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../Assets/logo.png'; // Path to your logo
import cart from '../Assets/cart.png'; // Path to your cart icon
import heart from '../Assets/heart-logo.png'; // Path to your heart icon
import user from '../Assets/user.png'; // Path to your user icon
import { CartContext } from '../../CartContext'; // Import CartContext

export const Navbar = () => {
  // Access cartCount from CartContext
  const { cartCount } = useContext(CartContext);

  return (
    <div className="navbar">
      {/* Logo Section */}
      <div className="nav-logo">
        <img src={logo} alt="Logo" />
        <p>Shop</p>
      </div>

      {/* Navigation Menu */}
      <ul className="nav-menu">
        <li>
          <Link to="/" className="active">
            HOME
          </Link>
        </li>
        <li>
          <Link to="/anklets">ANKLETS</Link>
        </li>
        <li>
          <Link to="/neckpieces">NECKPIECES</Link>
        </li>
        <li>
          <Link to="/bracelets">BRACELETS</Link>
        </li>
        <li>
          <Link to="/admin">ADMIN</Link>
        </li>
      </ul>

      {/* Icons and Login Section */}
      <div className="nav-icons">
        {/* Wishlist */}
        <Link to="/wishlist">
          <div className="nav-icon">
            <img src={heart} alt="Heart" className="nav-heart-logo" />
          </div>
        </Link>

        {/* Cart */}
        <div className="nav-cart">
          <Link to="/cart" className="nav-cart-link">
            <img src={cart} alt="Cart" className="nav-cart-icon" />
            <div className="nav-cart-count">{cartCount}</div> {/* Dynamic count */}
          </Link>
        </div>

        {/* Login Button */}
        <Link to="/login">
          <img src={user} alt="User" className="nav-user-icon" />
        </Link>
      </div>
    </div>
  );
};
