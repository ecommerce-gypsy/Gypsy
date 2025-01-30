import React, { useEffect, useState, useContext } from "react";
import { Link,useNavigate } from "react-router-dom";
import "./Account.css"; // Import the CSS file
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";

function Account() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch cart and wishlist from context
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        if (!token) {
          setError("No token found. Please log in.");
          return;
        }

        const response = await fetch("http://localhost:4000/api/account", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch account details.");
        }
      } catch (error) {
        console.error("Error fetching account details:", error);
        setError("An error occurred while fetching account details.");
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    navigate("/");
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Account</h1>
        <p>Name: {userData.name}</p>
        <p>Country: {userData.country || "Not provided"}</p>
        <p>
  <Link to="/AddressForm">
    View addresses ({userData ? userData.addresses.length : 0})
  </Link>
</p>
        <button className="logout-button" onClick={handleLogout}>Log out</button>
      </div>

      {/* Order History Section */}
      <div className="section-container">
        <h2>Order History</h2>
        {userData.orders && userData.orders.length > 0 ? (
          <ul>
            {userData.orders.map((order, index) => (
              <li key={index} className="order-item">
                <h3>Order ID: {order._id}</h3>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Status: {order.orderStatus}</p>
                <p>Total: ₹{order.totalPrice}</p>
                <h4>Products:</h4>
                <ul>
                  {order.items.map((product, idx) => (
                    <li key={idx}>
                      <div className="order-product">
                        <img
                          src={product.productid.images?.[0] || "placeholder.jpg"}
                          alt={product.productid.name || "Product"}
                          className="order-product-image"
                        />
                        <div className="order-product-details">
                          <p><strong>{product.productid.name}</strong> (x{product.quantity})</p>
                          <p>Price: ₹{product.price}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p>No orders yet.</p>
        )}
      </div>

      {/* Cart Section */}
      <div className="section-container">
        <h2>Cart</h2>
        {cart.length > 0 ? (
          <div className="cart-grid">
            {cart.map((item, index) => (
              <div key={index} className="cart-item-card">
                {/* Cart Item Header */}
                <div className="cart-header">
                  <img
                    src={item.images?.[0] || "placeholder.jpg"}
                    alt={item.productName || "Product"}
                    className="cart-item-image"
                  />
                  <div className="cart-header-details">
                    <h3>{item.productName || "Product Name"}</h3> {/* Display product name */}
                  </div>
                </div>

                {/* Cart Item Footer */}
                <div className="cart-footer">
                  <p className="cart-price">
                    ₹<span className="new-price">{item.new_price || 0}</span>
                    <span className="old-price"> ₹1000</span> {/* Placeholder for original price */}
                  </p>
                  <span className="cart-quantity">Qty: {item.quantity}</span> {/* Display quantity */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>

      {/* Wishlist Section */}
      <div className="section-container">
        <h2>Wishlist</h2>
        {wishlist.length > 0 ? (
          <div className="wishlist-grid">
            {wishlist.map((item, index) => (
              <div key={index} className="wishlist-item-card">
                {/* Wishlist Item Header */}
                <div className="wishlist-header">
                  <img
                    src={item.images?.[0] || "placeholder.jpg"}
                    alt={item.productName || "Product"}
                    className="wishlist-item-image"
                  />
                  <div className="wishlist-header-details">
                    <h3>{item.productName || "Product Name"}</h3> {/* Display product name */}
                  </div>
                  {/* Heart Icon */}
                  <span className="wishlist-heart">💖</span>
                </div>

                {/* Wishlist Item Footer */}
                <div className="wishlist-footer">
                  <p className="wishlist-price">
                    ₹<span className="new-price">{item.new_price || 0}</span>
                    <span className="old-price"> ₹1000</span> {/* Placeholder for original price */}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Your wishlist is empty.</p>
        )}
      </div>
    </div>
  );
}

export default Account;
