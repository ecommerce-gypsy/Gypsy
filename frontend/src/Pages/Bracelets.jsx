import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WishlistContext } from "../Context/WishlistContext";
import { CartContext } from "../Context/CartContext";
import Header from "../Components/Header/Header";
import './Bracelets.css';

const Bracelets = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [bracelets, setBracelets] = useState([]);
  const [error, setError] = useState("");  
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    fetch("http://localhost:4000/bracelets")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Received data:", data);  
        if (data.success) {
          console.log("Bracelets data:", data.data);  
          setBracelets(data.data);  
        } else {
          setError("No bracelets found.");
        }
      })
      .catch((error) => {
        setError("Error fetching bracelets: " + error.message);
      })
      .finally(() => {
        setLoading(false);  
      });
  }, []);

  const isInWishlist = (product) =>
    wishlist.some((item) => item.productid === product.productid);

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      return;
    }
    console.log("Product", product);
    addToCart(product);
    navigate("/cart");
  };

  return (
    <div>
      <Header />
      <h1>Welcome to the BRACELETS category page!</h1>

      {loading ? (
        <p>Loading...</p>  
      ) : error ? (
        <p className="error-message">{error}</p>  
      ) : (
        <div className="product-grid">
          {bracelets.map((product) => (
            <div className="product-card" key={product.productid}>
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
              <Link to={`/product/${product.productid}`}>
                <img src={product.images[0]} alt={product.productName} className="product-image" />
              </Link>
              <div className="bracelets-name">{product.productName}</div>
              <div className="bracelets-price">
                <span className="new-price">₹{product.new_price}</span>
                <span className="old-price">₹{product.old_price}</span>
              </div>


              {product.stock === 0 ? (
  <>
    <p className="out-of-stock">Out of Stock</p>
    {console.log(`Out of Stock: ${product.productName}`)} 
  </>
) : (
  <>
    {product.stock <5 && (
      <>
       <p className="low-stock">{product.stock} left! Hurry up!</p>
        {console.log(`Low Stock: ${product.productName}`)} 
      </>
    )}
    <button
      className="add-to-cart-btn"
      onClick={() => handleAddToCart(product)}
    >
      Add to Cart
    </button>
  </>
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
