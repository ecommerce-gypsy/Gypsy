// NeckpieceBanner.jsx
import React from "react";
import "./NeckPieceBanner.css";
import NeckImage from '../Assets/neckpiece.png';
const NeckpieceBanner = () => {
  return (
    <div
      className="neckpiece-banner"
      style={{ backgroundImage: `url(${NeckImage})` }} // Use the imported image here
    >
      {/* Add Breadcrumb component at the top of the banner */}
      
    </div>
  );
};


export default NeckpieceBanner;
