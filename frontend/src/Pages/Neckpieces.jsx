import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Neckpieces.css";
import { WishlistContext } from "../WishlistContext"; // Wishlist context
import { CartContext } from "../CartContext"; // Cart context
import Header from "../Components/Header/Header"; // Header component

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

  const isInWishlist = (file) => wishlist.some((item) => item.id === file.id);

  const handleAddToCart = (file) => {
    addToCart(file);
    navigate("/cart");
  };

  return (
    <div className="neckpieces-container">
      <Header />

      <h1>Welcome to the NECKPIECES Collection!</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="container">
        {neckpieces.map((file) => (
          <div key={file.id} className="neckpiece-card">
            <div className="neckpiece-image-container">
              {/* Wishlist Icon - Only Rendered Once */}
              <div
                className={`heart-icon ${isInWishlist(file) ? "active" : ""}`}
                onClick={() => {
                  if (isInWishlist(file)) {
                    removeFromWishlist(file);
                  } else {
                    addToWishlist(file);
                  }
                }}
              >
              
              </div>

              {/* Product Image */}
              <Link to={`/product/${file.id}`}>
                <img src={file.image} alt={file.name} className="product-image" />
              </Link>
            </div>
            <div className="neckpiece-name">{file.name}</div>
            <div className="neckpiece-price">
              <span className="new-price">₹{file.new_price}</span>{" "}
              <span className="old-price">₹{file.old_price}</span>
            </div>
            <button
              className="add-to-cart-btn"
              onClick={() => handleAddToCart(file)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <button className="customize-btn" onClick={() => navigate("/customize")}>
        Customize
      </button>
    </div>
  );
};

export default Neckpieces;
