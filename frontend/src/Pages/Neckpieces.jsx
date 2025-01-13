import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Neckpieces.css';
import { WishlistContext } from '../WishlistContext'; // Wishlist context
import { CartContext } from '../CartContext'; // Cart context
import Header from '../Components/Header/Header'; // Corrected import 
import "./ProductDetail.css";

const Neckpieces = () => {
  // Access context values
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [neckpieces, setNeckpieces] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/neckpieces') // Replace with your API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setNeckpieces(data.data);
        } else {
          setError('No neckpieces found.');
        }
      })
      .catch((error) => {
        setError('Error fetching neckpieces: ' + error.message);
      });
  }, []);

  const isInWishlist = (file) => wishlist.some((item) => item.id === file.id); // Check if in wishlist

  // Handle Add to Cart
  const handleAddToCart = (file) => {
    addToCart(file); // Add item to cart
    navigate('/cart'); // Navigate to Cart page
  };

  return (
    <div>
      <Header/>

      <h1>Welcome to the NECKPIECES page!</h1>

      {error && <p className="error-message">{error}</p>} {/* Display error message */}

      <div className="container">
        {neckpieces.map((file) => (
          <div key={file.id} className="neckpiece-card">
            <div className="neckpiece-image-container">
              {/* Wishlist Heart Button */}
              <div
                className={`heart-icon ${isInWishlist(file) ? 'active' : ''}`}
                onClick={() => {
                  if (isInWishlist(file)) {
                    removeFromWishlist(file); // Remove from wishlist
                  } else {
                    addToWishlist(file); // Add to wishlist
                  }
                }}
              ></div>
              {/* Product Image */}
              <Link to={`/product/${file.id}`}>
                <img src={file.image} alt={file.name} className="product-image" />
              </Link>
            </div>
            <div className="neckpiece-name">{file.name}</div>
            <div className="neckpiece-price">
              <span className="new-price">₹{file.new_price}</span>{' '}
              <span className="old-price">₹{file.oldPrice}</span>
            </div>
            {/* Add to Cart Button */}
            <button
              className="add-to-cart-btn"
              onClick={() => handleAddToCart(file)}
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

export default Neckpieces;
