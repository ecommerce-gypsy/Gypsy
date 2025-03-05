import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './SearchBar.css';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef(null); // Reference for click outside detection

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:4000/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data);
        } else {
          console.error('Error fetching products:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Show results when input is focused
  const handleFocus = () => {
    if (resultsRef.current) {
      resultsRef.current.classList.add('active');
    }
  };

  // Hide results when clicking outside
  const handleClickOutside = (event) => {
    if (resultsRef.current && !resultsRef.current.contains(event.target)) {
      resultsRef.current.classList.remove('active');
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="search">
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search for jewelry..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus} // Show results when focused
        />
      </div>

      {/* Full-width results container */}
      <div className="results-container" ref={resultsRef}>
        {isLoading && <p>Loading...</p>}
        {!isLoading && results.length === 0 && query.trim() !== '' && (
          <p className="no-results">No results found</p>
        )}

        {!isLoading && results.length > 0 && (
          <ul className="product-list">
            {results.map((product) => (
              <li key={product._id} className="product-item">
                <div className="product-card">
                  <Link to={`/product/${product.productid}`}>
                    <img src={product.images[0]} alt={product.productName} className="product-image" />
                  </Link>
                  <div className="bracelets-name">{product.productName}</div>
                  <div className="bracelets-price">
                    <span className="new-price">₹{product.new_price}</span>{" "}
                    <span className="old-price">₹{product.old_price}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchBar;