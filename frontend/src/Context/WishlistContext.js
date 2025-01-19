import React, { createContext, useState } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const addToWishlist = (item) => {
    if (!wishlist.some((wishlistItem) => wishlistItem.productid === item.productid)) {
      setWishlist((prev) => {
        const updatedWishlist = [...prev, item];
        console.log('Wishlist after addition:', updatedWishlist);
        return updatedWishlist;
      });
    }
  };

  const removeFromWishlist = (item) => {
    setWishlist((prev) => {
      const updatedWishlist = prev.filter((wishlistItem) => wishlistItem.productid !== item.productid);
      console.log('Wishlist after removal:', updatedWishlist);
      return updatedWishlist;
    });
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
