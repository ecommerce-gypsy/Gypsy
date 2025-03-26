import React, { useState, useEffect } from 'react';

const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', link: '', subCategories: [] });
  const [newSubCategory, setNewSubCategory] = useState({ categoryId: '', name: '', link: '' });

  // Fetch categories initially
  useEffect(() => {
    fetch('http://localhost:4000/api/categories')
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  // Add a new category
  const handleAddCategory = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return alert('You must be logged in as an admin');

    try {
      const response = await fetch('http://localhost:4000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) throw new Error('Failed to add category');
      const data = await response.json();
      setCategories((prev) => [...prev, data]); // Update the category list
      setNewCategory({ name: '', link: '', subCategories: [] }); // Clear input fields
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  // Add a new subcategory to a specific category
  const handleAddSubCategory = async (categoryId) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return alert('You must be logged in as an admin');

    const newSubCategoryData = { name: newSubCategory.name, link: newSubCategory.link };
    try {
      const response = await fetch(`http://localhost:4000/api/categories/${categoryId}/subcategory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSubCategoryData),
      });

      if (!response.ok) throw new Error('Failed to add subcategory');
      const data = await response.json();

      // Update the category with new subcategory
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category._id === categoryId
            ? { ...category, subCategories: data.subCategories }
            : category
        )
      );
      setNewSubCategory({ name: '', link: '', categoryId: '' }); // Clear subcategory fields
    } catch (error) {
      console.error('Error adding subcategory:', error);
    }
  };

  // Delete a subcategory from a category
  const handleDeleteSubCategory = async (categoryId, subCategoryId) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return alert('You must be logged in as an admin');

    try {
      const response = await fetch(`http://localhost:4000/api/categories/${categoryId}/subcategory/${subCategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete subcategory');

      // Update the category after subcategory deletion
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category._id === categoryId
            ? {
                ...category,
                subCategories: category.subCategories.filter((subCategory) => subCategory._id !== subCategoryId),
              }
            : category
        )
      );
    } catch (error) {
      console.error('Error deleting subcategory:', error);
    }
  };

  return (
    <div>
      <h2>Manage Categories</h2>
      {/* Add Category Section */}
      <div>
        <input
          type="text"
          placeholder="Category Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category Link"
          value={newCategory.link}
          onChange={(e) => setNewCategory({ ...newCategory, link: e.target.value })}
        />
        <button onClick={handleAddCategory}>Add Category</button>
      </div>

      {/* Display Categories */}
      {categories.map((category) => (
        <div key={category._id}>
          <h3>{category.name}</h3>
          <ul>
            {category.subCategories.map((subCategory) => (
              <li key={subCategory._id}>
                {subCategory.name}
                <button onClick={() => handleDeleteSubCategory(category._id, subCategory._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {/* Add Subcategory */}
          <input
            type="text"
            placeholder="Subcategory Name"
            value={newSubCategory.name}
            onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value, categoryId: category._id })}
          />
          <input
            type="text"
            placeholder="Subcategory Link"
            value={newSubCategory.link}
            onChange={(e) => setNewSubCategory({ ...newSubCategory, link: e.target.value, categoryId: category._id })}
          />
          <button onClick={() => handleAddSubCategory(category._id)}>Add Subcategory</button>
        </div>
      ))}
    </div>
  );
};

export default AdminCategory;
