import React, { useState, useEffect } from 'react';

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);


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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      const updatedUser = await response.json();
      setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
    } catch (err) {
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
      console.error("Error deleting user:", err);
    }
  };

  return (
    <div>
      <h1>Admin - User Management</h1>
      {loading ? <p>Loading...</p> : (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.userid}</td>
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
                <td>
                  <button onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUser;
