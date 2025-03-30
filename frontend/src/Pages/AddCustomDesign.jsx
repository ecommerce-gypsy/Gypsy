/*import React, { useState } from 'react';

const AddCustomDesign = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !image) {
      setMessage('Name and image are required!');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:4000/api/custom-designs', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Custom design added successfully!');
        setName('');
        setDescription('');
        setImage(null);
      } else {
        setMessage(data.message || 'Error uploading custom design');
      }
    } catch (error) {
      setMessage('Error uploading custom design');
      console.error('Error:', error);
    }
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <div className="add-design-container">
      <h3>Add New Custom Design</h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="name">Design Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Add Design</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddCustomDesign;
*/

import React, { useState } from 'react';

const AddCustomDesign = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState('');
  const [priceMultiplier, setPriceMultiplier] = useState(1);
  const [category, setCategory] = useState([]);
  const [type, setType] = useState('');
  const [size, setSize] = useState('');
  const [material, setMaterial] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !image || !price || !category.length) {
      setMessage('Name, image, price, and category are required!');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('price', price);
    formData.append('priceMultiplier', priceMultiplier);
    formData.append('category', category);
    formData.append('type', type);
    formData.append('size', size);
    formData.append('material', material);

    setIsLoading(true); // Set loading state to true when starting the request

    try {
      const response = await fetch('http://localhost:4000/api/custom-designs', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Custom design added successfully!');
        setName('');
        setDescription('');
        setImage(null);
        setPrice('');
        setPriceMultiplier(1);
        setCategory([]);
        setType('');
        setSize('');
        setMaterial('');
      } else {
        setMessage(data.message || 'Error uploading custom design');
      }
    } catch (error) {
      setMessage('Error uploading custom design');
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Set loading state to false after the request
    }
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  // Handle category change (you can use checkboxes or a multi-select dropdown)
  const handleCategoryChange = (e) => {
    const selectedCategories = Array.from(e.target.selectedOptions, (option) => option.value);
    setCategory(selectedCategories);
  };

  return (
    <div className="add-design-container">
      <h3>Add New Custom Design</h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="name">Design Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priceMultiplier">Price Multiplier</label>
          <input
            type="number"
            id="priceMultiplier"
            value={priceMultiplier}
            onChange={(e) => setPriceMultiplier(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            multiple
            value={category}
            onChange={handleCategoryChange}
            required
          >
            <option value="Beads">Beads</option>
            <option value="Pendants">Pendants</option>
            <option value="Charms">Charms</option>
            <option value="Closures">Closures</option>
            <option value="Strings">Strings</option>
            <option value="Dollar">Dollar</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="type">Type</label>
          <input
            type="text"
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="size">Size</label>
          <input
            type="text"
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="material">Material</label>
          <input
            type="text"
            id="material"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Add Design'}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddCustomDesign;
