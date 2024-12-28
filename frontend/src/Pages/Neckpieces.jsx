import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import np1_img from '../Components/Assets/np1.png';
import np2_img from '../Components/Assets/np2.png';
import np3_img from '../Components/Assets/np3.png';
import np4_img from '../Components/Assets/np4.png';
import np5_img from '../Components/Assets/np5.png';
import './Neckpieces.css';
import { WishlistContext } from '../WishlistContext'; // Wishlist context
import { CartContext } from '../CartContext'; // Cart context
import Header from '../Components/Header/Header'; // Corrected import path

const neckpieces = [
  { id: 1, name: 'Worldone Eco Friendly Documents Organizer File', image: np1_img, new_price: 100, oldPrice: 200 },
  { id: 2, name: 'CRAFTWAFT Shila Hard Board Brown Lace File', image: np2_img, new_price: 150, oldPrice: 300 },
  { id: 3, name: 'Manifold Kraft File Folder with Spine', image: np3_img, new_price: 120, oldPrice: 250 },
  { id: 4, name: 'Monaf A4 Twin-Pocket Conference File', image: np4_img, new_price: 180, oldPrice: 350 },
  { id: 5, name: 'Wallet - Half Flap  File', image: np5_img, new_price: 220, oldPrice: 450 },
];

const Neckpieces = () => {
  // Access context values
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext); // Wishlist context
  const { addToCart } = useContext(CartContext); // Cart context

  const navigate = useNavigate(); // React Router navigation

  const isInWishlist = (file) => wishlist.some((item) => item.id === file.id); // Check if in wishlist

  // Handle Add to Cart
  const handleAddToCart = (file) => {
    addToCart(file); // Add item to cart
    navigate('/cart'); // Navigate to Cart page
  };

  return (
    <div>
      <Header/>

      <h1>Welcome to the NECKPIECES  page!</h1>

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
              <img className="neckpiece-image" src={file.image} alt={file.name} />
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
