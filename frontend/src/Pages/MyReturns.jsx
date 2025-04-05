import React, { useState, useEffect } from 'react';
import './MyReturns.css';
const MyReturns = ({ userId }) => {
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }

        const response = await fetch(`http://localhost:4000/api/return/returns/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(response.status === 401 ? 
            'Session expired. Please log in again.' : 
            'Failed to fetch return requests');
        }

        const data = await response.json();
        setReturns(data.returns || []);
      } catch (error) {
        console.error('Error fetching returns:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReturns();
  }, [userId]);

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'processing':
        return 'status-processing';
      case 'completed':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="my-returns-container">
      <h3>My Return Requests</h3>
      
      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your return requests...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <svg className="error-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <p>{error}</p>
        </div>
      ) : returns.length > 0 ? (
        <ul className="my-returns-list">
          {returns.map((returnRequest, index) => (
            <li 
              className="my-returns-item" 
              key={returnRequest._id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="return-item-header">
                <h4>Return #{returnRequest._id.slice(-6).toUpperCase()}</h4>
                <span className={`status-badge ${getStatusBadgeClass(returnRequest.status)}`}>
                  {returnRequest.status}
                </span>
              </div>
              
              <div className="return-details">
                <div className="detail-row">
                  <span className="detail-label">Order ID:</span>
                  <span className="detail-value">{returnRequest.orderId || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Product ID:</span>
                  <span className="detail-value">{returnRequest.productId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reason:</span>
                  <span className="detail-value">{returnRequest.reason || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Condition:</span>
                  <span className="detail-value">{returnRequest.condition || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Request Date:</span>
                  <span className="detail-value">
                    {new Date(returnRequest.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-returns-message">
          <svg className="empty-icon" viewBox="0 0 24 24">
            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
          </svg>
          <p>No return requests found</p>
          <p className="sub-text">You haven't requested any returns yet.</p>
        </div>
      )}
    </div>
  );
};

export default MyReturns;