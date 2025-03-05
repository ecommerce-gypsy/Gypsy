import React, { useEffect, useState } from "react";
import "./ReviewSummary.css";

const ReviewSummary = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [numberOfReviews, setNumberOfReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortOrder, setSortOrder] = useState("newest");
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal state

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/reviews/${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      setReviews(data.reviews);
      setAverageRating(Number(data.reviewStats.averageRating) || 0);
      setNumberOfReviews(data.reviewStats.numberOfReviews || 0);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (rating === 0) {
      setSubmitError("Please select a rating.");
      return;
    }
    if (reviewText.trim().length < 5) {
      setSubmitError("Review must be at least 5 characters.");
      return;
    }
  
    const reviewData = {
      productid: productId,
      rating,
      reviewText, 
    };
  
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:4000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }
  
      setSubmitMessage("Review submitted successfully!");
      setSubmitError("");
      setRating(0);
      setReviewText("");
      setShowModal(false); // Close modal after submitting
  
      fetchReviews(); // Refresh reviews after submission
    } catch (err) {
      setSubmitError(err.message);
    }
  };
  
  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p className="error">{error}</p>;

  const filteredReviews = selectedRating
    ? reviews.filter((review) => review.rating === selectedRating)
    : reviews;

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortOrder === "highest") return b.rating - a.rating;
    if (sortOrder === "lowest") return a.rating - b.rating;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const displayedReviews = showAll ? sortedReviews : sortedReviews.slice(0, 3);

  return (
    <div className="review-summary">
      <h2>Customer Reviews</h2>
      <div className="rating-summary">
        <span className="average-rating">{averageRating.toFixed(1)}</span>
        <span className="stars">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < Math.round(averageRating) ? "star filled" : "star"}>★</span>
          ))}
        </span>
        <p>{numberOfReviews} reviews</p>
      </div>

      <div className="filter-sort-controls">
        <label>Filter by Stars:</label>
        <select value={selectedRating} onChange={(e) => setSelectedRating(Number(e.target.value))}>
          <option value="0">All Stars</option>
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>{star} Stars</option>
          ))}
        </select>

        <label>Sort By:</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      <div className="reviews">
        {displayedReviews.length > 0 ? (
          displayedReviews.map((review) => (
            <div key={review._id} className="review">
              <div className="review-header">
                <span className="reviewer-name">{review.userid?.name || "Anonymous"}</span>
              </div>
              <div className="review-rating">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < review.rating ? "star filled" : "star"}>★</span>
                ))}
              </div>
              <p className="review-text">{review.reviewText}</p>
            </div>
          ))
        ) : (
          <p>No reviews found for this filter.</p>
        )}
      </div>

      {sortedReviews.length > 3 && (
        <button className="view-more-btn" onClick={() => setShowAll(!showAll)}>
          {showAll ? "View Less" : "View More Reviews"}
        </button>
      )}

      {/* Write a Review Button */}
      <button className="write-review-btn" onClick={() => setShowModal(true)}>
        Write a Review
      </button>

      {/* Modal for Review Submission */}
      {showModal && (
        <div className="review-modal">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setShowModal(false)}>×</span>
            <h3>Write a Review</h3>
            {submitMessage && <p className="success">{submitMessage}</p>}
            {submitError && <p className="error">{submitError}</p>}

            <form onSubmit={handleSubmit}>
              <label>Rating:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= rating ? "star filled" : "star"}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <label>Review:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
              />

              <button type="submit">Submit Review</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;
