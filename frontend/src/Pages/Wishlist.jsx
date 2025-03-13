import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../Context/WishlistContext';
import { CartContext } from '../Context/CartContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Wishlist.css';
import { Trash2 } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const moveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item);
    toast.success("Item moved to cart!");
  };

  const handleRemove = (item) => {
    removeFromWishlist(item);
    toast.error("Item removed from wishlist!");
  };

  return (
    <div className="wishlist-container">
      <ToastContainer position="top-center" autoClose={1500} />
      
      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h2>Your Wishlist is Empty</h2>
          <p>Start adding some items!</p>
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
                  src={item.images[0] || 'placeholder.jpg'}
                  alt={item.productName || 'Product'}
                  className="wishlist-image"
                />
                <div className="wishlist-details">
                  <h3>{item.productName || 'Product Name'}</h3>
                  <p>Price: ₹{item.new_price || 0}</p>
                  <div className="wishlist-actions">
                    <div className="action-buttons">
                      <button
                        className="move-to-cart-btn"
                        onClick={() => moveToCart(item)}
                      >
                        Move to Cart
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemove(item)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
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
