import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import searchIcon from '../Assets/search-icon.png';
import { useNavigate } from 'react-router-dom';

// Debounce function to optimize API calls
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
  const [error, setError] = useState(null);
  const searchRef = useRef(null);

  const navigate = useNavigate(); // Navigation hook

  // Toggle the search bar
  const toggleSearch = () => setSearchOpen(!searchOpen);

  // Handle search input change
  const handleSearchChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    fetchResults(input);
  };

  // Debounced fetch function to reduce API calls
  const fetchResults = debounce(async (query) => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setError('Error fetching search results. Try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  // Handle clicks outside to close the search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate to the selected product
  const handleProductClick = (productid) => {
    navigate(`/product/${productid}`);
    setSearchOpen(false); // Close search after navigation
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

        {/* Search Results */}
        {searchOpen && (
          <div className="search-results">
            {isLoading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {!isLoading && results.length === 0 && searchInput.trim() !== '' && (
              <p>No results found</p>
            )}
            {!isLoading && results.length > 0 && (
              <div className="results-list">
                {results.map((product) => (
                  <div
                    key={product._id}
                    className="result-item"
                    onClick={() => handleProductClick(product.productid)}
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
