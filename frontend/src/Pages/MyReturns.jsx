import React, { useState, useEffect } from 'react';

const MyReturns = ({ userId }) => {
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem('auth_token'); // Or sessionStorage if you use that

        if (!token) {
          console.error('No authentication token found');
          return;
        }

        // Fetch the returns with the token in the Authorization header
        const response = await fetch(`http://localhost:4000/api/return/returns/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include the token here
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch returns');
        }

        const data = await response.json();
        setReturns(data.returns); // Adjust to match your backend response structure
      } catch (error) {
        console.error('Error fetching returns:', error);
      }
    };

    fetchReturns();
  }, [userId]);

  return (
    <div>
      <h3>My Return Requests</h3>
      <ul>
        {returns.length > 0 ? (
          returns.map((returnRequest) => (
            <li key={returnRequest._id}>
              <p>Product: {returnRequest.productId}</p>
              <p>Status: {returnRequest.status}</p>
            </li>
          ))
        ) : (
          <p>No return requests found.</p>
        )}
      </ul>
    </div>
  );
};

export default MyReturns;
