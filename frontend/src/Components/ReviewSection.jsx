import React, { useState } from "react";
import "./ReviewSection.css"; // Make sure this CSS file exists

const ReviewSection = () => {
  const [reviews, setReviews] = useState([
    { id: 1, user: "John Doe", rating: 5, comment: "Great product!" },
    { id: 2, user: "Jane Smith", rating: 4, comment: "Very useful." },
  ]);

  const [newReview, setNewReview] = useState({ user: "", rating: 5, comment: "" });

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const submitReview = () => {
    if (newReview.user && newReview.comment) {
      setReviews([...reviews, { id: reviews.length + 1, ...newReview }]);
      setNewReview({ user: "", rating: 5, comment: "" });
    }
  };

  return (
    <div className="review-section">
      <h2>Customer Reviews</h2>
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <strong>{review.user}</strong> ({review.rating} ★): {review.comment}
          </li>
        ))}
      </ul>
      <div className="review-form">
        <input
          type="text"
          name="user"
          placeholder="Your Name"
          value={newReview.user}
          onChange={handleReviewChange}
        />
        <select name="rating" value={newReview.rating} onChange={handleReviewChange}>
          {[5, 4, 3, 2, 1].map((num) => (
            <option key={num} value={num}>{num} ★</option>
          ))}
        </select>
        <textarea
          name="comment"
          placeholder="Write a review..."
          value={newReview.comment}
          onChange={handleReviewChange}
        />
        <button onClick={submitReview}>Submit Review</button>
      </div>
    </div>
  );
};

export default ReviewSection;