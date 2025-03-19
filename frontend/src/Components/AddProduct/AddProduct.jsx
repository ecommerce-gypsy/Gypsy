import React, { useState } from "react";
import "./AddProduct.css";
import Sidebar from "../Sidebar/Sidebar";

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

  // Handle input change for general fields and specifications
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

    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Add a new color option
  const handleAddColor = () => {
    setFormData((prev) => ({
      ...prev,
      colorOptions: [...prev.colorOptions, ""],
    }));
  };

  // Update color value
  const handleColorChange = (index, e) => {
    const newColors = [...formData.colorOptions];
    newColors[index] = e.target.value;
    setFormData((prev) => ({ ...prev, colorOptions: newColors }));
  };

  // Remove a color option
  const handleRemoveColor = (index) => {
    setFormData((prev) => ({
      ...prev,
      colorOptions: prev.colorOptions.filter((_, i) => i !== index),
    }));
  };

  // Handle image upload and preview
  const imageHandler = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName.trim()) newErrors.productName = "Product name is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.new_price) newErrors.new_price = "Price is required.";
    if (!formData.category) newErrors.category = "Category is required.";
    if (!formData.subcategory) newErrors.subcategory = "Subcategory is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const formDataToSubmit = new FormData();
    images.forEach((file) => formDataToSubmit.append("image", file));

    try {
      const imageResponse = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formDataToSubmit,
      });

      if (!imageResponse.ok) throw new Error("Image upload failed");

      const imageData = await imageResponse.json();

      const product = {
        ...formData,
        images: imageData.image_urls,
      };

      const productResponse = await fetch("http://localhost:4000/addproductss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      const productData = await productResponse.json();

      if (productData.success) {
        alert("Product added successfully!");
        resetForm();
      } else {
        alert("Failed to add product");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the product.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the form
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

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={`add-product-container ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar />
      <div className="add-product">
        {/* Theme Toggle Button */}
        <div className="theme-toggle-container">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="add-title">Add New Product</h2>

          {/* Input Fields */}
          {[
            "productName",
            "description",
            "new_price",
            "old_price",
            "stock",
            "length",
          ].map((field) => (
            <div key={field} className="addproduct-itemfield">
              <p>{field.replace("_", " ").toUpperCase()}</p>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
              />
              {errors[field] && <span className="error-message">{errors[field]}</span>}
            </div>
          ))}

          {/* Category */}
          <div className="addproduct-itemfield">
            <p>Category</p>
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

          {/* Subcategory */}
          <div className="addproduct-itemfield">
            <p>Subcategory</p>
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

          {/* Specifications */}
          {Object.entries(formData.specifications).map(([key, value]) => (
            <div key={key} className="addproduct-itemfield">
              <p>{key.charAt(0).toUpperCase() + key.slice(1)}</p>
              <input
                type="text"
                name={key}
                value={value}
                onChange={handleInputChange}
              />
            </div>
          ))}

          {/* Customization */}
          <div className="addproduct-itemfield">
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

          {/* Color Options */}
          <div className="addproduct-itemfield">
            <p>Color Options</p>
            {formData.colorOptions.map((color, index) => (
              <div key={index} className="color-input-group">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e)}
                />
                <button type="button" onClick={() => handleRemoveColor(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddColor}>
              Add Color
            </button>
          </div>

          {/* Image Upload */}
          <div className="addproduct-itemfield">
            <p>Images</p>
            <input type="file" multiple onChange={imageHandler} />
            <div className="image-previews">
              {previewUrls.map((url, index) => (
                <img key={index} src={url} alt="Preview" />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="addproduct-submit" disabled={isLoading}>
            {isLoading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;