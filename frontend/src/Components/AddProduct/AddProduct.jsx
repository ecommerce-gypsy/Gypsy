
import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../Assets/upload_area.png'; 
//import Sidebar from "../Components/Sidebar/Sidebar";// Ensure this path is correct

const AddProduct = () => {
  const [images, setImages] = useState([]); // Array to store actual file objects
  const [previewUrls, setPreviewUrls] = useState([]); // Array to store preview URLs
  const [loading, setLoading] = useState(false); // Loading state for button
  const [productDetails, setProductDetails] = useState({
    name: '',
    description: '',
    price: '',
    old_price: '',
    new_price: '',
    stock: '',
    category: 'anklets',
  });

  // Handler for multiple image uploads
  const imageHandler = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    setImages(files); // Store actual file objects for backend
    const previews = files.map((file) => URL.createObjectURL(file)); // Generate preview URLs
    setPreviewUrls(previews);
  };

  // Handler for form input changes
  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  // Function to add the product
  const Add_Product = async () => {
    setLoading(true);
    try {
      // Create FormData for image upload
      const formData = new FormData();
      images.forEach((file) => {
        formData.append('image', file);
      });
  
      // Upload images
      const imageResponse = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!imageResponse.ok) {
        const errorMessage = await imageResponse.text();
        alert(`Image upload failed: ${errorMessage}`);
        return;
      }
  
      const imageData = await imageResponse.json();
  
      const product = { 
        ...productDetails, 
        images: imageData.image_urls // Ensure this matches your backend response
      };
  
      // Add product
      const productResponse = await fetch('http://localhost:4000/addproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
  
      if (!productResponse.ok) {
        const errorMessage = await productResponse.text();
        alert(`Failed to add product: ${errorMessage}`);
        return;
      }
  
      const productData = await productResponse.json();
      if (productData.success) {
        alert('Product added successfully!');
        // Reset form
        setProductDetails({
          name: '',
          description: '',
          price: '',
          old_price: '',
          new_price: '',
          stock: '',
          category: 'anklets',
        });
        setImages([]);
        setPreviewUrls([]);
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    
    <div className="add-product">
      
      
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type here"
        />
      </div>
      <div className="addproduct-itemfield">
        <p>Description</p>
        <textarea
          value={productDetails.description}
          onChange={changeHandler}
          name="description"
          placeholder="Product description"
        />
      </div>
      <div className="addproduct-price">
        
        <div className="addproduct-itemfield">
          <p>Old Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="number"
            name="old_price"
            placeholder="Old Price"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>New Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="number"
            name="new_price"
            placeholder="New Price"
          />
        </div>
        <div className="addproduct-itemfield">
          <p>Stock Quantity</p>
          <input
            value={productDetails.stock}
            onChange={changeHandler}
            type="number"
            name="stock"
            placeholder="Stock Quantity"
          />
        </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select
          value={productDetails.category}
          onChange={changeHandler}
          name="category"
          className="add-product-selector"
        >
          <option value="anklets">ANKLETS</option>
          <option value="bracelets">BRACELETS</option>
          <option value="neckpieces">NECKPIECES</option>
          <option value="rings">RINGS</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          {previewUrls.length > 0 ? (
            previewUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                className="addproduct-thumnail-img"
                alt={`Preview ${index}`}
              />
            ))
          ) : (
            <img
              src={upload_area}
              className="addproduct-thumnail-img"
              alt="Upload thumbnail"
            />
          )}
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id="file-input"
          multiple
          hidden
        />
      </div>
      <button
        onClick={Add_Product}
        className="addproduct-btn"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'ADD'}
      </button>
    </div>
  );
};

export default AddProduct;

