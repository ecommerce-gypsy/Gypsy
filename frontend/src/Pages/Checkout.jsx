import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import orderplaced from "../Components/Assets/orderplaced.gif";  // Add the order placed gif path
import "./Checkout.css";

const Checkout = () => {
  const { state } = useLocation();  // Retrieve the cart data passed via React Router
  const { cart, totalPrice } = state || {};  // If no state, fallback to empty
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showGif, setShowGif] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    const orderData = {
      items: cart.map(item => ({
        productid: item.productid,
        quantity: item.quantity,
        price: item.new_price,
      })),
      shippingAddress,
      paymentMethod,
      totalPrice,
    };

    const accessToken = localStorage.getItem("auth_token");

    try {
      const response = await fetch("http://localhost:4000/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage(result.message);
        setShowGif(true);
        setTimeout(() => {
          setShowGif(false);
          navigate('/');  // Redirect to home or a success page
        }, 2000);
      } else {
        setError(result.message || "Something went wrong, please try again.");
      }
    } catch (error) {
      setError("Network error, please try again.");
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="checkout-form">
        <input
          type="text"
          placeholder="Name"
          value={shippingAddress.name}
          onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address"
          value={shippingAddress.address}
          onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
        />
        <input
          type="text"
          placeholder="City"
          value={shippingAddress.city}
          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
        />
        <input
          type="text"
          placeholder="Postal Code"
          value={shippingAddress.postalCode}
          onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
        />
        <input
          type="text"
          placeholder="Country"
          value={shippingAddress.country}
          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
        />
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="Credit Card">Credit Card</option>
          <option value="Cash on Delivery">Cash on Delivery</option>
          <option value="UPI">UPI</option>
        </select>
        <button onClick={handleCheckout}>Submit Order</button>
      </div>

      {showGif && (
        <div className="order-placed-gif">
          <img src={orderplaced} alt="Order Placed" />
        </div>
      )}
    </div>
  );
};

export default Checkout;
