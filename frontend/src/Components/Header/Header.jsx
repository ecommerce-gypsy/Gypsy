import React, { useState, useEffect, useRef } from 'react';
import './Header.css'; // Import the CSS for styling

import searchIcon from '../Assets/search-icon.png'; // Replace with your search icon

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false); // Search bar toggle state
  const [searchInput, setSearchInput] = useState(''); // Search input value
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

  return (
    <div className="header">
      {/* Search Bar */}
      <div className="search-container" ref={searchRef}>
        {searchOpen && (
          <input
            type="text"
            className="search-input"
            placeholder="Search for products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        )}
        <img
          src={searchIcon}
          alt="Search"
          className="header-icon"
          onClick={toggleSearch}
        />
      </div>
    </div>
  );
};

export default Header;
