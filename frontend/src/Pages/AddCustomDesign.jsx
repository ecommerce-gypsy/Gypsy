import React, { useState, useRef } from 'react';
import './AddCustomDesign.css';
import Sidebar from '../Components/Sidebar/Sidebar';
import { FiUpload, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const AddCustomDesign = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    priceMultiplier: 1,
    category: [],
    type: '',
    size: '',
    material: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState({
    loading: false,
    message: '',
    success: false
  });
  const fileInputRef = useRef(null);

  const categories = [
    'Beads', 'Pendants', 'Charms', 'Closures', 'Strings', 'Dollar'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setStatus({
          loading: false,
          message: 'Please select a valid image file (JPEG, PNG, etc.)',
          success: false
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setStatus({
          loading: false,
          message: 'Image size should be less than 5MB',
          success: false
        });
        return;
      }

      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategories = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData(prev => ({
      ...prev,
      category: selectedCategories
    }));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !image || !formData.price || formData.category.length === 0) {
      setStatus({
        loading: false,
        message: 'Please fill all required fields (Name, Image, Price, and Category)',
        success: false
      });
      return;
    }

    // Validate price
    if (isNaN(formData.price)) {
      setStatus({
        loading: false,
        message: 'Please enter a valid price',
        success: false
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('image', image);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('priceMultiplier', formData.priceMultiplier);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('type', formData.type);
    formDataToSend.append('size', formData.size);
    formDataToSend.append('material', formData.material);

    setStatus(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch('http://localhost:4000/api/custom-designs', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form on success
        setFormData({
          name: '',
          description: '',
          price: '',
          priceMultiplier: 1,
          category: [],
          type: '',
          size: '',
          material: ''
        });
        removeImage();
        
        setStatus({
          loading: false,
          message: 'Custom design added successfully!',
          success: true
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setStatus(prev => ({ ...prev, message: '' }));
        }, 5000);
      } else {
        setStatus({
          loading: false,
          message: data.message || 'Error uploading custom design',
          success: false
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({
        loading: false,
        message: 'Network error. Please try again.',
        success: false
      });
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="admin-title">ADD NEW CUSTOM DESIGN</h1>
          <p className="admin-subtitle">Fill in the details to add a new custom design to your collection</p>
        </div>
        
        <div className="add-design-container">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Design Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter design name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">
                  Price ($) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter detailed description of the design"
                rows="5"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="image">
                  Design Image <span className="required">*</span>
                </label>
                <div className="file-upload-container">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={removeImage}
                      >
                        <FiX /> Remove
                      </button>
                    </div>
                  ) : (
                    <label className="file-upload-area">
                      <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        required
                      />
                      <div className="upload-content">
                        <FiUpload className="upload-icon" />
                        <p>Click to upload or drag and drop</p>
                        <p className="file-requirements">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="priceMultiplier">Price Multiplier</label>
                <input
                  type="number"
                  id="priceMultiplier"
                  name="priceMultiplier"
                  value={formData.priceMultiplier}
                  onChange={handleChange}
                  min="1"
                  step="0.1"
                  placeholder="1.0"
                />
                <p className="input-hint">
                  This multiplier will be applied to the base price for calculations
                </p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  multiple
                  value={formData.category}
                  onChange={handleCategoryChange}
                  required
                  className="multi-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <p className="input-hint">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div className="form-group">
                <label htmlFor="type">Type</label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="Enter design type"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="size">Size</label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="Enter design size"
                />
              </div>

              <div className="form-group">
                <label htmlFor="material">Material</label>
                <input
                  type="text"
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="Enter material used"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={status.loading}
              >
                {status.loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Processing...
                  </>
                ) : (
                  'ADD DESIGN'
                )}
              </button>
            </div>
          </form>

          {status.message && (
            <div className={`status-message ${status.success ? 'success' : 'error'}`}>
              {status.success ? <FiCheckCircle /> : <FiAlertCircle />}
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCustomDesign;
