import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import AnkletBanner from "../Components/AnkletBanner/AnkletBanner";
import { WishlistContext } from "../Context/WishlistContext";
import { CartContext } from "../Context/CartContext";
import SearchBar from "../Components/SearchBar/SearchBar";
import Filter from "../Components/Filter/Filter";
import "./Anklets.css";
import Breadcrumb from "../Components/Breadcrumb/Breadcrumb";

const Anklets = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { cart, addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [anklets, setAnklets] = useState([]);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(4); // Number of visible items

  useEffect(() => {
    fetch("http://localhost:4000/anklets")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch data");
        return response.json();
      })
      .then((data) => {
        if (data.success) setAnklets(data.data);
        else setError("No anklets found.");
      })
      .catch((error) => setError("Error fetching anklets: " + error.message));
  }, []);

  const isInWishlist = (product) => wishlist.some((item) => item.productid === product.productid);
  const isInCart = (product) => cart.some((item) => item.productid === product.productid);

  const renderAnkletCard = (product) => (
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
      <div className="anklets-name">{product.productName}</div>
      <div className="anklets-price">
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
  
    <div className="anklets-container">
    
      <Breadcrumb />
      <AnkletBanner />

      <h1>Embrace your free spirit with our stunning anklet collection!</h1>
      {error && <p className="error-message">{error}</p>}

      <Filter />

      <div className="product-grid">
        {anklets.slice(0, visibleCount).map(renderAnkletCard)}
      </div>

      {visibleCount < anklets.length && (
        <div className="view-more-container">
          <button className="view-more-btn" onClick={handleViewMore}>
            View More
          </button>
        </div>
      )}

     
<Footer/>
  
    </div>
  
  );
};

export default Anklets;
