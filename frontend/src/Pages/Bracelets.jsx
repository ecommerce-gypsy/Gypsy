import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Bracelets.css';  // Import Bamboo styles
import { WishlistContext } from '../WishlistContext';  // Wishlist context
import { CartContext } from '../CartContext';  // Cart context
import Header from '../Components/Header/Header';  // Corrected import path
import "./ProductDetail.css";

const Bracelets = () => {
  // Access context values
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [bracelets, setBracelets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/bracelets') // Replace with your API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setBracelets(data.data);
        } else {
          setError('No bracelets found.');
        }
      })
      .catch((error) => {
        setError('Error fetching bracelets: ' + error.message);
      });
  }, []);

  const isInWishlist = (product) => wishlist.some((item) => item.id === product.id);  // Check if in wishlist

  // Handle Add to Cart
  const handleAddToCart = (product) => {
    addToCart(product);  // Add item to cart
    navigate('/cart');  // Navigate to Cart page
  };

  return (
    <div>
      <Header />  {/* Add the header component */}

      <h1>Welcome to the BRACELETS category page!</h1>
      {error && <p className="error-message">{error}</p>} {/* Display error message */}

      <div className="container">
        {bracelets.map((product) => (
          <div key={product.id} className="bracelets-card">
            <div className="bracelets-image-container">
              {/* Wishlist Heart Button */}
              <div
                className={`heart-icon ${isInWishlist(product) ? 'active' : ''}`}
                onClick={() => {
                  if (isInWishlist(product)) {
                    removeFromWishlist(product); // Remove from wishlist
                  } else {
                    addToWishlist(product); // Add to wishlist
                  }
                }}
              ></div>
              {/* Product Image */}
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.name} className="product-image" />
              </Link>
            </div>
            <div className="bracelets-name">{product.name}</div>
            <div className="bracelets-price">
              <span className="new-price">₹{product.new_price}</span>{' '}
              <span className="old-price">₹{product.old_price}</span>
            </div>
            {/* Add to Cart Button */}
            <button
              className="add-to-cart-btn"
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Customize Button */}
      <button className="customize-btn">Customize</button>
    </div>
  );
};

export default Bracelets;
