/*import React, { useEffect, useContext } from "react";
import { CartContext } from "../Context/CartContext";
import "./Cart.css";

const Cart = () => {
  const { cart, removeItem, fetchCart, updateQuantity } = useContext(CartContext);

  useEffect(() => {
    fetchCart();  // Call fetchCart to get cart data when the component mounts
  }, []);  // Dependency array to ensure it re-runs when needed

  // Function to increment item quantity using updateQuantity from context
  const incrementQuantity = (item) => {
    const newQuantity = item.quantity + 1;
    updateQuantity(item.productid, newQuantity);  // Update via the context
  };

 
  const decrementQuantity = (item) => {
    const newQuantity = item.quantity > 1 ? item.quantity - 1 : 0; 
    if (newQuantity === 0) {
      removeItem(item.productid);
    } else {
      updateQuantity(item.productid, newQuantity);
    }
  };
  

  // Calculate total
  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.new_price * item.quantity, 0);

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
                  onClick={() => removeItem(item.productid)}
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
          <button className="checkout-btn">Check out</button>
        </div>
      )}
    </div>
  );
};

export default Cart;*/

import React, { useEffect, useContext, useState } from "react";
import { CartContext } from "../Context/CartContext";
import orderplaced from "../Components/Assets/orderplaced.gif"; // Import the GIF
import "./Cart.css";

const Cart = () => {
  const { cart, removeItem, fetchCart, updateQuantity } = useContext(CartContext);
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showGif, setShowGif] = useState(false);

  useEffect(() => {
    fetchCart(); // Call fetchCart to get cart data when the component mounts
  }, []); // Dependency array to ensure it re-runs when needed

  // Function to increment item quantity using updateQuantity from context
  const incrementQuantity = (item) => {
    const newQuantity = item.quantity + 1;
    updateQuantity(item.productid, newQuantity);  // Update via the context
  };

  const decrementQuantity = (item) => {
    const newQuantity = item.quantity > 1 ? item.quantity - 1 : 0; 
    if (newQuantity === 0) {
      removeItem(item.productid);
    } else {
      updateQuantity(item.productid, newQuantity);
    }
  };

  // Calculate total
  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.new_price * item.quantity, 0);

  // Handle Checkout API request
  const handleCheckout = async () => {
    const orderData = {
      items: cart.map(item => ({
        productid: item.productid,
        quantity: item.quantity,
        price: item.new_price,
      })),
      shippingAddress,
      paymentMethod,
      totalPrice: calculateTotal(),
      userEmail: localStorage.getItem("user_email"), 
    };

    // Retrieve the access token from localStorage
    const accessToken = localStorage.getItem("auth_token");

    try {
      const response = await fetch("http://localhost:4000/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // Adding the access token in the headers
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage(result.message); // Show success message
        setShowGif(true); // Show the GIF
        setTimeout(() => {
          setShowGif(false); // Hide the GIF after 2 seconds
          setCheckoutModalOpen(false); // Close the modal
        }, 2000); // 2 seconds
      } else {
        setError(result.message || "Something went wrong, please try again.");
      }
    } catch (error) {
      setError("Network error, please try again.");
    }
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

              {/* Remove button (dustbin icon) */}
              <div className="cart-remove">
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.productid)}
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
          <button className="checkout-btn" onClick={() => setCheckoutModalOpen(true)}>
            Check out
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal">
            <button className="cancel-btn" onClick={() => setCheckoutModalOpen(false)}>
              X
            </button>
            <h2>Checkout</h2>
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            <div>
              <input
                type="text"
                placeholder="Name"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Address"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              />
              <input
                type="text"
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
              />
              <input
                type="text"
                placeholder="Country"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="UPI">UPI</option>
              </select>
              <button className="submit-checkout-btn" onClick={handleCheckout}>
                Submit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show GIF after successful checkout */}
      {showGif && (
        <div className="order-placed-gif">
          <img src={orderplaced} alt="Order Placed" />
        </div>
      )}
    </div>
  );
};

export default Cart;
