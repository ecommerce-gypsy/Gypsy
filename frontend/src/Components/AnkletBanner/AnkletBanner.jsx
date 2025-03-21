import React from 'react';
import './AnkletBanner.css';
import AnkletImage from '../Assets/anklet.png'; // Import the banner image
//import Breadcrumb from '../Breadcrumb/Breadcrumb'; // Import your Breadcrumb component

const AnkletBanner = () => {
  return (
    <div
      className="anklet-banner"
      style={{ backgroundImage: `url(${AnkletImage})` }} // Use the imported image here
    >
      {/* Add Breadcrumb component at the top of the banner */}
      
    </div>
  );
};

export default AnkletBanner;
