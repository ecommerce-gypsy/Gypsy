import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetail.css";
import { CartContext } from "../Context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const productId = Number(id);  // Convert product id to a number
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, addToCart } = useContext(CartContext);
  const [mainImage, setMainImage] = useState("");
  const [category, setCategory] = useState("Adult");
  const [setOption, setSetOption] = useState("Single");
  const [quantity, setQuantity] = useState(1);

  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:4000/products/${productId}`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();

        setMainImage(data.images?.[0] || "");
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/reviews/${productId}`);
        if (!response.ok) throw new Error("Failed to fetch reviews");
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [productId]);

  const calculateTotalPrice = () => {
    const basePrice = product?.new_price || 0;
    const categoryMultiplier = category === "Adult" ? 1 : 0.8;
    const setMultiplier = setOption === "Single" ? 1 : 2;
    return (basePrice * categoryMultiplier * setMultiplier * quantity).toFixed(2);
  };
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the input fields
    if (!reviewInput.name || !reviewInput.comment) {
      return alert("Please fill all fields");  // Check if name or comment are empty
    }

    // Prepare the review data
    const newReview = {
      productid: productId,           // Product ID
      rating: reviewInput.rating,     // Rating (1-5)
      reviewText: reviewInput.comment // Review text
    };

    try {
      // Make the POST request to submit the review
      const response = await fetch(`http://localhost:4000/api/reviews`, {
        method: "POST",  // Sending the review data as a POST request
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}` // Ensure that you're sending the JWT token
        },
        body: JSON.stringify(newReview), // Review data to be sent
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");  // Handle errors
      }

      // Add the new review to the list of reviews if submission is successful
      setReviews([...reviews, data]);  // Add the data returned from the server

      // Reset review form after submission
      setReviewInput({ name: "", rating: 5, comment: "" });
      alert("Review submitted successfully!");  // Notify user of successful review submission
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("An error occurred while submitting your review. Please try again.");
    }
};

  
  const getAverageRating = () => {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const stars = [];

    for (let i = 0; i < fullStars; i++) stars.push("★");
    if (halfStar) stars.push("☆");
    for (let i = 0; i < emptyStars; i++) stars.push("☆");

    return stars.join(" ");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found!</div>;

  return (
    <div className="product-detail">
      <div className="image-gallery">
        <img src={mainImage || "default-image-url"} alt={product.name} className="main-image" />
        <div className="thumbnails">
          {product.images?.map((image, index) => (
            <img key={index} src={image} alt={`Thumbnail ${index + 1}`} className="thumbnail" onClick={() => setMainImage(image)} />
          ))}
        </div>
      </div>

      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">
          <strong>₹{product.new_price.toFixed(2)}</strong>
          <span className="old-price">₹{product.old_price.toFixed(2)}</span>
          <span className="discount">(Save {((1 - product.new_price / product.old_price) * 100).toFixed(0)}%)</span>
        </p>
        <p className="description"><strong>Description:</strong> {product.description}</p>

        <div className="category">
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Adult">Adult</option>
            <option value="Child">Child</option>
          </select>
        </div>

        <div className="set">
          <label>Set:</label>
          <select value={setOption} onChange={(e) => setSetOption(e.target.value)}>
            <option value="Single">Single</option>
            <option value="Pair">Pair</option>
          </select>
        </div>

        <div className="quantity">
          <label>Quantity:</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))} min="1" />
        </div>

        <div className="total-price">
          <strong>Total Price (Incl. of all Taxes):</strong> <span>₹ {calculateTotalPrice()}</span>
        </div>

        <button className="add-to-cart" onClick={() => !cart.some((item) => item.productid === product.productid) && addToCart(product)}>
          {cart.some((item) => item.productid === product.productid) ? "In Cart" : "Add to Cart"}
        </button>

        <button className="buy-now" onClick={() => window.location.href = `/checkout?productId=${productId}&quantity=${quantity}&totalPrice=${calculateTotalPrice()}`}>
          Buy Now
        </button>


        {/* Specifications Section */}
        <div className="specifications">
          <h2> Product Specifications</h2>
          <ul>
            {Object.entries(product.specifications || {}).map(([key, value]) => (
              <li key={key} className="spec-item">
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>

        <div className="offers">
          <p>Save extra with below offers:</p>
          <ul>
            <li className="offer-item">5% off on card payment</li>
            <li className="offer-item">10% off on UPI payment</li>
          </ul>
        </div>
        {/* Review Section */}
        <div className="reviews">
          <h2>Customer Reviews</h2>
          <div className="average-rating">
            <span>{renderStars(getAverageRating())}</span>
            <span>({reviews.length} reviews)</span>
          </div>

          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="review">
                <div className="review-header">
                  {review.userid?.image && <img src={review.userid.image} alt={review.userid.name} className="reviewer-image" />}
                  <h4>{review.userid?.name || "Anonymous"} - {renderStars(review.rating)}</h4>
                </div>
                <p>{review.comment}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}

          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h3>Write a Review</h3>
            <input
              type="text"
              placeholder="Your Name"
              value={reviewInput.name}
              onChange={(e) => setReviewInput({ ...reviewInput, name: e.target.value })}
              required
            />
            <select
              value={reviewInput.rating}
              onChange={(e) => setReviewInput({ ...reviewInput, rating: parseInt(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>
                  {num} Stars
                </option>
              ))}
            </select>
            <textarea
              placeholder="Your Review"
              value={reviewInput.comment}
              onChange={(e) => setReviewInput({ ...reviewInput, comment: e.target.value })}
              required
            />
            <button type="submit">Submit Review</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
