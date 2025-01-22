import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import AnkletBanner from "../Components/AnkletBanner/AnkletBanner"; // Import AnkletBanner
import { WishlistContext } from "../Context/WishlistContext";
import { CartContext } from "../Context/CartContext";
import "./Anklets.css";

const Anklets = () => {
  // Access context values
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { cart, addToCart } = useContext(CartContext);

  // State for anklets and error handling
  const [anklets, setAnklets] = useState([]);
  const [error, setError] = useState("");

  // Fetch anklets data
  useEffect(() => {
    const fetchAnklets = async () => {
      try {
        const response = await fetch("http://localhost:4000/anklets"); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch anklets data.");
        }

        const data = await response.json();
        if (data.success) {
          setAnklets(data.data);
        } else {
          setError("No anklets found.");
        }
      } catch (err) {
        setError("Error fetching anklets: " + err.message);
      }
    };

    fetchAnklets();
  }, []);

  // Check if product is in wishlist
  const isInWishlist = (product) => wishlist.some((item) => item.productid === product.productid);

  // Check if product is in cart
  const isInCart = (product) => cart.some((item) => item.productid === product.productid);

  return (
    <div className="anklets-container">
      <Header />
      <AnkletBanner /> {/* Place the banner here */}
      <h1 className="anklets-heading">Welcome to the Anklets Collection!</h1>

      {error && <p className="error-message">{error}</p>}

      {/* Product Grid */}
      <div className="product-grid">
        {anklets.length > 0 ? (
          anklets.map((product) => (
            <div className="product-card" key={product.productid}>
              {/* Wishlist Icon */}
              <div
                className={`wishlist-icon ${isInWishlist(product) ? "active" : ""}`}
                onClick={() =>
                  isInWishlist(product)
                    ? removeFromWishlist(product)
                    : addToWishlist(product)
                }
                title={
                  isInWishlist(product) ? "Remove from Wishlist" : "Add to Wishlist"
                }
              >
                ♥
              </div>

              {/* Product Image */}
              <Link to={`/product/${product.productid}`} className="product-link">
                <img
                  src={product.images?.[0] || "/fallback-image.jpg"} // Fallback image
                  alt={product.name || "Product"}
                  className="product-image"
                />
              </Link>

              {/* Product Details */}
              <div className="product-details">
                <p className="product-name">{product.name}</p>
                <div className="product-price">
                  <span className="new-price">₹{product.new_price}</span>{" "}
                  <span className="old-price">₹{product.old_price}</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                className={`add-to-cart-btn ${isInCart(product) ? "in-cart" : ""}`}
                onClick={() => {
                  if (!isInCart(product)) {
                    addToCart(product);
                  }
                }}
              >
                {isInCart(product) ? "In Cart" : "Add to Cart"}
              </button>
            </div>
          ))
        ) : (
          <p className="empty-message">No products available right now.</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Anklets;
