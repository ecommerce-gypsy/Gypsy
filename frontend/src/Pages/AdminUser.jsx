import React, { useState, useEffect } from 'react';
import "./AdminUser.css";
import Sidebar from '../Components/Sidebar/Sidebar';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { ThreeDots } from 'react-loader-spinner';

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:4000/admin/users');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setErrorMessage("Failed to fetch users.");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`http://localhost:4000/admin/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
    } catch (err) {
      setErrorMessage("Error updating role.");
      console.error("Error updating role:", err);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`http://localhost:4000/admin/user/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setErrorMessage("Error deleting user.");
      console.error("Error deleting user:", err);
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
  };

  const closeEditModal = () => {
    setEditUser(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:4000/admin/user/${editUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers(users.map(user => user._id === editUser._id ? editUser : user));
      closeEditModal();
    } catch (err) {
      setErrorMessage("Error updating user.");
      console.error("Error updating user:", err);
    }
  };

  return (
    <div className="admin-user-container">
      <Sidebar />
      <div className="admin-user-content">
        <h1 className="admin-user">Admin - User Management</h1>

        {loading ? (
          <div className="loading-container">
            <ThreeDots color="#0047FF" height={50} width={50} />
          </div>
        ) : (
          <>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            <table className="admin-user-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{user.ordersCount}</td> {/* Display number of orders */}
                    <td>{new Date(user.registrationDate).toLocaleDateString()}</td> {/* Display registration date */}
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn" onClick={() => openEditModal(user)}>
                          <FaEdit className="edit-icon" />
                        </button>
                        <button className="icon-btn" onClick={() => handleDelete(user._id)}>
                          <FaTrash className="trash-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {editUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-btn" onClick={closeEditModal}>
                <FaTimes className="close-icon" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <label>Name:</label>
              <input
                type="text"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                required
              />
              <label>Email:</label>
              <input
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                required
              />
              <label>Role:</label>
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="modal-buttons">
                <button className="save-btn" type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUser;
