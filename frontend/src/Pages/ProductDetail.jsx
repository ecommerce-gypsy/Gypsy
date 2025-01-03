import React from "react";
import { useParams } from "react-router-dom";
import evilEyeBracelet from "../Components/Assets/a1.png";
import TropicalRainbowAnklet from "../Components/Assets/a2.png";
import boldbeads from "../Components/Assets/a3.png";
import OceanAuraAnklets from "../Components/Assets/a4.png";
import multicolour from "../Components/Assets/a5.png";
import "./ProductDetail.css"; // Import CSS for styling

const ProductDetail = () => {
  // Sample product data (same as Anklets.jsx)
  const products = [
    {
      id: 1,
      name: "Evil Eye Bracelet",
      price: 250,
      originalPrice: 500,
      description: "A stylish Evil Eye Bracelet made with high-quality materials.",
      image: evilEyeBracelet,
    },
    {
      id: 2,
      name: "Tropical Rainbow Anklet",
      price: 300,
      originalPrice: 600,
      description: "Bright and colorful Tropical Rainbow Anklet for every occasion.",
      image: TropicalRainbowAnklet,
    },
    {
      id: 3,
      name: "Evil eye broad beads",
      price: 350,
      originalPrice: 700,
      description: "Elegant and bold Evil Eye Broad Beads for added charm.",
      image: boldbeads,
    },
    {
      id: 4,
      name: "Ocean Aura Anklets",
      price: 350,
      originalPrice: 700,
      description: "Feel the ocean vibes with these beautiful Ocean Aura Anklets.",
      image: OceanAuraAnklets,
    },
    {
      id: 5,
      name: "Multicolour with small pendant",
      price: 350,
      originalPrice: 700,
      description: "Multicolor anklet with a delicate pendant for a vibrant look.",
      image: multicolour,
    },
  ];

  const { id } = useParams(); // Get the product ID from the URL
  const product = products.find((p) => p.id === parseInt(id)); // Find the product by ID

  if (!product) {
    return <h2>Product not found</h2>;
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        <img src={product.image} alt={product.name} className="product-detail-image" />
        <div className="product-info">
          <h1>{product.name}</h1>
          <p>Price: ₹{product.price}</p>
          <p className="original-price">Original Price: ₹{product.originalPrice}</p>
          <p>{product.description}</p>
          <button className="buy-now-button">Buy Now</button>
          <button className="add-to-cart-button">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
