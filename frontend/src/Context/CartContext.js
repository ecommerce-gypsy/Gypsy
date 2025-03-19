import React, { createContext, useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify"; // Ensure ToastContainer is properly imported
import "react-toastify/dist/ReactToastify.css"; // Import the toast CSS

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasToken, setHasToken] = useState(false);

  const token = localStorage.getItem("auth_token");

  const fetchCart = useCallback(async () => {
    if (!token) return; // Exit if no token

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/cart/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization":` Bearer ${token}`,
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
  }, [token]);

  useEffect(() => {
    if (token) {
      setHasToken(true);
      fetchCart();
    } else {
      setHasToken(false);
    }
  }, [token, fetchCart]);

  const addToCart = async (item) => {
    const token = localStorage.getItem("auth_token");
    if (!hasToken) {
      toast.error("No token found. Please log in.");
      return;
    }

    const existingItem = cart.find((cartItem) => cartItem.productid === item.productid);
    if (existingItem) {
      toast.info(`${item.productName} is already in your cart!`);
      return;
    }

    if (item.stock <= 0) {
      toast.error("This product is out of stock!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":`Bearer ${token}`,
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
        toast.success(`${item.productName} added to cart!`);
        setCart((prevCart) => {
          if (!prevCart.find((cartItem) => cartItem.productid === item.productid)) {
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
    setCart([]);
    toast.info("Cart has been emptied!");
  };

  const removeItem = async (item) => {
    const productid = item.productid;
    if (!hasToken) {
      toast.error("No token found. Please log in.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productid }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Item removed from cart.");
        setCart((prevCart) => prevCart.filter((item) => item.productid !== productid));
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
      toast.error("No token found. Please log in.");
      return;
    }

    const product = cart.find((item) => item.productid === productid);
    if (!product) {
      toast.error("Product not found in cart.");
      return;
    }

    if (newQuantity > product.stock) {
      toast.error(`Only ${product.stock} items are available in stock.`);
      return;
    }

    if (newQuantity <= 0) {
      toast.error("Quantity must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/cart/update", {
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
        toast.success("Cart updated successfully.");
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

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeItem,
        updateQuantity,
        fetchCart,
        setCart,
        emptyCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};