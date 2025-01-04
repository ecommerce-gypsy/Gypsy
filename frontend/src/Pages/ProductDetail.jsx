import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import "./ProductDetail.css";

// Import images
import a1_img from "../Components/Assets/a1.png";
import a2_img from "../Components/Assets/a2.png";
import a3_img from "../Components/Assets/a3.png";
import a4_img from "../Components/Assets/a4.png";
import a5_img from "../Components/Assets/a5.png";

// Define product data
const anklets = [
  {
    id: 1,
    name: "Evil Eye Bracelet",
    images: [a1_img, a2_img, a3_img, a4_img, a5_img],
    new_price: 130.0,
    old_price: 180.0,
  },
  // Other products...
];

const ProductDetail = () => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate(); // Create navigate instance
  const product = anklets.find((anklet) => anklet.id === parseInt(id));

  const [mainImage, setMainImage] = useState(product?.images?.[0] || "");
  const [pincode, setPincode] = useState("");
  const [size, setSize] = useState("2.5 x 5");
  const [quantity, setQuantity] = useState(1);
  const [printedSide, setPrintedSide] = useState("Single Side");

  const calculateTotalPrice = () => {
    const basePrice = product.new_price;
    const sizeMultiplier = size === "2.5 x 5" ? 1 : size === "3 x 6" ? 1.2 : 1.5;
    const sideMultiplier = printedSide === "Single Side" ? 1 : 1.5;
    return (basePrice * sizeMultiplier * sideMultiplier * quantity).toFixed(2);
  };

  const handlePincodeCheck = () => {
    alert(`Checking delivery availability for pincode: ${pincode}`);
  };

  if (!product) {
    return <div>Product not found!</div>;
  }

  return (
    <div className="product-detail">
      {/* Left Section - Image Gallery */}
      <div className="image-gallery">
        <img src={mainImage} alt={product.name} className="main-image" />
        <div className="thumbnails">
          {product.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="thumbnail"
              onClick={() => setMainImage(image)}
              role="button"
              aria-label={`Thumbnail ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right Section - Product Information */}
      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">
          <strong>₹{product.new_price.toFixed(2)}</strong>
          <span className="old-price">₹{product.old_price.toFixed(2)}</span>
          <span className="discount">
            (Save {((1 - product.new_price / product.old_price) * 100).toFixed(0)}%)
          </span>
        </p>
        <p className="description">
          <strong>Description:</strong> A unique anklet designed to complement your style.
        </p>

        {/* Delivery Check */}
        <div className="delivery-check">
          <input
            type="text"
            placeholder="Enter a Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            aria-label="Enter your pincode"
          />
          <button onClick={handlePincodeCheck}>Check</button>
        </div>

        {/* Price Calculator */}
        <div className="price-calculator">
          <h2>Price Calculator</h2>
          <div className="calculator-row">
            <label>Category:</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="Adult">Adult</option>
              <option value="child">Child</option>
            
            </select>
          </div>
          <div className="calculator-row">
            <label>Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
          </div>
          <div className="calculator-row">
            <label>Set</label>
            <select value={printedSide} onChange={(e) => setPrintedSide(e.target.value)}>
              <option value="Single">Single</option>
              <option value="Pair">Pair</option>
            </select>
          </div>
          <div className="calculator-row">
            <strong>Total (Incl. of all Taxes):</strong>
            <span>₹ {calculateTotalPrice()}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button className="add-to-cart">Add To Cart</button>

      
        {/* Offers Section */}
        <div className="offers">
          <p>Save extra with below offers:</p>
          <ul>
            <li className="offer-item">5% off on card payment</li>
            <li className="offer-item">10% off on UPI payment</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
