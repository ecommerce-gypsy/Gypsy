import React from "react";
import { Link } from "react-router-dom";

import evilEyeBracelet from '../Components/Assets/a1.png'; 
import TropicalRainbowAnklet from '../Components/Assets/a2.png'; 
import boldbeads from '../Components/Assets/a3.png'; 
import OceanAuraAnklets from '../Components/Assets/a4.png'; 
import multicolour from '../Components/Assets/a5.png'; 

import "./Anklets.css"; // Import the CSS file

const Anklets = () => {
  // Sample product data
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

  return (
    <div className="anklets-container">
      <h1>Welcome to the Anklets Collection!</h1>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <Link to={`/product/${product.id}`}>
              <img src={product.image} alt={product.name} className="product-image" />
            </Link>
            <h3>{product.name}</h3>
            <p>Price: ₹{product.price}</p>
            <p className="original-price">Original Price: ₹{product.originalPrice}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Anklets;
