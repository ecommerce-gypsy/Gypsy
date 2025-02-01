import React, { createContext, useState, useEffect } from "react";
export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasToken, setHasToken] = useState(false); 
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    if (token) {
      setHasToken(true);
    } else {
      setHasToken(false);
    }
  }, [token]);

  const fetchWishlist = async () => {
    if (!hasToken) return; 

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
        setWishlist(data.items || []);
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
    if (hasToken) {
      fetchWishlist(); // Only fetch if token is available
    }
  }, [hasToken]); // Re-run when the hasToken state changes

  const addToWishlist = async (item) => {
    if (!hasToken) {
      alert("Please log in.");
      return;
    }

    setLoading(true);
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
          images: item.images[0],
        }),
      });

      const data = await response.json();
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
    const productid = item.productid;
    if (!hasToken) {
      alert("No token found. Please log in.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/wishlist/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productid }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Item removed from wishlist.");
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.productid !== productid)
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
