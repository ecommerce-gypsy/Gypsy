import React, { useContext } from "react";
import { CartContext } from "../Context/CartContext";
import "./Cart.css";

const Cart = () => {
  const { cart, setCart, removeItem } = useContext(CartContext);

  // Function to increment item quantity
  const incrementQuantity = (item) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.productid === item.productid
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    );
  };

  // Function to decrement item quantity
  const decrementQuantity = (item) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.productid === item.productid && cartItem.quantity > 1
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      )
    );
  };

  // Calculate total
  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.new_price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h1 className="cart-heading">Your Cart</h1>
      <a href="/shop" className="continue-shopping">
        Continue shopping
      </a>

      <div className="cart-table">
        <div className="cart-header">
          <p className="cart-column">Product</p>
          <p className="cart-column">Quantity</p>
          <p className="cart-column">Total</p>
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

export default Cart;
