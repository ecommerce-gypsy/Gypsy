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
      <script src="//code.tidio.co/YOUR_TIDIO_PUBLIC_KEY.js" async></script>

        <App />
      </CartProvider>
    </WishlistProvider>
  </React.StrictMode>
);
