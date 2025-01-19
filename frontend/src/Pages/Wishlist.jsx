import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Wishlist.css'; // Ensure you have the custom styles imported
import { WishlistContext } from '../Context/WishlistContext';//hi
import closeIcon from '../Components/Assets/close.png'; // Ensure the close icon path is correct

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
                <img src={item.images[0]} alt={item.name} className="wishlist-image" />
                <div className="wishlist-details">
                  <h3>{item.name}</h3>
                  <p>Price: ₹{item.new_price}</p>
                  <button
                    className="remove-btn"
                    onClick={() => {
                      if (window.confirm('Remove this item from your Wishlist?')) {
                        removeFromWishlist(item); // Pass the entire object to remove it
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
