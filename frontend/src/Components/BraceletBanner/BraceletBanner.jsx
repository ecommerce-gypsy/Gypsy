import React from 'react';
import './BraceletBanner.css';
import BraceletImage from '../Assets/bracelet.png'; // Import the banner image
//import Breadcrumb from '../Breadcrumb/Breadcrumb'; // Import your Breadcrumb component

const BraceletBanner = () => {
  return (
    <div
      className="bracelet-banner"
      style={{ backgroundImage: `url(${BraceletImage})` }} // Use the imported image here
    >
      {/* Add Breadcrumb component at the top of the banner */}
      
    </div>
  );
};

export default BraceletBanner;
