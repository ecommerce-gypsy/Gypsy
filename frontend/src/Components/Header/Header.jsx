import React, { useState, useEffect, useRef } from 'react';
import './Header.css'; // Import the CSS for styling
import searchIcon from '../Assets/search-icon.png'; // Replace with your search icon
import MarqueeBanner from '../MarqueeBanner/MarqueeBanner';

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false); // Search bar toggle state
  const [searchInput, setSearchInput] = useState(''); // Search input value
  const [results, setResults] = useState([]); // Store search results
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const searchRef = useRef(null); // Reference for search box

  // Toggle the search bar
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  // Handle clicks outside to close the search bar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false); // Close the search bar if clicked outside
      }
    };

    // Attach event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array ensures it only runs once after the initial render

  // Fetch search results when searchInput changes
  useEffect(() => {
    // Skip searching if input is empty
    if (searchInput.trim() === '') {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true); // Start loading when fetch begins
      try {
        const response = await fetch('http://localhost:4000/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: searchInput }), // Send search query
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
        setIsLoading(false); // Stop loading when request finishes
      }
    };

    fetchResults();
  }, [searchInput]); // Trigger when searchInput changes

  return (
    <div className="header">
      {/* Search Bar <MarqueeBanner/>*/}
      <div className="search-container" ref={searchRef}>
        <img
          src={searchIcon}
          alt="Search"
          className="header-icon"
          onClick={toggleSearch} // Toggle search bar visibility
        />
        {searchOpen && (
          <input
            type="text"
            className="search-input"
            placeholder="Search for products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)} // Update input value
          />
        )}
      </div>

      {/* Display search results */}
      {searchOpen && (
        <div className="search-results">
          {isLoading && <p>Loading...</p>} {/* Show loading message */}
          {!isLoading && results.length === 0 && searchInput.trim() !== '' && (
            <p>No results found</p> // Show no results message
          )}
          {!isLoading && results.length > 0 && (
            <div className="results-list">
              {results.map((product) => (
                <div key={product._id} className="result-item">
                  <a href={`/product/${product.productid}`}>
                    <img
                      src={product.images[0]}
                      alt={product.productName}
                      className="product-image"
                    />
                  </a>
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
  );
};

export default Header;
