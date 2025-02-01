import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Wishlist.css'; // Ensure custom styles are imported
import { WishlistContext } from '../Context/WishlistContext';
import closeIcon from '../Components/Assets/close.png';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, fetchWishlist } = useContext(WishlistContext);

 
  return (
    <div className="wishlist-container">
      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h2>It feels so empty in here</h2>
          <p>Make a wish!</p>
          <div className="empty-heart">
            <span>💔</span>
          </div>
          <Link to="/">
            <button className="shop-now-btn">Start Shopping</button>
          </Link>
        </div>
      ) : (
        <div className="wishlist-items">
          <h2>Your Wishlist</h2>
          <div className="items-container">
            {wishlist.map((item) => (
              <div key={item._id} className="wishlist-item">
                <img
                  src={item.images[0] || "placeholder.jpg"}
                  alt={item.productName || "Product"}
                  className="wishlist-image"
                />
                <div className="wishlist-details">
                  <h3>{item.productName || "Product Name"}</h3>
                  <p>Price: ₹{item.new_price || 0}</p>
                  <button
                    className="remove-btn"
                    onClick={() => {
                      if (window.confirm('Remove this item from your Wishlist?')) {
                        removeFromWishlist(item);
                      }
                    }}
                  >
                    <img src={closeIcon} alt="Remove" className="close-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
