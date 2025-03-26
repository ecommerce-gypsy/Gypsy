import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Breadcrumb from "../Components/Breadcrumb/Breadcrumb";
import Filter from "../Components/Filter/Filter";
import Footer from "../Components/Footer/Footer";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { categoryId } = useParams(); 
  const [categoryName, setCategoryName] = useState(""); // State to store category name
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(4); 

  // Fetch category name and products based on categoryId
  useEffect(() => {
    // Fetch category name first
    fetch(`http://localhost:4000/api/categories/${categoryId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch category name");
        return response.json();
      })
      .then((categoryData) => {
        if (categoryData.success) {
          setCategoryName(categoryData.data.name); // Set category name
        } else {
          setError("Category not found.");
        }
      })
      .catch((error) => setError("Error fetching category name: " + error.message));

    // Fetch products for the category
    fetch(`http://localhost:4000/api/categories/${categoryId}/products`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch products");
        return response.json();
      })
      .then((data) => {
        if (data.success) setProducts(data.data);
        else setError("No products found in this category.");
      })
      .catch((error) => setError("Error fetching products: " + error.message));
  }, [categoryId]); 

  const handleViewMore = () => {
    setVisibleCount((prevCount) => prevCount + 4); // Show 4 more products on each click
  };

  const renderProductCard = (product) => (
    <div className="product-card" key={product.productid}>
      {/* Product Image */}
      <Link to={`/product/${product.productid}`}>
        <img src={product.images[0]} alt={product.productName} className="product-image" />
      </Link>

      {/* Product Details */}
      <div className="product-name">{product.productName}</div>
      <div className="product-price">
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
        disabled={product.stock === 0}
        onClick={() => {
          if (product.stock > 0) {
            // Logic to add to cart (you can extend this logic as needed)
          }
        }}
      >
        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );

  return (
    <div className="category-container">
      <Breadcrumb />
      {/* Use the category name dynamically here */}
      <h1>{categoryName ? `${categoryName} Collection` : "Loading..."}</h1>
      
      {error && <p className="error-message">{error}</p>} {/* Display error message if any */}

      <Filter />

      <div className="product-grid">
        {products.slice(0, visibleCount).map(renderProductCard)}
      </div>

      {visibleCount < products.length && (
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

export default CategoryPage;
