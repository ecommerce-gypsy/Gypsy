import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../Context/WishlistContext";
import "./Account.css";

function Account() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
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

  // Fetch user data and orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError("No token found. Please log in.");
          navigate("/authcard");
          return;
        }

        const [userResponse, ordersResponse] = await Promise.all([
          fetch("http://localhost:4000/api/address/account", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:4000/api/address/orders", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (userResponse.ok) {
          const data = await userResponse.json();
          setUserData(data);
          setAddresses(data.addresses || []);
        } else {
          const errorData = await userResponse.json();
          setError(errorData.message || "Failed to fetch account details.");
        }

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

    try {
      const endpoint = editIndex !== null 
        ? `http://localhost:4000/api/address/update-address/${addresses[editIndex]._id}`
        : "http://localhost:4000/api/address/add-address";
      
      const method = editIndex !== null ? "PUT" : "PUT";
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAddresses(data.user.address);
        setNotification({ 
          message: editIndex !== null 
            ? "Address updated successfully!" 
            : "Address added successfully!", 
          type: "success", 
          visible: true 
        });
        setFormData({ street: "", city: "", state: "", pincode: "", phone: "", landmark: "" });
        setEditIndex(null);
      } else {
        setNotification({ message: data.message || "Failed to save address.", type: "error", visible: true });
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setNotification({ message: "An error occurred while saving address.", type: "error", visible: true });
    }
  };

  const handleEditAddress = (index) => {
    setFormData(addresses[index]);
    setEditIndex(index);
  };

  const handleReturnRequest = (orderId, productId) => {
    navigate(`/returnform`, { state: { orderId, productId } });
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

    try {
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
    } catch (error) {
      console.error("Error deleting address:", error);
      setNotification({ message: "An error occurred while deleting address.", type: "error", visible: true });
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
        body: JSON.stringify({ 
          productid: selectedProductId, 
          rating, 
          reviewText 
        }),
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

  const handleWishlistClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!userData) return <div className="loading-spinner"></div>;

  return (
    <div className="account-dashboard">
      {/* Notification Alert */}
      {notification.visible && (
        <div className={`notification-alert ${notification.type} ${notification.visible ? "visible" : ""}`}>
          {notification.message}
          <button className="notification-close" onClick={closeNotification}>
            &times;
          </button>
        </div>
      )}

      {/* User Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <span>{userData.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="profile-info">
          <h1>{userData.name}</h1>
          <p>{userData.email}</p>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <nav className="dashboard-nav">
        <ul>
          <li className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
            <i className="fas fa-shopping-bag"></i> Orders
          </li>
          <li className={activeTab === "addresses" ? "active" : ""} onClick={() => setActiveTab("addresses")}>
            <i className="fas fa-map-marker-alt"></i> Addresses
          </li>
          <li className={activeTab === "wishlist" ? "active" : ""} onClick={() => setActiveTab("wishlist")}>
            <i className="fas fa-heart"></i> Wishlist
          </li>
        </ul>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="orders-section">
            <h2><i className="fas fa-shopping-bag"></i> My Orders</h2>
            {orders.length > 0 ? (
              <div className="orders-grid">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className={`order-status ${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="order-items-preview">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="order-item-preview">
                          <img 
                            src={item.images[0] || "/placeholder-product.jpg"} 
                            alt={item.productName} 
                            className="product-thumbnail"
                          />
                          <div className="product-info">
                            <h4>{item.productName}</h4>
                            <p>{item.quantity} × ₹{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="more-items">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">
                        Total: ₹{order.totalPrice.toFixed(2)}
                      </div>
                      <div className="order-actions">
                        <button 
                          className="view-details-btn"
                          onClick={() => fetchOrderDetails(order._id)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    {order.orderStatus === "Delivered" && (
                      <div className="post-delivery-actions">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="item-actions">
                            <button
                              className="review-btn"
                              onClick={() => openReviewModal(item.productid)}
                            >
                              Review {item.productName}
                            </button>
                            <button
                              className="return-btn"
                              onClick={() => handleReturnRequest(order._id, item.productid)}
                            >
                              Return Item
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-shopping-bag fa-3x"></i>
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders with us yet.</p>
                <button className="shop-now-btn" onClick={() => navigate("/")}>
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="addresses-section">
            <h2><i className="fas fa-map-marker-alt"></i> My Addresses</h2>
            
            <div className="address-form-container">
              <h3>{editIndex !== null ? "Edit Address" : "Add New Address"}</h3>
              <div className="address-form-grid">
                <div className="form-group">
                  <label>Street Address*</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="House No., Building, Street"
                  />
                </div>
                <div className="form-group">
                  <label>Landmark*</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Nearby location"
                  />
                </div>
                <div className="form-group">
                  <label>City*</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Your city"
                  />
                </div>
                <div className="form-group">
                  <label>State*</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Your state"
                  />
                </div>
                <div className="form-group">
                  <label>Pincode*</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number*</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
              <div className="form-actions">
                {editIndex !== null && (
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setFormData({ street: "", city: "", state: "", pincode: "", phone: "", landmark: "" });
                      setEditIndex(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button className="save-btn" onClick={handleSaveAddress}>
                  {editIndex !== null ? "Update Address" : "Save Address"}
                </button>
              </div>
            </div>

            <div className="saved-addresses">
              <h3>Saved Addresses</h3>
              {addresses.length > 0 ? (
                <div className="address-grid">
                  {addresses.map((address, index) => (
                    <div key={index} className="address-card">
                      <div className="address-details">
                        <p className="address-name">{address.name || "No name"}</p>
                        <p>{address.street}, {address.landmark}</p>
                        <p>{address.city}, {address.state} - {address.pincode}</p>
                        <p className="address-phone">
                          <i className="fas fa-phone"></i> {address.phone}
                        </p>
                      </div>
                      <div className="address-actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditAddress(index)}
                        >
                          <i className="fas fa-edit"></i> Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteAddress(index)}
                        >
                          <i className="fas fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-map-marker-alt fa-3x"></i>
                  <h3>No Saved Addresses</h3>
                  <p>You haven't saved any addresses yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <div className="wishlist-section">
            <h2><i className="fas fa-heart"></i> My Wishlist</h2>
            {wishlist.length > 0 ? (
              <div className="wishlist-grid">
                {wishlist.map((item) => (
                  <div 
                    key={item.productid} 
                    className="wishlist-card"
                    onClick={() => handleWishlistClick(item.productid)}
                  >
                    <div className="wishlist-image">
                      <img 
                        src={item.images?.[0] || "/placeholder-product.jpg"} 
                        alt={item.productName || "Product"} 
                      />
                      <div className="wishlist-overlay">
                        <button className="view-product-btn">
                          View Product
                        </button>
                      </div>
                    </div>
                    <div className="wishlist-details">
                      <h3>{item.productName || "Product Name"}</h3>
                      <p className="price">₹{item.new_price || item.price || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-heart fa-3x"></i>
                <h3>Your Wishlist is Empty</h3>
                <p>Save items you love to your wishlist for later.</p>
                <button className="shop-now-btn" onClick={() => navigate("/")}>
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-summary">
                <div className="summary-item">
                  <span>Order ID:</span>
                  <span>{selectedOrder._id}</span>
                </div>
                <div className="summary-item">
                  <span>Order Date:</span>
                  <span>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Status:</span>
                  <span className={`status-badge ${selectedOrder.orderStatus.toLowerCase()}`}>
                    {selectedOrder.orderStatus}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Payment:</span>
                  <span>
                    {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                  </span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <span>₹{selectedOrder.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-items-details">
                <h3>Order Items ({selectedOrder.items.length})</h3>
                <div className="items-list">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="order-item-detail">
                      <div className="item-image">
                        <img 
                          src={item.images[0] || "/placeholder-product.jpg"} 
                          alt={item.productName} 
                        />
                      </div>
                      <div className="item-info">
                        <h4>{item.productName}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ₹{item.price.toFixed(2)}</p>
                        <p>Subtotal: ₹{(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="address-details-grid">
                <div className="address-section">
                  <h3>Shipping Address</h3>
                  {selectedOrder.shippingAddress ? (
                    <>
                      <p>{selectedOrder.shippingAddress.name}</p>
                      <p>{selectedOrder.shippingAddress.address}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                      <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                    </>
                  ) : (
                    <p>No shipping address provided</p>
                  )}
                </div>
                <div className="address-section">
                  <h3>Billing Address</h3>
                  {selectedOrder.billingAddress ? (
                    <>
                      <p>{selectedOrder.billingAddress.name}</p>
                      <p>{selectedOrder.billingAddress.address}</p>
                      <p>{selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.postalCode}</p>
                      <p>{selectedOrder.billingAddress.country}</p>
                      <p>Phone: {selectedOrder.billingAddress.phone}</p>
                    </>
                  ) : (
                    <p>Same as shipping address</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="review-modal-container">
            <div className="modal-header">
              <h2>Write a Review</h2>
              <button 
                className="modal-close-btn"
                onClick={() => setShowReviewModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              {submitMessage ? (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i>
                  <p>{submitMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label>Your Rating</label>
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={`fas fa-star ${star <= rating ? "active" : ""}`}
                          onClick={() => setRating(star)}
                        ></i>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Your Review</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience with this product..."
                      required
                    ></textarea>
                  </div>

                  {submitError && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-circle"></i>
                      <p>{submitError}</p>
                    </div>
                  )}

                  <div className="form-actions">
                    <button type="submit" className="submit-review-btn">
                      Submit Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;