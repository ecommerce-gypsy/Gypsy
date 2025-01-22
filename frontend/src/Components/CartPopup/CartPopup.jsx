import React, { useContext } from 'react';
import { CartContext } from './Context/CartContext';
import './CartPopup.css';

export const CartPopup = ({ onClose }) => {
  const { cart } = useContext(CartContext);

  return (
    <div className="cart-popup">
      <div className="cart-popup-header">
        <span>✔ Item added to your cart</span>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
      </div>

      <div className="cart-popup-items">
        {cart.map((item) => (
          <div key={item.productid} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div>
              <h4>{item.name}</h4>
              <p>Shape: {item.shape || "N/A"}</p>
              <p>Stand: {item.stand || "N/A"}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-popup-actions">
        <button className="view-cart-button">View cart ({cart.length})</button>
        <button className="checkout-button">Check out</button>
      </div>

      <button className="continue-shopping" onClick={onClose}>
        Continue shopping
      </button>
    </div>
  );
};
