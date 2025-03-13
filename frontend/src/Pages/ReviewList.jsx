import React, { useState, useEffect } from 'react';
//import './ReviewList.css';  // Assuming similar CSS as in AdminOrder.css
import Sidebar from '../Components/Sidebar/Sidebar';  // Same Sidebar component
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { ThreeDots } from 'react-loader-spinner';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'true', or 'false'
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editReview, setEditReview] = useState(null);
  const [viewReview, setViewReview] = useState(null); 

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]); // Refetch reviews when status filter changes

  const fetchReviews = async () => {
    let url = 'http://localhost:4000/api/review'; // Default to fetch all reviews

    if (statusFilter !== 'all') {
      url = `http://localhost:4000/api/review/status/${statusFilter}`;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setErrorMessage('Error fetching reviews: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/review/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: !currentStatus,  // Change the status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      const updatedReview = await response.json();

      setReviews(reviews.map(review => review._id === id ? updatedReview : review));
    } catch (err) {
      setErrorMessage('Error updating review status: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/review/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Update the state to remove the deleted review
      setReviews(reviews.filter(review => review._id !== id));
    } catch (err) {
      setErrorMessage('Error deleting review: ' + err.message);
    }
  };

  const openEditModal = (review) => {
    setEditReview(review);
  };

  const closeEditModal = () => {
    setEditReview(null);
  };

  const openViewModal = (review) => {
    setViewReview(review);
  };

  const closeViewModal = () => {
    setViewReview(null);
  };
  const handleSaveChanges = async (e) => {
    e.preventDefault(); // Prevent the form from submitting and reloading the page
  
    // Ensure the status is correctly updated
    const updatedReviewData = {
      ...editReview,
      status: !editReview.status,  // Toggle the status
    };
  
    try {
      // Send the update request to the server
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setErrorMessage('No token found. Please log in.');
        return;
      }
  
      const response = await fetch(`http://localhost:4000/api/review/${editReview._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updatedReviewData.status,
          // Include other fields like reviewText and rating if needed
          reviewText: updatedReviewData.reviewText,
          rating: updatedReviewData.rating,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update review status');
      }
  
      const updatedReview = await response.json();
  
      // Update the review list with the updated review
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === updatedReview._id ? updatedReview : review
        )
      );
  
      // Close the modal after saving changes
      closeEditModal();
    } catch (err) {
      setErrorMessage('Error updating review: ' + err.message);
    }
  };
  
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-container">
        <h1 className="admin-title">Review Management</h1>
        {loading ? (
          <div className="loading-container">
            <ThreeDots color="#0047FF" height={50} width={50} />
          </div>
        ) : (
          <>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            <div className="status-filter">
              <button onClick={() => setStatusFilter('all')}>All</button>
              <button onClick={() => setStatusFilter('true')}>Active</button>
              <button onClick={() => setStatusFilter('false')}>Inactive</button>
            </div>
            <div className="table-container">
              <table className="review-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Product</th>
                    <th>Review</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review._id}>
                      <td>{review.userid?.email || 'Unknown'}</td>
                      <td>{review.productid}</td>
                      <td>{review.reviewText}</td>
                      <td>{review.rating}</td>
                      <td>{review.status ? 'Active' : 'Inactive'}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn" onClick={() => openEditModal(review)}>
                            <FaEdit className="edit-icon" />
                          </button>
                          <button className="icon-btn" onClick={() => handleDelete(review._id)}>
                            <FaTrash className="trash-icon" />
                          </button>
                          <button className="icon-btn" onClick={() => openViewModal(review)}>
                            <FaEye className="view-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit Review Modal */}
{editReview && (
  <div className="modal-overlay">
    <div className="modal-container">
      <div className="modal-header">
        <h2>Edit Review</h2>
        <button className="close-btn" onClick={closeEditModal}>X</button>
      </div>
      <form>
        <label>Status:</label>
        <select
          value={editReview.status ? 'Active' : 'Inactive'}
          onChange={(e) => setEditReview({ ...editReview, status: e.target.value === 'Active' })}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <div className="modal-buttons">
          <button className="save-btn" type="button" onClick={handleSaveChanges}>Save Changes</button>
          
        </div>
      </form>
    </div>
  </div>
)}

{/* View Review Modal */}
{viewReview && (
  <div className="modal-overlay">
    <div className="modal-container">
      <div className="modal-header">
        <h2>Review Details</h2>
        <button className="close-btn" onClick={closeViewModal}>X</button>
      </div>
      <div className="modal-body">
        <p><strong>User:</strong> {viewReview.userid?.email || 'Unknown'}</p>
        <p><strong>Product:</strong> {viewReview.productid}</p>
        <p><strong>Review:</strong> {viewReview.reviewText}</p>
        <p><strong>Rating:</strong> {viewReview.rating}</p>
        <p><strong>Status:</strong> {viewReview.status ? 'Active' : 'Inactive'}</p>
      </div>
      
    </div>
  </div>
)}

    </div>
  );
};

export default ReviewList;
