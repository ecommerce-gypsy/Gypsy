import React, { useState } from "react";
import "./AddProduct.css";
import Sidebar from "../Sidebar/Sidebar";
import { FiSun, FiMoon, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    new_price: "",
    old_price: "",
    stock: "",
    category: "",
    subcategory: "",
    specifications: {
      material: "",
      beadSize: "",
      beadShape: "",
      stringingMaterial: "",
      closureType: "",
      weight: "",
    },
    customization: false,
    colorOptions: [],
    length: "",
    images: [],
    ratings: [],
    isActive: true,
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name in formData.specifications) {
      setFormData((prev) => ({
        ...prev,
        specifications: { ...prev.specifications, [name]: value },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddColor = () => {
    setFormData((prev) => ({
      ...prev,
      colorOptions: [...prev.colorOptions, ""],
    }));
  };

  const handleColorChange = (index, e) => {
    const newColors = [...formData.colorOptions];
    newColors[index] = e.target.value;
    setFormData((prev) => ({ ...prev, colorOptions: newColors }));
  };

  const handleRemoveColor = (index) => {
    setFormData((prev) => ({
      ...prev,
      colorOptions: prev.colorOptions.filter((_, i) => i !== index),
    }));
  };

  const imageHandler = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.new_price) newErrors.new_price = "Price is required";
    if (isNaN(formData.new_price)) newErrors.new_price = "Price must be a number";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.subcategory) newErrors.subcategory = "Subcategory is required";
    if (images.length === 0) newErrors.images = "At least one image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Upload images
      const formDataToSubmit = new FormData();
      images.forEach((file) => formDataToSubmit.append("image", file));

      const imageResponse = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formDataToSubmit,
      });

      if (!imageResponse.ok) throw new Error("Image upload failed");

      const imageData = await imageResponse.json();

      // Submit product data
      const productResponse = await fetch("http://localhost:4000/addproductss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: imageData.image_urls,
        }),
      });

      const productData = await productResponse.json();

      if (productData.success) {
        alert("Product added successfully!");
        resetForm();
      } else {
        throw new Error(productData.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "An error occurred while adding the product");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      description: "",
      new_price: "",
      old_price: "",
      stock: "",
      category: "",
      subcategory: "",
      specifications: {
        material: "",
        beadSize: "",
        beadShape: "",
        stringingMaterial: "",
        closureType: "",
        weight: "",
      },
      customization: false,
      colorOptions: [],
      length: "",
      images: [],
      ratings: [],
      isActive: true,
    });
    setImages([]);
    setPreviewUrls([]);
    setErrors({});
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={`add-product-container ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar />
      <div className="add-product">
        <div className="theme-toggle-container">
          <button 
            className="theme-toggle" 
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="add-title">Add New Product</h2>

          <div className="form-grid">
            {/* Product Information */}
            <div className="form-section">
              <h3 className="section-title">Product Information</h3>
              {["productName", "description"].map((field) => (
                <div key={field} className="form-group">
                  <label>
                    {field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
                    <span className="required">*</span>
                  </label>
                  {field === "description" ? (
                    <textarea
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  ) : (
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                    />
                  )}
                  {errors[field] && <span className="error-message">{errors[field]}</span>}
                </div>
              ))}
            </div>

            {/* Pricing & Stock */}
            <div className="form-section">
              <h3 className="section-title">Pricing & Stock</h3>
              {["new_price", "old_price", "stock", "length"].map((field) => (
                <div key={field} className="form-group">
                  <label>
                    {field.replace("_", " ").charAt(0).toUpperCase() + field.replace("_", " ").slice(1)}
                    {["new_price", "stock"].includes(field) && <span className="required">*</span>}
                  </label>
                  <input
                    type={["new_price", "old_price", "stock"].includes(field) ? "number" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    min="0"
                  />
                  {errors[field] && <span className="error-message">{errors[field]}</span>}
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="form-section">
              <h3 className="section-title">Categories</h3>
              <div className="form-group">
                <label>
                  Category<span className="required">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  <option value="anklets">Anklets</option>
                  <option value="neckpieces">Neckpieces</option>
                  <option value="bracelets">Bracelets</option>
                  <option value="rings">Rings</option>
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label>
                  Subcategory<span className="required">*</span>
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                >
                  <option value="">Select Subcategory</option>
                  <option value="single-stranded">Single Stranded</option>
                  <option value="multistranded">Multistranded</option>
                  <option value="minimalistic">Minimalistic</option>
                </select>
                {errors.subcategory && <span className="error-message">{errors.subcategory}</span>}
              </div>
            </div>

            {/* Specifications */}
            <div className="form-section">
              <h3 className="section-title">Specifications</h3>
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="form-group">
                  <label>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={value}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
            </div>

            {/* Customization */}
            <div className="form-section">
              <h3 className="section-title">Customization</h3>
              <div className="form-group checkbox-group">
                <label className="customization-label">
                  <input
                    type="checkbox"
                    name="customization"
                    checked={formData.customization}
                    onChange={handleInputChange}
                  />
                  <span>Allow Customization</span>
                </label>
              </div>

              {formData.customization && (
                <div className="color-options">
                  <label>Color Options</label>
                  {formData.colorOptions.map((color, index) => (
                    <div key={index} className="color-input-group">
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => handleColorChange(index, e)}
                        placeholder="Enter color name or hex code"
                      />
                      <button
                        type="button"
                        className="remove-color-btn"
                        onClick={() => handleRemoveColor(index)}
                        aria-label="Remove color"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-color-btn"
                    onClick={handleAddColor}
                  >
                    <FiPlus /> Add Color
                  </button>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="form-section">
              <h3 className="section-title">Images</h3>
              <div className="form-group">
                <label className="file-upload-label">
                  <FiUpload /> Upload Images
                  <span className="required">*</span>
                  <input
                    type="file"
                    onChange={imageHandler}
                    multiple
                    accept="image/*"
                    className="file-upload-input"
                  />
                </label>
                {errors.images && <span className="error-message">{errors.images}</span>}
                
                <div className="image-previews">
                  {previewUrls.length > 0 ? (
                    previewUrls.map((url, index) => (
                      <div key={index} className="image-preview-container">
                        <img src={url} alt={`Preview ${index + 1}`} />
                        <span className="image-index">{index + 1}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-images-placeholder">
                      No images selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="reset-btn"
              onClick={resetForm}
              disabled={isLoading}
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;