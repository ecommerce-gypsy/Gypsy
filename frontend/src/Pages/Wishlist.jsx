import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Wishlist.css'; // Add custom styles if needed
import { WishlistContext } from '../WishlistContext';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);

  return (
    <div className="wishlist-container">
      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h2>Your Wishlist is Empty</h2>
          <p>Looks like you haven't added anything to your Wishlist yet.</p>
          <Link to="/">
            <button className="shop-now-btn">Shop Now</button>
          </Link>
        </div>
      ) : (
        <div className="wishlist-items">
          <h2>Your Wishlist</h2>
          <div className="items-container">
            {wishlist.map((item, index) => (
              <div key={index} className="wishlist-item">
                <img src={item.image} alt={item.name} className="wishlist-image" />
                <div className="wishlist-details">
                  <h3>{item.name}</h3>
                  <p>Price: ${item.new_price}</p>
                  <button
                    className="remove-icon"
                    onClick={() => {
                      if (window.confirm('Remove this item from your Wishlist?')) {
                        removeFromWishlist(item); // Pass the entire object to remove it
                      }
                    }}
                  >
                    ❤️
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
