/*import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add item to cart with default quantity of 1
  const addToCart = (item) => {
    if (!cart.some((cartItem) => cartItem.productid === item.productid)) {
      setCart([...cart, { ...item, quantity: 1 }]);
      alert(`${item.productName} added to cart!`); // Corrected string formatting
    } else {
      alert(`${item.productName} is already in your cart!`); // Corrected string formatting
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
*/import React, { useEffect,createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);  // Track loading state for API calls
  const [error, setError] = useState(null); // Handle errors if needed
// Fetch cart from server
const fetchCart = async () => {
  setLoading(true);
  const token = localStorage.getItem("auth_token");

  if (!token) {
    alert("No token found. Please log in.");
    setLoading(false);
    return;
  }

  try {
    const response = await fetch("http://localhost:4000/cart/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Assuming the API sends the `items` array under `data.items`
      setCart(data.items); // Set the cart with the fetched items
    } else {
      console.error("Error response:", data);
      alert(data.message || "Error fetching cart.");
    }
  } catch (err) {
    console.error("Error fetching cart:", err);
    alert("Something went wrong, please try again.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchCart(); // Fetch the cart data when the component mounts
}, []);
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
          quantity: 1,
          images:item.images,
          productName: item.productName, // Include product name
        new_price: item.new_price, // Default quantity of 1
        }),
      });
  
      console.log("Response status:", response.status); // Log response status
      const data = await response.json();
      console.log("Response data:", data); // Log response data
  
      if (response.ok) {
        alert(`${item.productName} added to cart!`);
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
      // Store the response in a variable
      const response = await fetch(`http://localhost:4000/cartss/remove`, {
        method: "POST",  // Change method to POST
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productid }), // Send product ID in the request body
      });
  
      // Parse response JSON
      const data = await response.json();
  
      if (response.ok) {
        alert("Item removed from cart.");
        setCart((prevCart) => prevCart.filter((item) => item.productid !== productid));  
      } else {
        console.error("Error response:", data);
        alert(data.message || "Error removing product from cart.");
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false);  
    }
  };
  const updateQuantity = async (productid, newQuantity) => {
    if (newQuantity <= 0) {
      console.error('Quantity must be greater than zero.');
      return; // Prevent invalid quantities
    }
    const token = localStorage.getItem("auth_token");
    try {
      const response = await fetch(`http://localhost:4000/cart/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          productid,
          quantity: newQuantity,
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to update cart: ${errorText}`);
        return;
      }
  
      const data = await response.json();
      // Update the cart in the state after a successful update
      setCart((prevCart) => 
        prevCart.map((item) => 
          item.productid === productid ? { ...item, quantity: newQuantity } : item
        )
      );
  
      console.log('Cart updated successfully:', data.item);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };
  
  // Dynamic cart count (total items including quantities)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeItem, fetchCart,cartCount, loading, error ,updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};
