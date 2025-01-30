import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Footer from "../Components/Footer/Footer";
import AnkletBanner from "../Components/AnkletBanner/AnkletBanner";
import { WishlistContext } from "../Context/WishlistContext";
import { CartContext } from "../Context/CartContext";
import SearchBar from "../Components/SearchBar/SearchBar";
import Filter from "../Components/Filter/Filter";
import "./Anklets.css";
import Breadcrumb from "../Components/Breadcrumb/Breadcrumb";

const Anklets = () => {
  // Context values
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { cart, addToCart } = useContext(CartContext);
  //const navigate = useNavigate();

  // State management
  const [anklets, setAnklets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12); // Number of visible items

  // Fetch anklets data
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:4000/anklets")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch data");
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setAnklets(data.data);
          setError("");
        } else {
          setError("No anklets found.");
        }
      })
      .catch((error) => setError("Error fetching anklets: " + error.message))
      .finally(() => setLoading(false));
  }, []);

  // Utility functions
  const isInWishlist = (product) => wishlist.some((item) => item.productid === product.productid);
  const isInCart = (product) => cart.some((item) => item.productid === product.productid);

  // Render anklet card
  const renderAnkletCard = (product) => (
    <div className="product-card" key={product.productid}>
      {/* Wishlist Icon */}
      <div
        className={`wishlist-icon ${isInWishlist(product) ? "active" : ""}`}
        onClick={() =>
          isInWishlist(product) ? removeFromWishlist(product) : addToWishlist(product)
        }
        aria-label={isInWishlist(product) ? "Remove from wishlist" : "Add to wishlist"}
      >
        ♥
      </div>

      {/* Product Image */}
      <Link to={`/product/${product.productid}`}>
        <img src={product.images[0]} alt={product.name} className="product-image" />
      </Link>

      {/* Product Details */}
      <div className="anklets-name">{product.name}</div>
      <div className="anklets-price">
        <span className="new-price">₹{product.new_price}</span>{" "}
        {product.old_price && <span className="old-price">₹{product.old_price}</span>}
      </div>

      {/* Add to Cart Button */}
      <button
        className="add-to-cart-btn"
        onClick={() => {
          if (!isInCart(product)) addToCart(product);
        }}
      >
        {isInCart(product) ? "In Cart" : "Add to Cart"}
      </button>
    </div>
  );

  // Render design steps
  {/*const renderDesignSteps = () => (
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
  );*/}

  // Handle "View More" click
  const handleViewMore = () => {
    setVisibleCount((prevCount) => prevCount + 12);
  };

  return (
    <div className="anklets-container">
   
      <Breadcrumb />
      <AnkletBanner />

      <h1>Welcome to the Anklets Collection!</h1>
      {error && <p className="error-message">{error}</p>}

      {/* Search and Filter */}
      <SearchBar />
      <Filter />

      {/* Product Grid */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="product-grid">
          {anklets.slice(0, visibleCount).map(renderAnkletCard)}
        </div>
      )}

      {/* View More Button */}
      {!loading && visibleCount < anklets.length && (
        <div className="view-more-container">
          <button className="view-more-btn" onClick={handleViewMore}>
            View More
          </button>
        </div>
      )}

      {/* Design Steps 
     {renderDesignSteps()}*/}

      <Footer />
    </div>
  );
};

export default Anklets;
