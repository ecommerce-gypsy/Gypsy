
import React, {useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import './SearchBar.css'; // Import the CSS for styling

export const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);  // To track loading state
  
    // Fetch results when the query changes
    useEffect(() => {
      // Skip searching if query is empty
      if (query.trim() === '') {
        setResults([]);
        return;
      }
  
      const fetchResults = async () => {
        setIsLoading(true);  // Start loading when the fetch starts
        try {
          const response = await fetch('http://localhost:4000/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }), // Send query as part of the request body
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
          setIsLoading(false);  // Stop loading once the request is complete
        }
      };
  
      fetchResults();
    }, [query]);
  
    return (
      <div className="search">
        <div className="Search-bar-container">
          <div>Search Jewelry</div>
          <input
            type="text"
            placeholder="Search for jewelry..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="results">
            {isLoading && <p>Loading...</p>}  {/* Show loading message */}
            
            {!isLoading && results.length === 0 && query.trim() !== '' && (
              <p className="no-results">No results found</p>  
            )}
  
  {!isLoading && results.length > 0 && (
  <ul className="product-list">
    {results.map((product) => (
      <li key={product._id} className="product-item">
        <div className="product-card">
        <Link to={`/product/${product.productid}`}>
                <img src={product.images[0]} alt={product.name} className="product-image" />
              </Link>
              <div className="bracelets-name">{product.name}</div>
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
      </div>
    );
  };
  export default SearchBar;