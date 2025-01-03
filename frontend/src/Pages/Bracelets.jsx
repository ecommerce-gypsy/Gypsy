import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import b1_img from '../Components/Assets/b1.png';  // Example images for Bamboo
import b2_img from '../Components/Assets/b2.png';
import b3_img from '../Components/Assets/b3.png';
import b4_img from '../Components/Assets/b4.png';
import b5_img from '../Components/Assets/b5.png';
import './Bracelets.css';  // Import Bamboo styles
import { WishlistContext } from '../WishlistContext';  // Wishlist context
import { CartContext } from '../CartContext';  // Cart context
import Header from '../Components/Header/Header';  // Corrected import path

// Example array for Bamboo products
const bracelets = [
  { id: 1, name: 'Starry Serenity Bracelets', image: b1_img, new_price: 250, oldPrice: 500 },
  { id: 2, name: 'Ocean Sparkle Charm', image: b2_img, new_price: 300, oldPrice: 600 },
  { id: 3, name: 'Galaxy Dreams Bracelet', image: b3_img, new_price: 200, oldPrice: 450 },
  { id: 4, name: 'Protective Grace Chain', image: b4_img, new_price: 350, oldPrice: 700 },
  { id: 5, name: 'Pebble Spectrum Bracelet', image: b5_img, new_price: 400, oldPrice: 800 },
];

const Bracelets= () => {
  // Access context values
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);  // Wishlist context
  const { addToCart } = useContext(CartContext);  // Cart context

  const navigate = useNavigate();  // React Router navigation

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
        <img className="bracelets-image" src={product.image} alt={product.name} />
      </div>
      <div className="bracelets-name">{product.name}</div>
      <div className="bracelets-price">
        <span className="new-price">₹{product.new_price}</span>{' '}
        <span className="old-price">₹{product.oldPrice}</span>
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
