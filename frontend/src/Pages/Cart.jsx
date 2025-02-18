import React, { useEffect, useContext, useState } from "react";
import { CartContext } from "../Context/CartContext";
import CheckoutModal from "./CheckoutModal"; // Import the CheckoutModal component
import orderplaced from "../Components/Assets/orderplaced.gif"; // Import the GIF
import "./Cart.css";

const Cart = () => {
  const { cart, removeItem, fetchCart, updateQuantity } = useContext(CartContext);
  const [showGif, setShowGif] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart(); // Fetch the cart data on mount
  }, []); // Empty dependency to run only once

  const incrementQuantity = (item) => {
    const newQuantity = item.quantity + 1;
    updateQuantity(item.productid, newQuantity);
  };

  const decrementQuantity = (item) => {
    const newQuantity = item.quantity > 1 ? item.quantity - 1 : 0;
    if (newQuantity === 0) {
      removeItem(item);
    } else {
      updateQuantity(item.productid, newQuantity);
    }
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.new_price * item.quantity, 0);

  const handleCheckoutSuccess = (message) => {
    setSuccessMessage(message);
    setShowGif(true);
    setTimeout(() => {
      setShowGif(false);
    }, 2000); // Hide GIF after 2 seconds
  };

  return (
    <div className="cart-container">
      <h1 className="cart-heading">Your Cart</h1>
      <a href="/" className="continue-shopping">
        Continue shopping
      </a>

      <div className="cart-table">
        <div className="cart-header">
          <p className="cart-column">Product</p>
          <p className="cart-column">Quantity</p>
          <p className="cart-column">Total</p>
          <p className="cart-column">Remove</p>
        </div>

        {cart.length > 0 ? (
          cart.map((item) => (
            <div className="cart-row" key={item.productid}>
              <div className="cart-product">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="cart-product-image"
                />
                <div>
                  <p className="cart-product-name">{item.name}</p>
                  <p className="cart-product-count">Price: ₹{item.new_price}</p>
                </div>
              </div>

              <div className="cart-quantity">
                <button
                  className="quantity-btn decrement-btn"
                  onClick={() => decrementQuantity(item)}
                >
                  -
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button
                  className="quantity-btn increment-btn"
                  onClick={() => incrementQuantity(item)}
                >
                  +
                </button>
              </div>

              <div className="cart-total">
                <p>₹{(item.new_price * item.quantity).toFixed(2)}</p>
              </div>

              <div className="cart-remove">
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-cart">Your cart is empty.</p>
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-summary">
          <textarea
            className="special-instructions"
            placeholder="Order special instructions"
          ></textarea>
          <div className="summary-details">
            <p className="summary-label">Estimated total:</p>
            <p className="summary-total">₹{calculateTotal().toFixed(2)}</p>
          </div>
          <CheckoutModal
            cart={cart}
            calculateTotal={calculateTotal}
            handleCheckoutSuccess={handleCheckoutSuccess}
            setError={setError}
          />
        </div>
      )}

      {showGif && (
        <div className="order-placed-gif">
          <img src={orderplaced} alt="Order Placed" />
        </div>
      )}
    </div>
  );
};

export default Cart;