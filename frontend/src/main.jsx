import React from 'react'; // Import React (required for JSX)
import { StrictMode } from 'react'; // StrictMode helps catch potential issues in development
import { createRoot } from 'react-dom/client'; // For rendering the app
import './index.css'; // Import global styles
import App from './App.jsx'; // Main App component
import { BrowserRouter } from 'react-router-dom'; // Routing support

// Get the root element from the DOM
const rootElement = document.getElementById('root');

if (rootElement) {
  // Render the React app
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
} else {
  console.error("Root element not found. Please check your index.html file.");
}