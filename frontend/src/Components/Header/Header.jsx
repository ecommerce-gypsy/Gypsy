import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import searchIcon from '../Assets/search-icon.png';
import { useNavigate } from "react-router-dom";

// Debounce function to delay the search query
const debounce = (func, delay) => {
  let timeout;
  return (args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(args), delay);
  };
};

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Error state
  const searchRef = useRef(null);

  // Toggle the search bar
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const navigate = useNavigate();  // useNavigate hook for navigation

  // Handle search input change
  const handleSearchChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    fetchResults(input); // Call debounced search function
  };

  // Debounced function for fetching search results
  const fetchResults = debounce(async (query) => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null); // Reset error state before starting the fetch

    try {
      const response = await fetch('http://localhost:4000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setResults(data);
      console.log("Data", data);
    } catch (error) {
      setError('An error occurred while fetching search results. Please try again.');
      console.error(error); // Log the error for debugging
    } finally {
      setIsLoading(false);
    }
  }, 500); // 500ms debounce delay

  // Handle clicks outside to close the search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false); // Close the search bar if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search result item click
  const handleClick = (productid) => {
    console.log("Product ID:", productid); // Log the product ID
    console.log("Navigating to:", `/product/${productid}`); // Log the full URL
    navigate(`/product/${productid}`); // Navigate to the product page
  };

  return (
    <div className="header">
      <div className="search-container" ref={searchRef}>
        <img
          src={searchIcon}
          alt="Search"
          className="header-icon"
          onClick={toggleSearch}
        />
        {searchOpen && (
          <input
            type="text"
            className="search-input"
            placeholder="Search for products..."
            value={searchInput}
            onChange={handleSearchChange}
          />
        )}
      </div>

      {searchOpen && (
        <div className="search-results">
          {isLoading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>} {/* Display error message */}
          {!isLoading && results.length === 0 && searchInput.trim() !== '' && (
            <p>No results found</p>
          )}
          {!isLoading && results.length > 0 && (
            <div className="results-list">
              {results.map((product) => {
                console.log("Product:", product); // Log the product object
                return (
                  <div
                    key={product._id}
                    className="result-item"
                    onClick={() => {
                      console.log("Result item clicked!"); // Log to confirm the click event
                      handleClick(product.productid);
                    }}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.productName}
                      className="product-image"
                    />
                    <div className="result-info">
                      <div className="product-name">{product.productName}</div>
                      <div className="product-price">₹{product.new_price}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Header;