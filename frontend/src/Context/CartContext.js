import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasToken, setHasToken] = useState(false);

  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    if (token) {
      setHasToken(true);
      fetchCart();
    } else {
      setHasToken(false);
    }
  }, [token]);

  const fetchCart = async () => {
    if (!hasToken) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/cartss/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCart(data.items || []);
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
  const addToCart = async (item) => {
    if (!hasToken) {
      alert("No token found. Please log in.");
      return;
    }
  
    // Check if the item is already in the cart
    const existingItem = cart.find((cartItem) => cartItem.productid === item.productid);
    if (existingItem) {
      alert(`${item.productName} is already in your cart!`);
      return;
    }
  
    // Check if the item is in stock
    if (item.stock <= 0) {
      alert("This product is out of stock!");
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/cartss/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          productid: item.productid,
          quantity: 1,
          images: item.images,
          productName: item.productName,
          new_price: item.new_price,
          stock: item.stock,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(`${item.productName} added to cart!`);
  
        // Add the item to the cart state only if it's not already there
        setCart((prevCart) => {
          if (!prevCart.find(cartItem => cartItem.productid === item.productid)) {
            return [...prevCart, { ...item, quantity: 1 }];
          }
          return prevCart;
        });
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
  const emptyCart = () => {
    setCart([]);  // Clear cart from state
  };
  
// Remove item from cart
const removeItem = async (item) => {
  const productid = item.productid;
  console.log("P ",productid);
  if (!hasToken) {
    alert("No token found. Please log in.");
    return;
  }

  setLoading(true);
  try {
    const response = await fetch("http://localhost:4000/api/cartss/remove", {
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

  const updateQuantity = async (productid, newQuantity) => {
    if (!hasToken) {
      alert("No token found. Please log in.");
      return;
    }

    const product = cart.find((item) => item.productid === productid);
    if (!product) {
      alert("Product not found in cart.");
      return;
    }

    if (newQuantity > product.stock) {
      alert(`Only ${product.stock} items are available in stock.`);
      return;
    }

    if (newQuantity <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/cartss/update", {
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

  return (
    <CartContext.Provider value={{ cart, addToCart,removeItem, updateQuantity, fetchCart, setCart,emptyCart }}>
      {children}
    </CartContext.Provider>
  );
};
