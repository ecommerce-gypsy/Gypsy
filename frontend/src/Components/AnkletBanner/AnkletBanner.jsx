import React from 'react';
import './AnkletBanner.css';
import AnkletImage from '../Assets/anklets.png'; // Import the banner image

const AnkletBanner = () => {
  return (
    <div
      className="anklet-banner"
      style={{ backgroundImage: `url(${AnkletImage})` }} // Use the imported image here
    >
     
    </div>
  );
};

export default AnkletBanner;
