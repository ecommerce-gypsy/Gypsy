import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { CartProvider } from './Context/CartContext';
import { WishlistProvider } from './Context/WishlistContext';


ReactDOM.render(
  <React.StrictMode>
    <WishlistProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </WishlistProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
