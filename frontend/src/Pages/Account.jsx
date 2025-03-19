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
  const navigate = useNavigate();
  const { wishlist } = useContext(WishlistContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        if (!token) {
          setError("No token found. Please log in.");
          return;
        }

        // Fetch user data
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

        // Fetch orders data
        const ordersResponse = await fetch("http://localhost:4000/api/address/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (ordersResponse.ok) {
          const orderData = await ordersResponse.json();
          setOrders(orderData.orders); // Set the fetched orders to state
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
  }, []);
  const handleLogout = () => {
    // Clear all items in localStorage
    localStorage.clear();
    
    // Redirect the user to the home page or login page
    navigate("/authcard");
    window.location.reload(); 
  };
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { street, city, state, pincode, phone, landmark } = formData;

    // Check if all required fields are filled
    if (!street || !city || !state || !pincode || !phone || !landmark) {
      setNotification({ message: "All fields are required.", type: "error", visible: true });
      return false;
    }

    // Validate phone number (e.g., 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setNotification({ message: "Please enter a valid 10-digit phone number.", type: "error", visible: true });
      return false;
    }

    // Validate pincode (e.g., 6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      setNotification({ message: "Please enter a valid 6-digit pincode.", type: "error", visible: true });
      return false;
    }

    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return; // Only proceed if the form is valid

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
        setFormData({
          street: "",
          city: "",
          state: "",
          pincode: "",
          phone: "",
          landmark: "",
        });
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
        setFormData({
          street: "",
          city: "",
          state: "",
          pincode: "",
          phone: "",
          landmark: "",
        });
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
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      setAddresses(data.user.address);
      setNotification({ message: "Address deleted successfully!", type: "success", visible: true });
    } else {
      setNotification({ message: data.message || "Failed to delete address.", type: "error", visible: true });
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.visible) {
      const timer = setTimeout(() => {
        closeNotification();
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification.visible]);

  if (error) return <div className="error-message">{error}</div>;
  if (!userData) return <div>Loading...</div>;

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Account</h1>
        <p>Name: {userData.name}</p>

        {/* Show only the first address in the array */}
        {userData.addresses && userData.addresses.length > 0 ? (
          <p>
            Address: {userData.addresses[0].street}, {userData.addresses[0].landmark}, {userData.addresses[0].city}, 
            {userData.addresses[0].state}, {userData.addresses[0].pincode}
          </p>
         
        ) : (
          <p>Address: Not provided</p>
        )}

        {/* Show the first phone number */}
        {userData.addresses?.[0]?.phone ? (
  <p>Phone: {userData.addresses[0].phone}</p>
) : (
  <p>Phone: Not provided</p>
)}



        <button className="logout-button" onClick={handleLogout}>Log out</button>
      </div>

      {/* Notification Box */}
      {notification.visible && (
        <div className={`notification-alert ${notification.type} ${notification.visible ? 'visible' : ''}`}>
          {notification.message}
        </div>
      )}

      <div className="tabs">
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>My Orders</button>
        <button className={activeTab === "addresses" ? "active" : ""} onClick={() => setActiveTab("addresses")}>My Addresses</button>
        <button className={activeTab === "wishlist" ? "active" : ""} onClick={() => setActiveTab("wishlist")}>My Wishlist</button>
      </div>

      <div className="tab-content">
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="section-container">
            <h2>My Orders</h2>
            <div className="orders-container">
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <div key={index} className="order-item">
                    <h3>Order #{order._id}</h3>
                    <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p>Total Price: ₹{order.totalPrice}</p>
                    <p>Status: <span className={`order-status ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></p>
                    <div className="order-details">
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="order-item-details">
                          <img src={item.images[0] || "placeholder.jpg"} alt={item.productid} />
                          <p>{item.productid} (x{item.quantity})</p>
                          <p>Price: ₹{item.price}</p>
                        </div>
                      ))}
                    </div>
                    <button className="view-details-btn">View Details</button>
                  </div>
                ))
              ) : (
                <p>You have no orders yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Address Tab */}
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

        {/* Wishlist Tab */}
        {activeTab === "wishlist" && (
          <div className="section-container">
            <h2>My Wishlist</h2>
            <div className="wishlist-container">
              {wishlist.length > 0 ? (
                wishlist.map((item, index) => (
                  <div key={index} className="wishlist-item">
                    <img src={item.images?.[0] || "placeholder.jpg"} alt={item.productName || "Product"} />
                    <p>{item.productName || "Product Name"}</p>
                  </div>
                ))
              ) : (
                <p>Your wishlist is empty.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;
