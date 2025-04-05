import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import searchIcon from '../Assets/search-icon.png';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    fetchResults(input);
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductClick = (productid) => {
    navigate(`/product/${productid}`);
    setSearchOpen(false);
  };

  return (
    <div className="header">
      <div className="search-container" ref={searchRef}>
        <div className={`search-box ${searchOpen ? 'active' : ''}`}>
          <img src={searchIcon} alt="Search" className="header-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search for products..."
            value={searchInput}
            onChange={handleSearchChange}
            onFocus={() => setSearchOpen(true)}
          />
        </div>

        {searchOpen && (
          <div className="search-results">
            {isLoading && <div className="loading-indicator">Loading...</div>}
            {error && <div className="error-message">{error}</div>}
            {!isLoading && results.length === 0 && searchInput.trim() !== '' && (
              <div className="no-results">No products found</div>
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