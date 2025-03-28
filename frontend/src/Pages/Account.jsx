import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Account.css";
import { WishlistContext } from "../Context/WishlistContext";

function Account() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    landmark: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "", visible: false });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const { wishlist } = useContext(WishlistContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError("No token found. Please log in.");
          navigate("/authcard");
          return;
        }

        const userResponse = await fetch("http://localhost:4000/api/address/account", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse.ok) {
          const data = await userResponse.json();
          setUserData(data);
          setAddresses(data.addresses || []);
        } else {
          const errorData = await userResponse.json();
          setError(errorData.message || "Failed to fetch account details.");
        }

        const ordersResponse = await fetch("http://localhost:4000/api/address/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (ordersResponse.ok) {
          const orderData = await ordersResponse.json();
          setOrders(orderData.orders);
        } else {
          const errorData = await ordersResponse.json();
          setError(errorData.message || "Failed to fetch orders.");
        }
      } catch (error) {
        console.error("Error fetching account details:", error);
        setError("An error occurred while fetching account details.");
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/authcard");
    window.location.reload();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { street, city, state, pincode, phone, landmark } = formData;
    if (!street || !city || !state || !pincode || !phone || !landmark) {
      setNotification({ message: "All fields are required.", type: "error", visible: true });
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setNotification({ message: "Please enter a valid 10-digit phone number.", type: "error", visible: true });
      return false;
    }
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      setNotification({ message: "Please enter a valid 6-digit pincode.", type: "error", visible: true });
      return false;
    }
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    if (editIndex !== null) {
      const address = addresses[editIndex];
      if (!address || !address._id) {
        setNotification({ message: "Address not found.", type: "error", visible: true });
        return;
      }
      const response = await fetch(`http://localhost:4000/api/address/update-address/${address._id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setAddresses(data.user.address);
        setNotification({ message: "Address updated successfully!", type: "success", visible: true });
        setFormData({ street: "", city: "", state: "", pincode: "", phone: "", landmark: "" });
        setEditIndex(null);
      } else {
        setNotification({ message: data.message || "Failed to save address.", type: "error", visible: true });
      }
    } else {
      const response = await fetch("http://localhost:4000/api/address/add-address", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setAddresses(data.user.address);
        setNotification({ message: "Address added successfully!", type: "success", visible: true });
        setFormData({ street: "", city: "", state: "", pincode: "", phone: "", landmark: "" });
      } else {
        setNotification({ message: data.message || "Failed to save address.", type: "error", visible: true });
      }
    }
  };

  const handleEditAddress = (index) => {
    setFormData(addresses[index]);
    setEditIndex(index);
  };

  const handleDeleteAddress = async (index) => {
    if (!addresses || addresses.length === 0) {
      setNotification({ message: "No addresses available.", type: "info", visible: true });
      return;
    }
    const addressId = addresses[index]?._id;
    if (!addressId) {
      setNotification({ message: "Address ID not found.", type: "error", visible: true });
      return;
    }
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const response = await fetch(`http://localhost:4000/api/address/delete-address/${addressId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      setAddresses(data.user.address);
      setNotification({ message: "Address deleted successfully!", type: "success", visible: true });
    } else {
      setNotification({ message: data.message || "Failed to delete address.", type: "error", visible: true });
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const response = await fetch(`http://localhost:4000/orders/${orderId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSelectedOrder(data.order);
        setIsModalOpen(true);
      } else {
        setNotification({ message: "Failed to fetch order details.", type: "error", visible: true });
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setNotification({ message: "An error occurred while fetching order details.", type: "error", visible: true });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const response = await fetch("http://localhost:4000/api/reviews", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productid: selectedProductId, rating, reviewText }),
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitMessage("Review posted successfully");
        setSubmitError("");
        setTimeout(() => {
          setShowReviewModal(false);
          setRating(0);
          setReviewText("");
          setSubmitMessage("");
        }, 2000);
      } else {
        setSubmitError(data.message || "Failed to submit review");
        setSubmitMessage("");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitError("An error occurred while submitting review");
      setSubmitMessage("");
    }
  };

  const openReviewModal = (productId) => {
    setSelectedProductId(productId);
    setShowReviewModal(true);
    setRating(0);
    setReviewText("");
    setSubmitMessage("");
    setSubmitError("");
  };

  const closeNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  useEffect(() => {
    if (notification.visible) {
      const timer = setTimeout(() => closeNotification(), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.visible]);

  const OrderDetailsModal = ({ order, closeModal }) => {
    if (!order) return null;
    const shippingAddress = order.shippingAddress || {};
    const billingAddress = order.billingAddress || {};

    return (
      <div className="modal-overlay">
        <div className="modal">
          <h2>Order Details</h2>
          <div>
            <h3>Order Items:</h3>
            {order.items.map((item, index) => (
              <div key={index}>
                <img src={item.images[0] || "placeholder.jpg"} alt={item.productName} width="50" height="50" />
                <p>{item.productName} (x{item.quantity})</p>
                <p>Price: ₹{item.price}</p>
              </div>
            ))}
          </div>
          <div>
            <p><strong>Total Price: ₹{order.totalPrice}</strong></p>
            <p><strong>Status:</strong> {order.orderStatus}</p>
            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          </div>
          <div>
            <h3>Shipping Address:</h3>
            <p>{shippingAddress.name || "N/A"}</p>
            <p>{shippingAddress.address || "N/A"}</p>
            <p>{shippingAddress.city}, {shippingAddress.postalCode || "N/A"}</p>
            <p>{shippingAddress.country || "N/A"}</p>
            <p>Contact {shippingAddress.phone || "N/A"}</p>
          </div>
          <div>
            <h3>Billing Address:</h3>
            <p>{billingAddress.name || "N/A"}</p>
            <p>{billingAddress.address || "N/A"}</p>
            <p>{billingAddress.city}, {billingAddress.postalCode || "N/A"}</p>
            <p>{billingAddress.country || "N/A"}</p>
            <p>Contact {billingAddress.phone || "N/A"}</p>
          </div>
          <button className="close-modal-btn" onClick={closeModal}>Close</button>
        </div>
      </div>
    );
  };

  const ReviewModal = () => (
    <div style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "white",
      padding: "20px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      borderRadius: "8px",
      zIndex: "1000"
    }}>
      <div style={{ position: "relative" }}>
        <span
          style={{ position: "absolute", top: "5px", right: "10px", cursor: "pointer", fontSize: "20px" }}
          onClick={() => setShowReviewModal(false)}
        >
          ×
        </span>
        <h3>Write a Review</h3>
        {submitMessage && <p style={{ color: "green" }}>{submitMessage}</p>}
        {submitError && <p style={{ color: "red" }}>{submitError}</p>}
        <form onSubmit={handleReviewSubmit}>
          <label>Rating:</label>
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{ color: star <= rating ? "gold" : "#ccc", cursor: "pointer", fontSize: "24px" }}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <label style={{ display: "block", marginTop: "10px" }}>Review:</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            style={{ width: "100%", minHeight: "100px", marginTop: "5px" }}
            placeholder="Write your review here..."
            required
          />
          <button
            type="submit"
            style={{ marginTop: "10px", padding: "8px 16px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px" }}
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );

  const handleWishlistClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!userData) return <div>Loading...</div>;

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Account</h1>
        <p>Name: {userData.name}</p>
        {userData.addresses && userData.addresses.length > 0 ? (
          <p>
            Address: {userData.addresses[0].street}, {userData.addresses[0].landmark}, {userData.addresses[0].city},
            {userData.addresses[0].state}, {userData.addresses[0].pincode}
          </p>
        ) : (
          <p>Address: Not provided</p>
        )}
        {userData.addresses?.[0]?.phone ? (
          <p>Phone: {userData.addresses[0].phone}</p>
        ) : (
          <p>Phone: Not provided</p>
        )}
        <button className="logout-button" onClick={handleLogout}>Log out</button>
      </div>

      {notification.visible && (
        <div className={`notification-alert ${notification.type} ${notification.visible ? "visible" : ""}`}>
          {notification.message}
        </div>
      )}

      <div className="tabs">
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>My Orders</button>
        <button className={activeTab === "addresses" ? "active" : ""} onClick={() => setActiveTab("addresses")}>My Addresses</button>
        <button className={activeTab === "wishlist" ? "active" : ""} onClick={() => setActiveTab("wishlist")}>Wishlist</button>
      </div>

      <div className="tab-content">
        {activeTab === "orders" && (
          <div className="section-container">
            <h2>My Orders</h2>
            <div className="orders-container">
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <div key={index} className="order-item">
                    <h3>Order #{order._id}</h3>
                    <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    <div className="order-items">
                      {order.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="order-item-details" style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
                          <img
                            src={item.images[0] || "placeholder.jpg"}
                            alt={item.productName}
                            style={{ width: "50px", height: "50px", marginRight: "10px" }}
                          />
                          <div>
                            <p>{item.productName} (x{item.quantity})</p>
                            <p>Price: ₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p>Total Price: ₹{order.totalPrice}</p>
                    <p>Status: <span className={`order-status ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></p>
                    <button className="view-details-btn" onClick={() => fetchOrderDetails(order._id)}>View Details</button>
                    {order.orderStatus === "Delivered" && order.items.map((item, idx) => (
                      <button
                        key={idx}
                        className="review-btn"
                        onClick={() => openReviewModal(item.productid)}
                        style={{ marginLeft: "10px", padding: "5px 10px", background: "#2196F3", color: "white", border: "none", borderRadius: "4px" }}
                      >
                        Write a Review for {item.productName}
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <p>You have no orders yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="section-container">
            <h2>Manage Addresses</h2>
            <div className="address-form">
              <input type="text" name="street" placeholder="Street" value={formData.street} onChange={handleChange} />
              <input type="text" name="landmark" placeholder="Landmark" value={formData.landmark} onChange={handleChange} />
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
              <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
              <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} />
              <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
              <button className="save-btn" onClick={handleSaveAddress}>{editIndex !== null ? "Update" : "Save"} Address</button>
            </div>

            <h3>Saved Addresses</h3>
            {addresses.length > 0 ? (
              <ul>
                {addresses.map((address, index) => (
                  <li key={index} className="address-item">
                    <p>{address.street}, {address.landmark}, {address.city}, {address.state}, {address.pincode}</p>
                    <p>Phone: {address.phone}</p>
                    <button className="edit-btn" onClick={() => handleEditAddress(index)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteAddress(index)}>Delete</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No addresses saved.</p>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="section-container">
            <h2>My Wishlist</h2>
            <div className="wishlist-container">
              {wishlist.length > 0 ? (
                wishlist.map((item, index) => (
                  <div 
                    key={index} 
                    className="wishlist-item" 
                    onClick={() => handleWishlistClick(item.productid)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={item.images?.[0] || "placeholder.jpg"} alt={item.productName || "Product"} />
                    <p>{item.productName || "Product Name"}</p>
                    <p>Price: ₹{item.new_price || "Product Price"}</p>
                  </div>
                ))
              ) : (
                <p>Your wishlist is empty.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && <OrderDetailsModal order={selectedOrder} closeModal={() => setIsModalOpen(false)} />}
      {showReviewModal && <ReviewModal />}
    </div>
  );
}

export default Account;