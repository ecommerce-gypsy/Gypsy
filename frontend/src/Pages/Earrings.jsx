import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
//import EarringsBanner from "../Components/EarringsBanner/EarringsBanner"; // Update with appropriate banner for earrings
import { WishlistContext } from "../Context/WishlistContext";
import { CartContext } from "../Context/CartContext";
import SearchBar from "../Components/SearchBar/SearchBar";
import Filter from "../Components/Filter/Filter";
import "./Earrings.css"; 
import Breadcrumb from "../Components/Breadcrumb/Breadcrumb";

const Earrings = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { cart, addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [earrings, setEarrings] = useState([]);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(4); // Number of visible items

  useEffect(() => {
    fetch("http://localhost:4000/earrings") // Update the API endpoint to fetch earrings data
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch data");
        return response.json();
      })
      .then((data) => {
        if (data.success) setEarrings(data.data);
        else setError("No earrings found.");
      })
      .catch((error) => setError("Error fetching earrings: " + error.message));
  }, []);

  const isInWishlist = (product) => wishlist.some((item) => item.productid === product.productid);
  const isInCart = (product) => cart.some((item) => item.productid === product.productid);

  const renderEarringCard = (product) => (
    <div className="product-card" key={product.productid}>
      {/* Wishlist Icon */}
      <div
        className={`wishlist-icon ${isInWishlist(product) ? "active" : ""}`}
        onClick={() => (isInWishlist(product) ? removeFromWishlist(product) : addToWishlist(product))}
      >
        ♥
      </div>

      {/* Product Image */}
      <Link to={`/product/${product.productid}`}>
        <img src={product.images[0]} alt={product.productName} className="product-image" />
      </Link>

      {/* Product Details */}
      <div className="earrings-name">{product.productName}</div>
      <div className="earrings-price">
        <span className="new-price">₹{product.new_price}</span>{" "}
        <span className="old-price">₹{product.old_price}</span>
      </div>

      {/* Out of Stock Badge */}
      {product.stock === 0 && <span className="out-of-stock-badge">Out of Stock</span>}

      {/* Low Stock Badge */}
      {product.stock > 0 && product.stock <= 5 && (
        <span className="low-stock">{product.stock} left! Hurry up!</span>
      )}

      {/* Add to Cart Button */}
      <button
        className="add-to-cart-btn"
        onClick={() => {
          if (!isInCart(product) && product.stock > 0) addToCart(product);
        }}
        disabled={product.stock === 0}
      >
        {isInCart(product) ? "In Cart" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );

  const handleViewMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  return (
    <div className="earrings-container">
      <Breadcrumb />
     {/* <EarringsBanner />  Use an appropriate banner for earrings */}

      <h1>Find Your Perfect Pair of Earrings!</h1>
      {error && <p className="error-message">{error}</p>}

      <Filter />

      <div className="product-grid">
        {earrings.slice(0, visibleCount).map(renderEarringCard)}
      </div>

      {visibleCount < earrings.length && (
        <div className="view-more-container">
          <button className="view-more-btn" onClick={handleViewMore}>
            View More
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Earrings;
