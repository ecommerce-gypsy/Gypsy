import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetail.css";
import { CartContext } from "../Context/CartContext";
import ReviewSummary from '../Components/ReviewSummary/ReviewSummary';

const ProductDetail = () => {
  const { id } = useParams();
  const productId = Number(id);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, addToCart } = useContext(CartContext);
  const [mainImage, setMainImage] = useState("");
  const [category, setCategory] = useState("Adult");
  const [setOption, setSetOption] = useState("Single");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:4000/products/${productId}`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        
        const data = await response.json();
        setMainImage(data.images?.[0] || "");
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const calculateTotalPrice = () => {
    if (!product) return "0.00";

    const basePrice = product.new_price || 0;
    const categoryMultiplier = category === "Adult" ? 1 : 0.8;
    const setMultiplier = setOption === "Single" ? 1 : 2;
    
    return (basePrice * categoryMultiplier * setMultiplier * quantity).toFixed(2);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found!</div>;

  return (
    <div className="product-detail">
      <div className="image-gallery">
        <img 
          src={mainImage || "default-image-url"} 
          alt={product.name} 
          className="main-image" 
        />
        <div className="thumbnails">
          {product.images?.map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt={`Thumbnail ${index + 1}`} 
              className="thumbnail" 
              onClick={() => setMainImage(image)} 
            />
          ))}
        </div>
      </div>

      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">
          <strong>₹{product.new_price?.toFixed(2) || "0.00"}</strong>
          {product.old_price && (
            <>
              <span className="old-price">₹{product.old_price.toFixed(2)}</span>
              <span className="discount">
                (Save {((1 - product.new_price / product.old_price) * 100).toFixed(0)}%)
              </span>
            </>
          )}
        </p>
        <p className="description"><strong>Description:</strong> {product.description}</p>

        <div className="category">
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Adult">Adult</option>
            <option value="Child">Child</option>
          </select>
        </div>

        <div className="set">
          <label>Set:</label>
          <select value={setOption} onChange={(e) => setSetOption(e.target.value)}>
            <option value="Single">Single</option>
            <option value="Pair">Pair</option>
          </select>
        </div>

        <div className="quantity">
          <label>Quantity:</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
            min="1" 
          />
        </div>

        <div className="total-price">
          <strong>Total Price (Incl. of all Taxes):</strong> <span>₹ {calculateTotalPrice()}</span>
        </div>

        <button 
          className="add-to-cart" 
          onClick={() => !cart.some((item) => item.productId === product.productId) && addToCart(product)}
        >
          {cart.some((item) => item.productId === product.productId) ? "In Cart" : "Add to Cart"}
        </button>

        <button 
          className="buy-now" 
          onClick={() => window.location.href = 
            `/checkout?productId=${productId}&quantity=${quantity}&totalPrice=${calculateTotalPrice()}`
          }
        >
          Buy Now
        </button>

        {/* Specifications Section */}
        <div className="specifications">
          <h2>Product Specifications</h2>
          <ul>
            {Object.entries(product.specifications || {}).map(([key, value]) => (
              <li key={key} className="spec-item">
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Review Summary Section */}
     {/* Add a defensive check */}
{product && productId && <ReviewSummary productId={productId} />}

      </div>
    </div>
  );
};

export default ProductDetail;
