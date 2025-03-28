import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import './Filter.css';

export const Filter = () => {
  const { category } = useParams(); // Extract the category from the URL
  const [subcategory, setSubcategory] = useState('');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false); // Track filter state

  // Placeholder functions for wishlist and cart actions
  const isInWishlist = (product) => false;
  const addToWishlist = (product) => console.log(`Added ${product.name} to wishlist`);
  const removeFromWishlist = (product) => console.log(`Removed ${product.name} from wishlist`);
  const isInCart = (product) => false;
  const addToCart = (product) => console.log(`Added ${product.name} to cart`);

  // Function to apply filters
  const handleApplyFilters = useCallback(async () => {
    try {
      let queryString = `/api/filter?category=${category}&`;

      if (subcategory) {
        queryString += `subcategory=${subcategory}&`;
      }

      if (material) {
        queryString += `material=${material}&`;
      }

      if (price) {
        queryString += `price=${price}&`;
      }

      queryString = queryString.slice(0, -1); // Remove the trailing '&'

      console.log('Query String: ', queryString);

      const response = await fetch(`http://localhost:4000${queryString}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch filtered products');
      }

      const data = await response.json();
      console.log('Filtered Products: ', data);

      setFilteredProducts(data);
      setIsFilterApplied(true); // Set filters as applied
    } catch (error) {
      console.error('Error fetching filtered products:', error);
    }
  }, [category, subcategory, material, price]);

  // Function to reset filters
  const handleResetFilters = () => {
    setSubcategory('');
    setMaterial('');
    setPrice('');
    setFilteredProducts([]);
    setIsFilterApplied(false); // Set filters as not applied
  };

  return (
    <div className="filter">
      <h3>Filter Products</h3>

      <div className="filter-item">
        <label htmlFor="subcategory">Subcategory</label>
        <select
          id="subcategory"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
        >
          <option value="">Select a subcategory</option>
          <option value="single-strand">Single-strand</option>
          <option value="multi-strand">Multi-strand</option>
          <option value="chunky">Chunky</option>
          <option value="minimalist">Minimalist</option>
        </select>
      </div>

      <div className="filter-item">
        <label htmlFor="material">Material</label>
        <select
          id="material"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
        >
          <option value="">Select material</option>
          <option value="glass">Glass</option>
          <option value="wood">Wooden</option>
          <option value="acrylic">Acrylic</option>
          <option value="gemstone">Gemstone</option>
        </select>
      </div>

      <div className="filter-item">
        <label htmlFor="price">Price</label>
        <select
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        >
          <option value="">Select price range</option>
          <option value="all">All</option>
          <option value="under-99">Under 99</option>
          <option value="under-299">Under 299</option>
          <option value="over-399">Over 399</option>
        </select>
      </div>

      <button
        className="apply-filters-btn"
        onClick={isFilterApplied ? handleResetFilters : handleApplyFilters}
      >
        {isFilterApplied ? 'Reset Filters' : 'Apply Filters'}
      </button>

      <div className="product-list">
        <div className="product-grid">
          {isFilterApplied && filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div className="product-card" key={product.productid}>
                <div
                  className={`wishlist-icon ${isInWishlist(product) ? 'active' : ''}`}
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
                  <img src={product.images[0]} alt={product.name} className="product-image" />
                  <div>{product.name}</div>
                  <div>
                  <span className="product-name">₹{product.productName}</span>{' '}
                    <span className="new-price">₹{product.new_price}</span>{' '}
                    <span className="old-price">₹{product.old_price}</span>
                  </div>
                </Link>

                <button
                  className="add-to-cart-btn"
                  onClick={() => {
                    if (!isInCart(product)) {
                      addToCart(product);
                    }
                  }}
                >
                  {isInCart(product) ? 'In Cart' : 'Add to Cart'}
                </button>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
