import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import { WishlistContext } from "../WishlistContext";
import { CartContext } from "../CartContext";
import "./Anklets.css";

const Anklets = () => {
  // Access context values
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { cart, addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // State for neckpieces and error handling
  const [anklets, setAnklets] = useState([]);
  const [error, setError] = useState("");

  // Fetch neckpieces data
  useEffect(() => {
    fetch("http://localhost:4000/anklets") // Replace with your API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setAnklets(data.data);
        } else {
          setError("No anklets found.");
        }
      })
      .catch((error) => {
        setError("Error fetching anklets: " + error.message);
      });
  }, []);

  // Check if product is in wishlist
  const isInWishlist = (product) => wishlist.some((item) => item.id === product.id);

  // Check if product is in cart
  const isInCart = (product) => cart.some((item) => item.id === product.id);

  return (
    <div className="anklets-container">
      <Header />

      <h1>Welcome to the anklets Collection!</h1>

      {error && <p className="error-message">{error}</p>}

      {/* Product Grid */}
      <div className="product-grid">
        {anklets.map((product) => (
          <div className="product-card" key={product.id}>
            {/* Wishlist Icon */}
            <div
              className={`wishlist-icon ${isInWishlist(product) ? "active" : ""}`}
              onClick={() => {
                if (isInWishlist(product)) {
                  removeFromWishlist(product);
                } else {
                  addToWishlist(product);
                }
              }}
            >
              ♥
            </div>

            {/* Product Image */}
            <Link to={`/product/${product.id}`}>
            <img src={product.image} alt={product.name} className="product-image" />
            </Link>


            {/* Product Details */}
            <h3>{product.name}</h3>
            <p>Price: ₹{product.new_price}</p>
            <p className="original-price">Original Price: ₹{product.old_price}</p>

            {/* Add to Cart Button */}
            <button
              className="add-to-cart-btn"
              onClick={() => {
                if (!isInCart(product)) {
                  addToCart(product);
                }
              }}
            >
              {isInCart(product) ? "In Cart" : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>

      {/* New Design Steps Section */}
      <div className="design-steps">
        <h3>Next Step for Design</h3>
        <div className="design-options">
          <div
            className="design-option"
            onClick={() => navigate("/browse-design")}
            role="button"
            aria-label="Browse Design"
          >
            Browse Design →
          </div>
          <div
            className="design-option"
            onClick={() => navigate("/CustomDesignPage")}
            role="button"
            aria-label="Custom Design"
          >
            Custom Design →
          </div>
          <div
            className="design-option"
            onClick={() => navigate("/upload-design")}
            role="button"
            aria-label="Upload Design and Checkout"
          >
            Upload Design and Checkout →
          </div>
        </div>
      </div>
    <Footer/>
    </div>
    
  );
 
};

export default Anklets;
