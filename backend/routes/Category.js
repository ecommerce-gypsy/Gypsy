const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const verifyAdminToken = require('../middleware/isAdmin');
const auth = require('../middleware/auth');

// Get all categories and subcategories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Add a new category
router.post('/', auth, verifyAdminToken, async (req, res) => {
  const { name, link, subCategories } = req.body;

  try {
    const newCategory = new Category({ name, link, subCategories });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error adding category:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error adding category', error: error.message });
  }
});

// Update a subcategory
router.put('/:categoryId/subcategory/:subCategoryId', auth, verifyAdminToken, async (req, res) => {
  const { categoryId, subCategoryId } = req.params;
  const { name, link } = req.body;

  try {
    const category = await Category.findById(categoryId);
    const subCategory = category.subCategories.id(subCategoryId);

    // Check if subcategory exists
    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    // Update subcategory fields
    subCategory.name = name || subCategory.name;
    subCategory.link = link || subCategory.link;

    await category.save();
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating subcategory', error: error.message });
  }
});

// Delete a category
router.delete('/:id', auth, verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    await Category.findByIdAndDelete(id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Add a subcategory to an existing category
router.post('/:categoryId/subcategory', auth, verifyAdminToken, async (req, res) => {
  const { categoryId } = req.params;
  const { name, link } = req.body;

  try {
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    category.subCategories.push({ name, link });

    await category.save();
    res.status(201).json(category);  // Return the updated category with subcategories
  } catch (error) {
    res.status(500).json({ message: 'Error adding subcategory', error: error.message });
  }
});

router.delete('/:categoryId/subcategory/:subCategoryId', verifyAdminToken, async (req, res) => {
  const { categoryId, subCategoryId } = req.params;
  console.log('Category ID:', categoryId);
  console.log('Subcategory ID:', subCategoryId);
  
  if (!categoryId || !subCategoryId) {
    return res.status(400).json({ message: 'Category ID or Subcategory ID is missing' });
  }

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    // Remove the subcategory from the category
    category.subCategories = category.subCategories.filter(
      (subCategory) => subCategory._id.toString() !== subCategoryId
    );

    await category.save();
    res.status(200).json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
