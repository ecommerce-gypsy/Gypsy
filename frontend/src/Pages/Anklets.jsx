import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import evilEyeBracelet from "../Components/Assets/a1.png";
import TropicalRainbowAnklet from "../Components/Assets/a2.png";
import boldbeads from "../Components/Assets/a3.png";
import OceanAuraAnklets from "../Components/Assets/a4.png";
import multicolour from "../Components/Assets/a5.png";

import "./Anklets.css";
import { WishlistContext } from "../WishlistContext";
import { CartContext } from "../CartContext"; // Import Cart Context
import Header from "../Components/Header/Header";

const Anklets = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { cart, addToCart } = useContext(CartContext); // Access Cart Context
  const navigate = useNavigate(); // Navigation hook

  const products = [
    {
      id: 1,
      name: "Evil Eye Bracelet",
      price: 250,
      originalPrice: 500,
      image: evilEyeBracelet,
    },
    {
      id: 2,
      name: "Tropical Rainbow Anklet",
      price: 300,
      originalPrice: 600,
      image: TropicalRainbowAnklet,
    },
    {
      id: 3,
      name: "Evil eye broad beads",
      price: 350,
      originalPrice: 700,
      image: boldbeads,
    },
    {
      id: 4,
      name: "Ocean Aura Anklets",
      price: 350,
      originalPrice: 700,
      image: OceanAuraAnklets,
    },
    {
      id: 5,
      name: "Multicolour with small pendant",
      price: 350,
      originalPrice: 700,
      image: multicolour,
    },
  ];

  const isInWishlist = (product) => wishlist.some((item) => item.id === product.id);
  const isInCart = (product) => cart.some((item) => item.id === product.id);

  return (
    <div className="anklets-container">
      <Header />
      <h1>Welcome to the Anklets Collection!</h1>

      {/* Product Grid */}
      <div className="product-grid">
        {products.map((product) => (
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
            ></div>

            {/* Product Image */}
            <Link to={`/product/${product.id}`}>
              <img src={product.image} alt={product.name} className="product-image" />
            </Link>

            {/* Product Details */}
            <h3>{product.name}</h3>
            <p>Price: ₹{product.price}</p>
            <p className="original-price">Original Price: ₹{product.originalPrice}</p>

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
    </div>
  );
};

export default Anklets;
