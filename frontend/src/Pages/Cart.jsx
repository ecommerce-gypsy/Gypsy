import React, { useContext } from 'react';
import { CartContext } from '../CartContext';
import './Cart.css';
import closeIcon from '../Components/Assets/close.png';

const Cart = () => {
  const { cart, cartCount, removeItem } = useContext(CartContext);

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      <h2>Total Items: {cartCount}</h2>

      <div className="cart-items">
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-price">Price: ${item.new_price}</p>
              </div>
              <button
                className="remove-btn"
                onClick={() => removeItem(item.id)}
              >
                <img src={closeIcon} alt="Remove" className="close-icon" />
              </button>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
    </div>
  );
};

export default Cart;
