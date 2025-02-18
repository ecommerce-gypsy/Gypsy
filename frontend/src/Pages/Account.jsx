import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Account.css";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";

function Account() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

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

        const response = await fetch("http://localhost:4000/api/account", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setAddresses(data.addresses || []);
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
    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = () => {
    if (editIndex !== null) {
      const updatedAddresses = [...addresses];
      updatedAddresses[editIndex] = formData;
      setAddresses(updatedAddresses);
      setEditIndex(null);
    } else {
      setAddresses([...addresses, formData]);
    }

    // Update userData with the latest address
    setUserData((prev) => ({
      ...prev,
      address: `${formData.street}, ${formData.city}, ${formData.state}, ${formData.zip}`,
      phone: formData.phone,
    }));

    setFormData({ street: "", city: "", state: "", zip: "", phone: "" });
  };

  const handleEditAddress = (index) => {
    setFormData(addresses[index]);
    setEditIndex(index);
  };

  const handleDeleteAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);

    if (updatedAddresses.length > 0) {
      setUserData((prev) => ({
        ...prev,
        address: `${updatedAddresses[0].street}, ${updatedAddresses[0].city}, ${updatedAddresses[0].state}, ${updatedAddresses[0].zip}`,
        phone: updatedAddresses[0].phone,
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        address: "Not provided",
        phone: "Not provided",
      }));
    }
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!userData) return <div>Loading...</div>;

  return (
    <div className="account-container">
      <div className="account-header">
        <h1>Account</h1>
        <p>Name: {userData.name}</p>
        <p>Country: {userData.country || "Not provided"}</p>
        <p>Address: {userData.address || "Not provided"}</p>
        <p>Phone: {userData.phone || "Not provided"}</p>
        <button className="logout-button" onClick={handleLogout}>Log out</button>
      </div>

      <div className="tabs">
      
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>My Orders</button>
        <button className={activeTab === "addresses" ? "active" : ""} onClick={() => setActiveTab("addresses")}>My Addresses</button>
        <button className={activeTab === "wishlist" ? "active" : ""} onClick={() => setActiveTab("wishlist")}>My Wishlist</button>
      </div>

      <div className="tab-content">
        {activeTab === "addresses" && (
          <div className="section-container">
            <h2>Manage Addresses</h2>
            <div className="address-form">
              <input type="text" name="street" placeholder="Street" value={formData.street} onChange={handleChange} />
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
              <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
              <input type="text" name="zip" placeholder="Zip Code" value={formData.zip} onChange={handleChange} />
              <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
              <button className="save-btn" onClick={handleSaveAddress}>{editIndex !== null ? "Update" : "Save"} Address</button>
            </div>

            <h3>Saved Addresses</h3>
            {addresses.length > 0 ? (
              <ul>
                {addresses.map((address, index) => (
                  <li key={index} className="address-item">
                    <p>{address.street}, {address.city}, {address.state}, {address.zip}</p>
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
