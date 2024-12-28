import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import A1_img from '../Components/Assets/a1.png';
import A2_img from '../Components/Assets/a2.png';
import A3_img from '../Components/Assets/a3.png';
import A4_img from '../Components/Assets/a4.png';
import A5_img from '../Components/Assets/a5.png';
import './Anklets.css';
import { WishlistContext } from '../WishlistContext';
import { CartContext } from '../CartContext';
import Header from '../Components/Header/Header';

const anklets = [
  { id: 1, name: 'Floral Coaster', image: A1_img, new_price: 250, oldPrice: 500 },
  { id: 2, name: 'Wooden Coaster', image: A2_img, new_price: 300, oldPrice: 600 },
  { id: 3, name: 'Abstract Coaster', image: A3_img, new_price: 200, oldPrice: 450 },
  { id: 4, name: 'Marble Coaster', image: A4_img, new_price: 350, oldPrice: 700 },
  { id: 5, name: 'Vintage Coaster', image: A5_img, new_price: 400, oldPrice: 800 },
];

const Anklets = () => {
  const { wishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const isInWishlist = (coaster) => wishlist.some((item) => item.id === coaster.id);

  const handleAddToCart = (coaster) => {
    addToCart(coaster);
    navigate('/cart');
  };

  return (
    <div>
      <Header />
      <h1>Welcome to the ANKLETS Collection!</h1>

      <div className="container">
        {anklets.map((coaster) => (
          <div key={coaster.id} className="anklets-card">
            <div className="anklets-image-container">
              <div
                className={`heart-icon ${isInWishlist(coaster) ? 'active' : ''}`}
                onClick={() =>
                  isInWishlist(coaster)
                    ? removeFromWishlist(coaster)
                    : addToWishlist(coaster)
                }
              ></div>
              <img className="anklets-image" src={coaster.image} alt={coaster.name} />
            </div>
            <div className="anklets-name">{coaster.name}</div>
            <div className="anklets-price">
              <span className="new-price">₹{coaster.new_price}</span>{' '}
              <span className="old-price">₹{coaster.oldPrice}</span>
            </div>
            <button className="add-to-cart-btn" onClick={() => handleAddToCart(coaster)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <Link to="/custproduct" className="customize-btn">
        <center>Click Here</center>
        
      </Link>
    </div>
  );
};

export default Anklets;
