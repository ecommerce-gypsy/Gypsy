import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add item to cart with default quantity of 1
  const addToCart = (item) => {
    if (!cart.some((cartItem) => cartItem.productid === item.productid)) {
      setCart([...cart, { ...item, quantity: 1 }]);
      alert(`${item.name} added to cart!`); // Corrected string formatting
    } else {
      alert(`${item.name} is already in your cart!`); // Corrected string formatting
    }
  };

  // Remove item from cart
  const removeItem = (productid) => {
    setCart((prevCart) => prevCart.filter((item) => item.productid !== productid));
  };

  // Dynamic cart count (total items including quantities)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeItem, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
/*import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);  // Track loading state for API calls
  const [error, setError] = useState(null); // Handle errors if needed

  // Add item to cart with default quantity of 1
  const addToCart = async (item) => {
    setLoading(true);
    console.log("Adding item to cart:", item); // Log the item being added
    const token = localStorage.getItem("auth_token");
    console.log("Token from localStorage:", token); // This should print the token in the console
  
    if (!token) {
      alert("No token found. Please log in.");
      setLoading(false);
      return;
    }
  
    // Ensure productid is a number, and don't convert it
    const productid = item.productid; // productid is already a number, no conversion needed
  
    console.log("Sending productid as number:", productid); // Log productid as number
  
    try {
      const response = await fetch("http://localhost:4000/cartss/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          productid: productid, // Send productid as number directly
          quantity: 1, // Default quantity of 1
        }),
      });
  
      console.log("Response status:", response.status); // Log response status
      const data = await response.json();
      console.log("Response data:", data); // Log response data
  
      if (response.ok) {
        alert(`${item.name} added to cart!`);
        setCart((prevCart) => [...prevCart, { ...item, quantity: 1 }]); // Update local cart state
      } else {
        console.error("Error response:", data); // Log error response from the API
        alert(data.message || "Error adding product to cart.");
      }
    } catch (err) {
      console.error("Error adding to cart:", err); // Log any unexpected errors
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false); // Stop loading after the request is completed
    }
  };
  

  const removeItem = async (productid) => {
    setLoading(true); // Start loading when the API request is made
    const token = localStorage.getItem("auth_token");
  
    if (!token) {
      alert("No token found. Please log in.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:4000/cartss/remove/${productid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  // Include token in the headers
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Item removed from cart.");
        setCart((prevCart) => prevCart.filter((item) => item.productid !== productid));  // Update the local state
      } else {
        console.error("Error response:", data);
        alert(data.message || "Error removing product from cart.");
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false);  // Stop loading after the request is completed
    }
  };
  

  // Dynamic cart count (total items including quantities)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeItem, cartCount, loading, error }}>
      {children}
    </CartContext.Provider>
  );
};
*/