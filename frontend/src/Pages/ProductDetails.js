import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProductDetails.css';

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { towel } = location.state;

  return (
    <div className="product-details">
      <button onClick={() => navigate(-1)} className="back-button">Back</button>
      <div className="product-container">
        <div className="product-images">
          <img src={towel.image} alt={towel.name} className="main-product-image" />
          {/* Placeholder for additional images */}
          <div className="thumbnail-images">
            <img src={towel.image} alt="Thumbnail 1" className="thumbnail" />
            <img src={towel.image} alt="Thumbnail 2" className="thumbnail" />
          </div>
        </div>
        <div className="product-info">
          <h1 className="product-name">{towel.name}</h1>
          <p className="product-rating">
            ⭐ 4.3 (507 ratings) | <a href="#reviews">View Reviews</a>
          </p>
          <div className="product-pricing">
            <span className="new-price">₹{towel.new_price}</span>
            <span className="old-price">₹{towel.old_price}</span>
            <span className="discount">-63%</span>
          </div>
          <p className="product-description">
            Stylish and eco-friendly towel, perfect for everyday use with lightweight and durable material.
          </p>
          <div className="offers">
            <h3>Offers</h3>
            <ul>
              <li>Bank Offer: Upto ₹45.00 discount on select cards</li>
              <li>Partner Offer: Spend ₹999 or more and get 3% off</li>
            </ul>
          </div>
          <div className="actions">
            <button className="add-to-cart-btn" onClick={() => alert('Added to cart!')}>
              Add to Cart
            </button>
            <button className="buy-now-btn" onClick={() => alert('Proceed to checkout!')}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
