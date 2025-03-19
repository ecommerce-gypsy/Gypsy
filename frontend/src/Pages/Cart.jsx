import React, { useEffect, useContext, useState } from "react";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";
import CheckoutModal from "./CheckoutModal";
import "./Cart.css";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, removeItem, fetchCart, updateQuantity, emptyCart } =
    useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false); // State to control CheckoutModal visibility

  useEffect(() => {
    fetchCart(); // Fetch the cart data on mount
  }, []);

  const incrementQuantity = (item) => {
    updateQuantity(item.productid, item.quantity + 1);
  };

  const decrementQuantity = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.productid, item.quantity - 1);
    } else {
      removeItem(item);
    }
  };

  const handleMoveToWishlist = (item) => {
    addToWishlist(item);
    removeItem(item);
  };

  // Calculate the total and subtotal, including delivery and platform fees
  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (total, item) => total + item.new_price * item.quantity,
      0
    );
    const deliveryFee = 99;
    const platformFee = 19;
    const total = subtotal + deliveryFee + platformFee;
    console.log("Calculated total:", total); // Debugging line in Cart component

    return { subtotal, deliveryFee, platformFee, total };
  };

  const handleCheckoutSuccess = (message) => {
    alert(message);
    emptyCart();
    navigate("/order-confirmation");
  };

  const { subtotal, deliveryFee, platformFee, total } = calculateTotal(); // Calculate totals before passing to CheckoutModal

  // Function to handle showing the CheckoutModal
  const openCheckoutModal = () => {
    setShowCheckoutModal(true);
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">My Bag ({cart.length} items)</h1>

      {cart.length > 0 ? (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.productid}>
                <img
                  src={item.images[0]}
                  alt={item.productName}
                  className="cart-image"
                />
                <div className="cart-item-details">
                  <p className="cart-item-name">{item.productName}</p>
                  <p className="cart-item-price">
                    Rs. {item.new_price.toFixed(2)}
                  </p>
                  <div className="cart-quantity">
                    <button onClick={() => decrementQuantity(item)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => incrementQuantity(item)}>+</button>
                  </div>
                </div>
                <div className="cart-item-total">
                  Rs. {(item.new_price * item.quantity).toFixed(2)}
                </div>
                <div className="cart-actions">
                  <button
                    onClick={() => handleMoveToWishlist(item)}
                    className="wishlist-btn"
                  >
                    Move to Wishlist
                  </button>
                  <button
                    onClick={() => removeItem(item)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-box">
              <h3>Order Details</h3>
              <p>
                Bag Total: <span>Rs. {subtotal.toFixed(2)}</span>
              </p>
              <p>
                Delivery Fee: <span>Rs. {deliveryFee.toFixed(2)}</span>
              </p>
              <p>
                Platform Fee: <span>Rs. {platformFee.toFixed(2)}</span>
              </p>
              <h3>
                Order Total: <span>Rs. {total.toFixed(2)}</span>
              </h3>
              <button className="checkout-btn" onClick={openCheckoutModal}>
                Proceed to Shipping
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="empty-cart">Your cart is empty.</p>
      )}

      {/* Conditionally render the CheckoutModal based on the state */}
      {showCheckoutModal && (
        <CheckoutModal
          cart={cart}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          platformFee={platformFee}
          total={total} // Pass the total amount to CheckoutModal
          handleCheckoutSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};

export default Cart;
