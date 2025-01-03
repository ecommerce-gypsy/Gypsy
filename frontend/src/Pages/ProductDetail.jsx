import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetail.css";

// Import towel images
import a1_img from "../Components/Assets/a1.png";
import a2_img from "../Components/Assets/a2.png";
import a3_img from "../Components/Assets/a3.png";
import a4_img from "../Components/Assets/a4.png";
import a5_img from "../Components/Assets/a5.png";

// Define the towel data
const anklets = [
  {
    id: 1,
    name: "Evil Eye Bracelet",
    images: [a1_img, a2_img, a3_img, a4_img, a5_img],
    new_price: 130.0,
    old_price: 180.0,
  },
  {
    id: 2,
    name: "Tropical Rainbow Anklet",
    images: [a1_img, a2_img, a3_img, a4_img, a5_img],
    new_price: 130.0,
    old_price: 180.0,
  },
  {
    id: 3,
    name: "Evil eye broad beads",
    images: [a1_img, a2_img, a3_img, a4_img, a5_img],
    new_price: 130.0,
    old_price: 180.0,
  },
  {
    id: 4,
    name: "Ocean Aura Anklets",
    images: [a1_img, a2_img, a3_img, a4_img, a5_img],
    new_price: 130.0,
    old_price: 180.0,
  },
  {
    id: 5,
    name: "Multicolour with small pendant",
    images: [a1_img, a2_img, a3_img, a4_img, a5_img],
    new_price: 130.0,
    old_price: 180.0,
  },
];

const ProductDetail = () => {
  const { id } = useParams(); // Retrieve the product ID from the URL
  const product = anklets.find((anklet) => anklet.id === parseInt(id)); // Find the product by ID

  const [mainImage, setMainImage] = useState(product?.images?.[0] || ""); // Main image state
  const [pincode, setPincode] = useState(""); // Pincode state

  // Handle pincode input
  const handlePincodeCheck = () => {
    alert(`Checking delivery availability for pincode: ${pincode}`);
  };

  if (!product) {
    return <div>Product not found!</div>; // Handle case where the product isn't found
  }

  return (
    <div className="product-detail">
      {/* Left Section - Image Gallery */}
      <div className="image-gallery">
        <img src={mainImage} alt={product.name} className="main-image" />
        {/* Thumbnails */}
        <div className="thumbnails">
          {product.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="thumbnail"
              onClick={() => setMainImage(image)} // Update the main image on click
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
          <strong>Description:</strong> A detailed description about the product. You can customize this description as
          needed.
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
