import React, { useEffect, useState } from "react";
import './ReviewSummary.css';

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
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/reviews/${productId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to fetch reviews");

      if (data.reviews && data.reviews.length > 0) {
        setReviews(data.reviews);
        setAverageRating(Number(data.reviewStats?.averageRating) || 0);
        setNumberOfReviews(data.reviewStats?.numberOfReviews || 0);
      } else {
        setReviews([]);
        setAverageRating(0);
        setNumberOfReviews(0);
      }
    } catch (error) {
      setError(error.message);
    } finally {
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
      setSubmitError("Review must be at least 5 characters long.");
      return;
    }

    const reviewData = { productid: productId, rating, reviewText };

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Unauthorized: Please log in to submit a review.");

      const response = await fetch("http://localhost:4000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit review.");

      setSubmitMessage("✅ Review submitted successfully!");
      setSubmitError("");
      setRating(0);
      setReviewText("");
      setShowModal(false);

      fetchReviews();
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const filteredReviews = selectedRating
    ? reviews.filter((review) => review.rating === selectedRating)
    : reviews;

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortOrder === "highest") return b.rating - a.rating;
    if (sortOrder === "lowest") return a.rating - b.rating;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const displayedReviews = showAll ? sortedReviews : sortedReviews.slice(0, 3);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }}>
      <h2>Customer Reviews</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{averageRating.toFixed(1)}</span>
        <span style={{ fontSize: "1.2rem" }}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < Math.round(averageRating) ? "gold" : "#ccc" }}>★</span>
          ))}
        </span>
        <p>{numberOfReviews} reviews</p>
      </div>

      <div style={{ margin: "10px 0" }}>
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

      <div>
        {reviews.length === 0 ? (
          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#555", textAlign: "center", marginTop: "20px" }}>Be the first to give a review!</p>
        ) : (
          displayedReviews.map((review) => (
            <div key={review._id} style={{ borderBottom: "1px solid #ddd", padding: "10px 0" }}>
              <div>
                <span style={{ fontWeight: "bold" }}>{review.userid?.name || "Anonymous"}</span>
              </div>
              <div style={{ fontSize: "1.2rem", marginBottom: "5px" }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} style={{ color: i < review.rating ? "gold" : "#ccc" }}>★</span>
                ))}
              </div>
              <p>{review.reviewText}</p>
            </div>
          ))
        )}
      </div>

      <button style={{ padding: "10px 20px", backgroundColor: "#0047ff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }} onClick={() => setShowModal(true)}>
        Write a Review
      </button>

      {showModal && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", borderRadius: "8px", zIndex: "1000" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", top: "5px", right: "10px", cursor: "pointer", fontSize: "20px" }} onClick={() => setShowModal(false)}>×</span>
            <h3>Write a Review</h3>
            {submitMessage && <p style={{ color: "green" }}>{submitMessage}</p>}
            {submitError && <p style={{ color: "red" }}>{submitError}</p>}

            <form onSubmit={handleSubmit}>
              <label>Rating:</label>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{ color: star <= rating ? "gold" : "#ccc", cursor: "pointer" }}
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
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd" }}
              />
              <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#0047ff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Submit Review</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;