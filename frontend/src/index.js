import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CartProvider } from './Context/CartContext';
import { WishlistProvider } from './Context/WishlistContext';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <WishlistProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </WishlistProvider>
  </React.StrictMode>
);
