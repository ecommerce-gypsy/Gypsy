import React from "react";
import "./Item.css"; // Make sure this CSS file exists

const Item = ({ id, name, image, new_price, old_price }) => {
  return (
    <div className="item" data-id={id}>
      {/* Item Image */}
      <img src={image} alt={name} className="item-image" />

      {/* Item Name */}
      <h2 className="item-name">{name}</h2>

      {/* Item Prices */}
      <div className="item-prices">
        <span className="item-price-new">₹{new_price}</span>
        <span className="item-price-old">₹{old_price}</span>
      </div>
    </div>
  );
};

export default Item;
