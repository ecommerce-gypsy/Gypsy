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
*/
import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state for API calls
  const [error, setError] = useState(null); // Handle errors if needed
  const [hasToken, setHasToken] = useState(false); // Track if token is available

  const token = localStorage.getItem("auth_token");

  // Check if token exists on component mount
  useEffect(() => {
    if (token) {
      setHasToken(true);
      fetchCart(); // Fetch cart data if token is available
    } else {
      setHasToken(false);
    }
  }, [token]);

  // Fetch cart items from the server
  const fetchCart = async () => {
    if (!hasToken) return; // If no token, don't fetch

    setLoading(true);
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
        setCart(data.items || []); // Set the cart with the fetched items
      } else {
        setError(data.message || "Error fetching cart.");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart with default quantity of 1
  const addToCart = async (item) => {
    if (!hasToken) {
      alert("No token found. Please log in.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/cartss/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          productid: item.productid, // Send productid directly
          quantity: 1,
          images: item.images,
          productName: item.productName,
          new_price: item.new_price,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`${item.productName} added to cart!`);
        setCart((prevCart) => [...prevCart, { ...item, quantity: 1 }]); // Add to cart state
      } else {
        setError(data.message || "Error adding product to cart.");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productid) => {
    if (!hasToken) {
      alert("No token found. Please log in.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/cartss/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productid }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Item removed from cart.");
        setCart((prevCart) => prevCart.filter((item) => item.productid !== productid)); // Update cart state
      } else {
        setError(data.message || "Error removing product from cart.");
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update quantity of item in cart
  const updateQuantity = async (productid, newQuantity) => {
    if (!hasToken) {
      alert("No token found. Please log in.");
      return;
    }

    if (newQuantity <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productid, quantity: newQuantity }),
      });

      const data = await response.json();
      if (response.ok) {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.productid === productid ? { ...item, quantity: newQuantity } : item
          )
        );
        alert("Cart updated successfully.");
      } else {
        setError(data.message || "Error updating cart.");
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total items count in cart (considering quantities)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeItem,
        fetchCart,
        cartCount,
        loading,
        error,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
