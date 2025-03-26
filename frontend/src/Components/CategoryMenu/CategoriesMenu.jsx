import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

export const CategoryMenu = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null); // To track active category

  useEffect(() => {
    fetch('http://localhost:4000/api/categories') // Fetching categories
      .then((response) => response.json())
      .then((data) => {
        console.log('Categories:', data); // Log data to debug
        setCategories(data);
      })
      .catch((error) => console.error('Error fetching categories:', error));
  }, []);

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId); // Toggle active category
  };

  const renderSubCategories = (subCategories) => {
    return (
      <ul>
        {subCategories.map((subCategory) => (
          <li key={subCategory.id}> 
            <Link to={`/category/${subCategory.id}`}>{subCategory.name}</Link> 
          </li>
        ))}
      </ul>
    );
  };

  return (
    <nav>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              to={`/category/${category._id ? category._id : category.name}`}
              onClick={() => handleCategoryClick(category.id)} 
            >
              {category.name}
            </Link>

          
            
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryMenu;
