import React, { useState, useEffect } from 'react';

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [status, setStatus] = useState('Pending');

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        // Retrieve the token from localStorage (or wherever you store it)
        const token = localStorage.getItem('auth_token'); // or use sessionStorage

        if (!token) {
          console.error('No authentication token found');
          return;
        }

        // Make the request with the token in the Authorization header
        const response = await fetch('http://localhost:4000/api/return/returns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Add the token here
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch returns');
        }

        const data = await response.json();
        setReturns(data.returns); // Adjusted to reflect the response structure
      } catch (error) {
        console.error('Error fetching returns:', error);
      }
    };

    fetchReturns();
  }, []);

  const handleStatusChange = async (returnId) => {
    try {
      // Retrieve the token from localStorage (or wherever you store it)
      const token = localStorage.getItem('auth_token'); // or use sessionStorage

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Make the request with the token in the Authorization header
      const response = await fetch(`http://localhost:4000/api/return/returns/${returnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add the token here
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update return status');
      }

      const updatedReturn = await response.json();
      setReturns(returns.map(returnRequest => returnRequest._id === returnId ? updatedReturn : returnRequest));
    } catch (error) {
      console.error('Error updating return status:', error);
    }
  };

  return (
    <div>
      <h3>Manage Returns</h3>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product ID</th>
            <th>Reason</th>
            <th>Condition</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((returnRequest) => (
            <tr key={returnRequest._id}>
              <td>{returnRequest.orderId}</td>
              <td>{returnRequest.productId}</td>
              <td>{returnRequest.reason}</td>
              <td>{returnRequest.condition}</td>
              <td>{returnRequest.status}</td>
              <td>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button onClick={() => handleStatusChange(returnRequest._id)}>Update Status</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReturns;
