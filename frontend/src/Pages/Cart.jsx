import React, { useEffect, useContext, useState } from "react";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";
import CheckoutModal from "./CheckoutModal";
import "./Cart.css";
import { useNavigate } from "react-router-dom"; 

const Cart = () => {
  const { cart, removeItem, fetchCart, updateQuantity, emptyCart } =
    useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);
  const [showCheckout, setShowCheckout] = useState(false); // State to control the form visibility
  const navigate = useNavigate();
  useEffect(() => {
    fetchCart();
  }, []);

  // Handle Quantity
  const incrementQuantity = (item) => {
    updateQuantity(item.productid, item.quantity + 1);
  };

  const decrementQuantity = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.productid, item.quantity - 1);
    } else {
      removeItem(item);
    }
  };

  // Calculate Total Amount
  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.new_price * item.quantity, 0);

  // Move Item to Wishlist
  const handleMoveToWishlist = (item) => {
    addToWishlist(item);
    removeItem(item);
  };

  // Open Checkout Form
  const openCheckout = () => {
    setShowCheckout(true);
    navigate("/checkoutmodal");
  };

  // Close Checkout Form
  const closeCheckout = () => {
    setShowCheckout(false);
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">My Bag ({cart.length} items)</h1>

      {cart.length > 0 ? (
        <div className="cart-content">
          {/* Left Section - Cart Items */}
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.productid}>
                <img
                  src={item.images[0]}
                  alt={item.productName}
                  className="cart-image"
                />

                <div className="cart-item-details">
                  <p className="cart-item-name">{item.productName}</p>
                  <p className="cart-item-price">
                    Rs. {item.new_price.toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="cart-quantity">
                    <button onClick={() => decrementQuantity(item)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => incrementQuantity(item)}>+</button>
                  </div>
                </div>

                {/* Item Total Price */}
                <div className="cart-item-total">
                  Rs. {(item.new_price * item.quantity).toFixed(2)}
                </div>

                {/* Actions */}
                <div className="cart-actions">
                  <button
                    onClick={() => handleMoveToWishlist(item)}
                    className="wishlist-btn"
                  >
                    Move to Wishlist
                  </button>
                  <button
                    onClick={() => removeItem(item)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Section - Summary */}
          <div className="cart-summary">
            <div className="summary-box">
              <h3>Order Details</h3>
              <p>
                Bag Total: <span>Rs. {calculateTotal().toFixed(2)}</span>
              </p>
              <p>
                Delivery Fee: <span>Rs. 99.00</span>
              </p>
              <p>
                Platform Fee: <span>Rs. 19.00</span>
              </p>
              <h3>
                Order Total:{" "}
                <span>Rs. {(calculateTotal() + 99 + 19).toFixed(2)}</span>
              </h3>

              {/* Proceed to Shipping Button */}
              <button className="checkout-btn" onClick={openCheckout}>
                Proceed to Shipping
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="empty-cart">Your cart is empty.</p>
      )}

      {/* Checkout Form (Modal) */}
      {showCheckout && <CheckoutModal onClose={closeCheckout} />}
    </div>
  );
};

export default Cart;