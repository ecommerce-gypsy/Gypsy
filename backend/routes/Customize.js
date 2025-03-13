const express = require('express');
const multer = require('multer');
const CustomDesign = require('../models/Custom'); // Your custom design model
const path = require('path');

const router = express.Router();

// Set up multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Destination:', 'upload/images');
    cb(null, 'upload/images'); // Ensure the directory exists
  },
  filename: function (req, file, cb) {
    const uniqueFileName = Date.now() + path.extname(file.originalname);
    console.log('File name:', uniqueFileName);
    cb(null, uniqueFileName); // Ensures unique filenames by adding timestamp
  }
});
const upload = multer({ storage: storage });

// Route to add a new custom design (with an image upload)
router.post('/', upload.single('image'), async (req, res) => {
  console.log('Received POST request for adding custom design');
  
  const { name, description } = req.body;
  console.log('Form data:', { name, description });

  // Check if both name and image are provided
  if (!name || !req.file) {
    console.log('Error: Name or image not provided');
    return res.status(400).json({ message: 'Name and image are required' });
  }

  // Construct the image URL (since the file is stored in the 'upload/images' directory)
  const imageUrl = `http://localhost:4000/images/${req.file.filename}`;
  console.log('Image URL:', imageUrl);

  try {
    const newDesign = new CustomDesign({
      name,
      description,
      image: imageUrl, 
    });

    await newDesign.save();
    console.log('Custom design added:', newDesign);
    res.status(201).json({ message: 'Custom design added successfully', newDesign });
  } catch (error) {
    console.error('Error saving custom design:', error);
    res.status(500).json({ message: 'Error saving custom design', error });
  }
});

// Route to get all custom designs
router.get('/', async (req, res) => {
  console.log('Received GET request for all custom designs');
  
  try {
    const designs = await CustomDesign.find();
    console.log('Fetched designs:', designs);
    res.json(designs);
  } catch (error) {
    console.error('Error fetching custom designs:', error);
    res.status(500).json({ message: 'Error fetching custom designs', error });
  }
});

// Route to update a custom design (with optional image upload)
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  console.log('Received PUT request for updating design ID:', id);
  console.log('Form data:', { name, description });

  let imageUrl = undefined;

  if (req.file) {
    // Construct the image URL for the uploaded file
    imageUrl = `http://localhost:4000/images/${req.file.filename}`;
    console.log('Updated image URL:', imageUrl);
  }

  try {
    const updatedDesign = await CustomDesign.findByIdAndUpdate(
      id,
      { name, description, image: imageUrl }, // Update image if provided
      { new: true }
    );

    if (!updatedDesign) {
      console.log('Error: Design not found');
      return res.status(404).json({ message: 'Design not found' });
    }

    console.log('Custom design updated:', updatedDesign);
    res.json({ message: 'Custom design updated successfully', updatedDesign });
  } catch (error) {
    console.error('Error updating custom design:', error);
    res.status(500).json({ message: 'Error updating custom design', error });
  }
});

// Route to delete a custom design
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Received DELETE request for design ID:', id);

  try {
    const deletedDesign = await CustomDesign.findByIdAndDelete(id);
    
    if (!deletedDesign) {
      console.log('Error: Design not found');
      return res.status(404).json({ message: 'Design not found' });
    }

    console.log('Custom design deleted:', deletedDesign);
    res.json({ message: 'Custom design deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom design:', error);
    res.status(500).json({ message: 'Error deleting custom design', error });
  }
});

module.exports = router;
