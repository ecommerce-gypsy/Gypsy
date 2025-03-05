import React, { useState } from 'react';
import './AddProduct.css';
import Sidebar from '../Sidebar/Sidebar';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    new_price: '',
    old_price: '',
    stock: '',
    category: '',
    subcategory: '',
    specifications: {
      material: '',
      beadSize: '',
      beadShape: '',
      stringingMaterial: '',
      closureType: '',
      weight: '',
    },
    customization: false,
    colorOptions: [],
    length: '',
    images: [],
    ratings: [],
    isActive: true,
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Handle input change for general fields and specification fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.specifications) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [name]: value,
        },
      });
    } else if (name === 'customization') {
      setFormData({
        ...formData,
        [name]: e.target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Add color options
  const handleColorInput = () => {
    setFormData({
      ...formData,
      colorOptions: [...formData.colorOptions, ''],
    });
  };

  // Handle change for each color input
  const handleColorChange = (index, e) => {
    const newColorOptions = [...formData.colorOptions];
    newColorOptions[index] = e.target.value;
    setFormData({
      ...formData,
      colorOptions: newColorOptions,
    });
  };

  // Remove a color option
  const handleColorRemove = (index) => {
    const newColorOptions = [...formData.colorOptions];
    newColorOptions.splice(index, 1);
    setFormData({
      ...formData,
      colorOptions: newColorOptions,
    });
  };

  // Handle image selection and preview
  const imageHandler = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      productName,
      description,
      category,
      subcategory,
      specifications,
      customization,
      colorOptions,
      length,
      old_price,
      new_price,
      stock,
    } = formData;

    const formDataToSubmit = new FormData();
    images.forEach((file) => {
      formDataToSubmit.append('image', file);
    });

    try {
      // Image upload request
      const imageResponse = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formDataToSubmit,
      });

      if (!imageResponse.ok) {
        throw new Error('Image upload failed');
      }

      const imageData = await imageResponse.json(); // Only read response once here

      const product = {
        productName,
        description,
        category,
        subcategory,
        specifications,
        customization,
        colorOptions,
        length,
        old_price,
        new_price,
        stock,
        ratings: [],
        isActive: formData.isActive,
        images: imageData.image_urls, // Use image URLs from imageData
      };

      // Product creation request
      const productResponse = await fetch('http://localhost:4000/addproductss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });


      const productData = await productResponse.json(); // Only read response once here
      if (productData.success) {
        alert('Product added successfully!');
        resetForm();
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error("Error:", error); // Log the error message
      alert('An error occurred while adding the product. Please check the console for details.');
    }
  };

  // Reset the form after successful submission
  const resetForm = () => {
    setFormData({
      productName: '',
      description: '',
      new_price: '',
      old_price: '',
      stock: '',
      category: '',
      subcategory: '',
      specifications: {
        material: '',
        beadSize: '',
        beadShape: '',
        stringingMaterial: '',
        closureType: '',
        weight: '',
      },
      customization: false,
      colorOptions: [],
      length: '',
      images: [],
      ratings: [],
      isActive: true,
    });
    setImages([]);
    setPreviewUrls([]);
  };

  return (
    <div className="add-product-container">
      <Sidebar />
      <div className="add-product">
        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="addproduct-itemfield">
            <p>Product Name</p>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
            />
          </div>

          {/* Description */}
          <div className="addproduct-itemfield">
            <p>Description</p>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

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
          </div>

          {/* Specifications */}
          {Object.entries(formData.specifications).map(([key, value]) => (
            <div className="addproduct-itemfield" key={key}>
              <p>{key.charAt(0).toUpperCase() + key.slice(1)}</p>
              <input
                type="text"
                name={key}
                value={value}
                onChange={handleInputChange}
              />
            </div>
          ))}

          {/* New Price */}
          <div className="addproduct-itemfield">
            <p>New Price</p>
            <input
              type="text"
              name="new_price"
              value={formData.new_price}
              onChange={handleInputChange}
            />
          </div>

          {/* Old Price */}
          <div className="addproduct-itemfield">
            <p>Old Price</p>
            <input
              type="text"
              name="old_price"
              value={formData.old_price}
              onChange={handleInputChange}
            />
          </div>

          {/* Stock */}
          <div className="addproduct-itemfield">
            <p>Stock</p>
            <input
              type="text"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
            />
          </div>

          {/* Customization */}
          <div className="addproduct-itemfield">
            <label>
              Allow Customization
              <input
                type="checkbox"
                name="customization"
                checked={formData.customization}
                onChange={handleInputChange}
              />
            </label>
          </div>

          {/* Color Options */}
          <div className="addproduct-itemfield">
            <p>Color Options</p>
            {formData.colorOptions.map((color, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e)}
                />
                <button type="button" onClick={() => handleColorRemove(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={handleColorInput}>
              Add Color
            </button>
          </div>

          {/* Length */}
          <div className="addproduct-itemfield">
            <p>Length</p>
            <input
              type="text"
              name="length"
              value={formData.length}
              onChange={handleInputChange}
            />
          </div>

          {/* Images */}
          <div className="addproduct-itemfield">
            <p>Images</p>
            <input type="file" multiple onChange={imageHandler} />
            <div className="image-previews">
              {previewUrls.map((url, index) => (
                <img key={index} src={url} alt="Preview" />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="addproduct-submit">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;


/*
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
*/
