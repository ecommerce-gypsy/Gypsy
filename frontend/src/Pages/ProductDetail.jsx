import React, { useContext,useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ProductDetail.css";
import { CartContext } from "../Context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const productId = Number(id);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, addToCart } = useContext(CartContext);
  const [mainImage, setMainImage] = useState("");

  const [category, setCategory] = useState("Adult"); // Default category
  const [setOption, setSetOption] = useState("Single"); // Default set
  const [quantity, setQuantity] = useState(1);

  // Fetch product data from the API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:4000/products/${productId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();

        // Check if no subimages are available and set mainImage accordingly
        const images = data.images || [];
        if (images.length === 0) {
          setMainImage(""); // Set to empty if no subimages available
        } else if (images.length === 1) {
          setMainImage(images[0]); // If one image, set it as mainImage
        } else {
          setMainImage(images[0]); // Set the first image as the default mainImage
        }

        setProduct({
          ...data,
          images, // Ensure images are properly set
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Calculate total price based on category, set, and quantity
  const calculateTotalPrice = () => {
    const basePrice = product?.new_price || 0;
    const categoryMultiplier = category === "Adult" ? 1 : 0.8; // Adult: full price, Child: 80%
    const setMultiplier = setOption === "Single" ? 1 : 2; // Single: 1x, Pair: 2x
    return (basePrice * categoryMultiplier * setMultiplier * quantity).toFixed(2);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <div>Product not found!</div>;
  }
  const isInCart = (product) => cart.some((item) => item.productid === product.productid);
  return (
    <div className="product-detail">
      {/* Left Section - Image Gallery */}
      <div className="image-gallery">
        <img src={mainImage || "default-image-url"} alt={product.name} className="main-image" />
        <div className="thumbnails">
          {product.images?.length > 0 ? (
            product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="thumbnail"
                onClick={() => setMainImage(image)}
                role="button"
                aria-label={`Thumbnail ${index + 1}`}
              />
            ))
          ) : (
            <p>No images available</p>
          )}
        </div>
      </div>

      {/* Right Section - Product Information */}
      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">
          <strong>₹{product.new_price.toFixed(2)}</strong>
          <span className="old-price">₹{product.old_price.toFixed(2)}</span>
          <span className="discount">
            (Save {((1 - product.new_price / product.old_price) * 100).toFixed(0)}%)
          </span>
        </p>
        <p className="description">
          <strong>Description:</strong> {product.description}
        </p>

        {/* Category Selector */}
        <div className="category">
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Adult">Adult</option>
            <option value="Child">Child</option>
          </select>
        </div>

        {/* Set Selector */}
        <div className="set">
          <label>Set:</label>
          <select value={setOption} onChange={(e) => setSetOption(e.target.value)}>
            <option value="Single">Single</option>
            <option value="Pair">Pair</option>
          </select>
        </div>

        {/* Quantity Selector */}
        <div className="quantity">
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
            min="1"
          />
        </div>

        {/* Total Price */}
        <div className="total-price">
          <strong>Total Price (Incl. of all Taxes):</strong>
          <span>₹ {calculateTotalPrice()}</span>
        </div>

         {/* Add to Cart Button */}
            <button
              className="add-to-cart"
              onClick={() => {
                if (!isInCart(product)) {
                  addToCart(product);
                }
              }}
            >
              {isInCart(product) ? "In Cart" : "Add to Cart"}
            </button>
        {/* Offers Section */}
        <div className="offers">
          <p>Save extra with below offers:</p>
          <ul>
            <li className="offer-item">5% off on card payment</li>
            <li className="offer-item">10% off on UPI payment</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
