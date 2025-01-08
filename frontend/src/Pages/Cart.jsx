import React, { useContext } from 'react';
import { CartContext } from '../CartContext';
import './Cart.css';
import closeIcon from '../Components/Assets/close.png';

const Cart = () => {
  const { cart, cartCount, removeItem } = useContext(CartContext);

  const addToCart = async (item) => {
    try {
      // Get the token from localStorage
      const authToken = localStorage.getItem('auth_token');

      if (!authToken) {
        console.error('No auth token found. Please log in.');
        return;
      }

      const response = await fetch('http://localhost:4000/addtocart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': authToken,
        },
        body: JSON.stringify({ item }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Item added to cart:', data);
        // Optionally update cart state/context here
      } else {
        console.error('Failed to add item:', data.errors || data.error);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

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
                <p className="cart-item-price">Price: ₹{item.new_price}</p>
              </div>
              <button
                className="add-btn"
                onClick={() => addToCart(item)}
              >
                
              </button>
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
