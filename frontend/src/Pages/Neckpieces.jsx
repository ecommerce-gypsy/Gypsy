import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Neckpieces.css";
import { WishlistContext } from "../Context/WishlistContext";
import { CartContext } from "../Context/CartContext";
import Header from "../Components/Header/Header"; // Header compo
import Footer from "../Components/Footer/Footer";

const Neckpieces = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [neckpieces, setNeckpieces] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/neckpieces") // Replace with your API endpoint
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setNeckpieces(data.data);
        } else {
          setError("No neckpieces found.");
        }
      })
      .catch((error) => {
        setError("Error fetching neckpieces: " + error.message);
      });
  }, []);

  const isInWishlist = (product) =>
    wishlist.some((item) => item.productid === product.productid);

  const handleAddToCart = (product) => {
    addToCart(product);
    navigate("/cart");
  };

  return (
    <div className="neckpieces-container">
      <Header />

      <h1>Welcome to the NECKPIECES Collection!</h1>

      {error && <p className="error-message">{error}</p>}

      {/* Product Grid */}
      <div className="product-grid">
        {neckpieces.map((product) => (
          <div className="product-card" key={product.productid}>
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
            <Link to={`/product/${product.productid}`}>
              <img
                src={product.images[0]}
                alt={product.name}
                className="product-image"
              />
            </Link>

            {/* Product Details */}
            <div className="neckpiece-name">{product.name}</div>
            <div className="neckpiece-price">
              <span className="new-price">₹{product.new_price}</span>{" "}
              <span className="old-price">₹{product.old_price}</span>
            </div>

            <button
              className="add-to-cart-btn"
              onClick={() => handleAddToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Customize Button */}
      <button className="customize-btn" onClick={() => navigate("/customize")}>
        Customize
      </button>
  
  <Footer/>

    </div>
  );
};

export default Neckpieces;
