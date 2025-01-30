import React, { createContext, useState, useEffect } from "react";
export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state for API calls
  const [error, setError] = useState(null); // Handle errors if needed

  const token = localStorage.getItem("auth_token");
  const fetchWishlist = async () => {
    if (!token) return; // Avoid fetching if there's no token
  
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/wishlist/get", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        // Assuming the API returns items with product details attached
        setWishlist(data.items || []); // Here you update the wishlist with full item data
      } else {
        setError(data.message || "Error fetching wishlist.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchWishlist(); // Fetch wishlist when token is available
    }
  }, [token]);
  
  const addToWishlist = async (item) => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("No token found. Please log in.");
      setLoading(false);
      return;
    }
  
    // Debug: Log the item to check the image data
    console.log('Item to be added to wishlist:', item);
  
    try {
      const response = await fetch("http://localhost:4000/wishlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          productid: item.productid,
          productName: item.productName,
          new_price: item.new_price,
          images: item.images[0],  // Ensure item.images is an array and has a valid URL
        }),
      });
  
      const data = await response.json();
  console.log("Item: " ,item.productid);
      if (response.ok) {
        alert(`${item.productName} added to wishlist!`);
        setWishlist((prevWishlist) => [...prevWishlist, item]);
      } else {
        alert(data.message || "Error adding product to wishlist.");
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };
  const removeFromWishlist = async (item) => {
    const productid = item.productid; // Extract productid from the item
    setLoading(true);
    console.log("Removing product with productid:", productid);
  const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("No token found. Please log in.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch("http://localhost:4000/wishlist/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productid }), // Directly use productid
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Item removed from wishlist.");
        // Remove from local state
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.productid !== productid) // Remove based on productid
        );
      } else {
        alert(data.message || "Error removing product from wishlist.");
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <WishlistContext.Provider value={{ wishlist, setWishlist, addToWishlist, removeFromWishlist, loading, error }}>
      {children}
    </WishlistContext.Provider>
  );
};
