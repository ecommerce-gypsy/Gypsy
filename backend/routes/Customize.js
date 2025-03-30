/*const express = require('express');
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

const express = require('express');
const multer = require('multer');
const CustomDesign = require('../models/Custom'); // BeadMaterial model (updated)
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

// Route to add a new bead material (with an image upload)
router.post('/', upload.single('image'), async (req, res) => {
  console.log('Received POST request for adding bead material');
  
  const { name, description, price, priceMultiplier, category, type, size, material } = req.body;
  console.log('Form data:', { name, description, price, priceMultiplier, category, type, size, material });

  // Check if both name, price, and category are provided
  if (!name || !price || !category || !req.file) {
    console.log('Error: Name, price, category, or image not provided');
    return res.status(400).json({ message: 'Name, price, category, and image are required' });
  }

  // Construct the image URL (since the file is stored in the 'upload/images' directory)
  const imageUrl = `http://localhost:4000/images/${req.file.filename}`;
  console.log('Image URL:', imageUrl);

  try {
    const newBeadMaterial = new CustomDesign({
      name,
      description,
      image: imageUrl,
      price,
      priceMultiplier,
      category,
      type,
      size,
      material,
    });

    await newBeadMaterial.save();
    console.log('Bead material added:', newBeadMaterial);
    res.status(201).json({ message: 'Bead material added successfully', newBeadMaterial });
  } catch (error) {
    console.error('Error saving bead material:', error);
    res.status(500).json({ message: 'Error saving bead material', error });
  }
});

// Route to get all bead materials
router.get('/', async (req, res) => {
  console.log('Received GET request for all bead materials');
  
  try {
    const materials = await CustomDesign.find();
    console.log('Fetched materials:', materials);
    res.json(materials);
  } catch (error) {
    console.error('Error fetching bead materials:', error);
    res.status(500).json({ message: 'Error fetching bead materials', error });
  }
});

// Route to update a bead material (with optional image upload)
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, priceMultiplier, category, type, size, material } = req.body;
  
  console.log('Received PUT request for updating bead material ID:', id);
  console.log('Form data:', { name, description, price, priceMultiplier, category, type, size, material });

  let imageUrl = undefined;

  if (req.file) {
    // Construct the image URL for the uploaded file
    imageUrl = `http://localhost:4000/images/${req.file.filename}`;
    console.log('Updated image URL:', imageUrl);
  }

  try {
    const updatedBeadMaterial = await CustomDesign.findByIdAndUpdate(
      id,
      { 
        name,
        description,
        price,
        priceMultiplier,
        category,
        type,
        size,
        material,
        image: imageUrl // Update image if provided
      }, 
      { new: true }
    );

    if (!updatedBeadMaterial) {
      console.log('Error: Bead material not found');
      return res.status(404).json({ message: 'Bead material not found' });
    }

    console.log('Bead material updated:', updatedBeadMaterial);
    res.json({ message: 'Bead material updated successfully', updatedBeadMaterial });
  } catch (error) {
    console.error('Error updating bead material:', error);
    res.status(500).json({ message: 'Error updating bead material', error });
  }
});

// Route to delete a bead material
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Received DELETE request for bead material ID:', id);

  try {
    const deletedBeadMaterial = await CustomDesign.findByIdAndDelete(id);
    
    if (!deletedBeadMaterial) {
      console.log('Error: Bead material not found');
      return res.status(404).json({ message: 'Bead material not found' });
    }

    console.log('Bead material deleted:', deletedBeadMaterial);
    res.json({ message: 'Bead material deleted successfully' });
  } catch (error) {
    console.error('Error deleting bead material:', error);
    res.status(500).json({ message: 'Error deleting bead material', error });
  }
});

module.exports = router;
*/

const express = require('express');
const multer = require('multer');
const CustomDesign = require('../models/Custom'); // BeadMaterial model
const path = require('path');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'upload/images'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Add a new bead material
router.post('/', upload.single('image'), async (req, res) => {
  const { name, description, price, priceMultiplier, category, type, size, material } = req.body;
  if (!name || !price || !category || !req.file) {
    return res.status(400).json({ message: 'Name, price, category, and image are required' });
  }

  const imageUrl = `http://localhost:4000/images/${req.file.filename}`;
  try {
    const newBeadMaterial = new CustomDesign({
      name,
      description,
      image: imageUrl,
      price: parseFloat(price),
      priceMultiplier: priceMultiplier ? parseFloat(priceMultiplier) : 1,
      category: Array.isArray(category) ? category : [category],
      type,
      size,
      material,
    });
    await newBeadMaterial.save();
    res.status(201).json({ message: 'Bead material added successfully', data: newBeadMaterial });
  } catch (error) {
    console.error('Error saving bead material:', error);
    res.status(500).json({ message: 'Error saving bead material', error });
  }
});

// Get all bead materials
router.get('/', async (req, res) => {
  try {
    const materials = await CustomDesign.find();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching bead materials:', error);
    res.status(500).json({ message: 'Error fetching bead materials', error });
  }
});

// Update a bead material
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, priceMultiplier, category, type, size, material } = req.body;
  let imageUrl = req.file ? `http://localhost:4000/images/${req.file.filename}` : undefined;

  try {
    const updatedBeadMaterial = await CustomDesign.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        priceMultiplier: priceMultiplier ? parseFloat(priceMultiplier) : undefined,
        category: category ? (Array.isArray(category) ? category : [category]) : undefined,
        type,
        size,
        material,
        ...(imageUrl && { image: imageUrl })
      },
      { new: true }
    );
    if (!updatedBeadMaterial) {
      return res.status(404).json({ message: 'Bead material not found' });
    }
    res.json({ message: 'Bead material updated successfully', data: updatedBeadMaterial });
  } catch (error) {
    console.error('Error updating bead material:', error);
    res.status(500).json({ message: 'Error updating bead material', error });
  }
});

// Delete a bead material
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBeadMaterial = await CustomDesign.findByIdAndDelete(id);
    if (!deletedBeadMaterial) {
      return res.status(404).json({ message: 'Bead material not found' });
    }
    res.json({ message: 'Bead material deleted successfully' });
  } catch (error) {
    console.error('Error deleting bead material:', error);
    res.status(500).json({ message: 'Error deleting bead material', error });
  }
});

// Get price details for a specific material
router.get('/:id/price-details', async (req, res) => {
  const { id } = req.params;
  try {
    const beadMaterial = await CustomDesign.findById(id);
    if (!beadMaterial) {
      return res.status(404).json({ message: 'Bead material not found' });
    }
    res.json({
      price: beadMaterial.price,
      priceMultiplier: beadMaterial.priceMultiplier
    });
  } catch (error) {
    console.error('Error fetching price details for ID:', id, error);
    res.status(500).json({ message: 'Error fetching price details', error });
  }
});

// Get price details for all materials
router.get('/price-details', async (req, res) => {
  try {
    const materials = await CustomDesign.find({}, '_id price priceMultiplier');
    const priceMap = materials.reduce((acc, material) => {
      acc[material._id] = {
        price: material.price,
        priceMultiplier: material.priceMultiplier || 1
      };
      return acc;
    }, {});
    res.json(priceMap);
  } catch (error) {
    console.error('Error fetching all price details:', error);
    res.status(500).json({ message: 'Error fetching price details', error });
  }
});

module.exports = router;