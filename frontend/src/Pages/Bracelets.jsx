import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Bracelets.css"; 
import { WishlistContext } from "../Context/WishlistContext";
import { CartContext } from "../Context/CartContext";
import Header from "../Components/Header/Header"; 

const Bracelets = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [bracelets, setBracelets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/bracelets")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setBracelets(data.data);
        } else {
          setError("No bracelets found.");
        }
      })
      .catch((error) => {
        setError("Error fetching bracelets: " + error.message);
      });
  }, []);

  const isInWishlist = (product) =>
    wishlist.some((item) => item.productid === product.productid);

  const handleAddToCart = (product) => {
    if (product.stock === 0) return; 
    addToCart(product);
    navigate("/cart");
  };

  return (
    <div>
      <Header />
      <h1>Welcome to the BRACELETS category page!</h1>

      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="product-grid">
          {bracelets.map((product) => (
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

              {/* Product Image & Out of Stock Label */}
              <div className="product-image-container">
                <Link to={`/product/${product.productid}`}>
                  <img src={product.images[0]} alt={product.productName} className="product-image" />
                </Link>
                {product.stock === 0 && <span className="out-of-stock-badge">Out of Stock</span>}
              </div>

              {/* Product Name */}
              <div className="bracelets-name">{product.productName}</div>

              {/* Pricing */}
              <div className="bracelets-price">
                <span className="new-price">₹{product.new_price}</span>{" "}
                <span className="old-price">₹{product.old_price}</span>
              </div>

              {/* Add to Cart Button */}
              {product.stock > 0 && (
                <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <button className="customize-btn" onClick={() => navigate("/customize")}>
        Customize
      </button>
    </div>
  );
};

export default Bracelets;
