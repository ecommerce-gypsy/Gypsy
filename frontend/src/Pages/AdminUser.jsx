import React, { useState, useEffect } from 'react';
import "./AdminUser.css";
import Sidebar from '../Components/Sidebar/Sidebar';
import { FaEdit, FaTrash, FaTimes, FaUserShield, FaUser, FaSearch, FaCalendarAlt, FaBoxOpen } from 'react-icons/fa';
import { ThreeDots } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:4000/admin/users');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setUsers(data);
        toast.success('Users loaded successfully');
      } catch (err) {
        toast.error('Failed to fetch users');
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
      toast.success('User role updated successfully');
    } catch (err) {
      toast.error('Error updating role');
      console.error("Error updating role:", err);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:4000/admin/user/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error('Error deleting user');
        console.error("Error deleting user:", err);
      }
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
      toast.success('User updated successfully');
    } catch (err) {
      toast.error('Error updating user');
      console.error("Error updating user:", err);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="admin-user-container">
      <Sidebar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="admin-user-content">
        <div className="admin-user-header">
          <h1 className="admin-user-title">User Management Dashboard</h1>
          <div className="admin-controls">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <ThreeDots color="#0047FF" height={50} width={50} />
            <p>Loading user data...</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-user-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th><FaBoxOpen className="header-icon" /> Orders</th>
                    <th><FaCalendarAlt className="header-icon" /> Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map(user => (
                      <tr key={user._id}>
                        <td className="user-id">{user._id.substring(0, 8)}...</td>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <div className={`role-badge ${user.role}`}>
                            {user.role === 'admin' ? (
                              <FaUserShield className="role-icon" />
                            ) : (
                              <FaUser className="role-icon" />
                            )}
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="role-select"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </td>
                        <td>{user.ordersCount || 0}</td>
                        <td>{new Date(user.registrationDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="icon-btn edit-btn" 
                              onClick={() => openEditModal(user)}
                              title="Edit user"
                            >
                              <FaEdit className="edit-icon" />
                            </button>
                            <button 
                              className="icon-btn delete-btn" 
                              onClick={() => handleDelete(user._id)}
                              title="Delete user"
                            >
                              <FaTrash className="trash-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-results">
                        No users found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredUsers.length > usersPerPage && (
              <div className="pagination">
                <button 
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={currentPage === i + 1 ? 'active' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {editUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit User Details</h2>
              <button className="close-btn" onClick={closeEditModal}>
                <FaTimes className="close-icon" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="user-form">
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address:</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>User Role:</label>
                <div className="role-select-container">
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button className="cancel-btn" type="button" onClick={closeEditModal}>
                  Cancel
                </button>
                <button className="save-btn" type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUser;