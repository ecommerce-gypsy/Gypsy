import React from 'react';
import './AnkletBanner.css';
import AnkletImage from '../Assets/anklets.png'; // Import the banner image
import Breadcrumb from '../Breadcrumb/Breadcrumb'; // Import your Breadcrumb component

const AnkletBanner = () => {
  return (
    <div
      className="anklet-banner"
      style={{ backgroundImage: `url(${AnkletImage})` }} // Use the imported image here
    >
      {/* Add Breadcrumb component at the top of the banner */}
      <div className="breadcrumb-container">
        <Breadcrumb /> {/* Display your Breadcrumb component */}
      </div>
    </div>
  );
};

export default AnkletBanner;
