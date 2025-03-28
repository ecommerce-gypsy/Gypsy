const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../../models/ProductS'); // Assuming your Product model is located here
const router = express.Router();  // <-- Initialize the router here

// Multer Storage Configuration for Image Uploads
const storage = multer.diskStorage({
  destination: './upload/images', // Directory to store uploaded images
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName); // Save with unique filename
  }
});

// Initialize Multer with the storage settings
const upload = multer({ storage: storage });

// Serve Static Files (Images)
router.use('/images', express.static('upload/images'));

// Upload Endpoint: Handle Multiple Image Uploads
router.post("/upload", upload.array('image', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: 0, message: 'No files uploaded' });
  }

  const imageUrls = req.files.map(file => `http://localhost:${port}/images/${file.filename}`);
  res.json({
    success: 1,
    image_urls: imageUrls,
  });
});

// Get All Products (with first image)
router.get('/allproducts', async (req, res) => {
  try {
    let products = await Product.find({});

    // Add firstImage dynamically for each product
    products = products.map(product => ({
      ...product._doc, // Spread the original product object
      firstImage: product.images && product.images.length > 0 ? product.images[0] : null,
    }));

    console.log('All Products fetched');
    res.json({ success: true, products: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
  }
});

// Update Product Endpoint (with Strand Field)
router.post('/updateproduct', async (req, res) => {
  try {
    const {
      productid,
      productName,
      old_price,
      new_price,
      category,
      stock,
      images,
      subcategory,
      specifications,
      customization,
      colorOptions,
      length,
      strand,  // Added strand field
    } = req.body;

    // Validate the productid
    if (!productid) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    // Prepare update object
    const updateData = {};

    if (productName) updateData.productName = productName;
    if (old_price) updateData.old_price = old_price;
    if (new_price) updateData.new_price = new_price;
    if (category) updateData.category = category;
    if (stock !== undefined) updateData.stock = stock;
    if (images) updateData.images = images;
    if (subcategory) updateData.subcategory = subcategory;
    if (specifications) updateData.specifications = specifications;
    if (customization !== undefined) updateData.customization = customization;
    if (colorOptions) updateData.colorOptions = colorOptions;
    if (length) updateData.length = length;
    if (strand) updateData.strand = strand;  // Update strand field if provided

    // Find the product by productid and update only the fields provided
    const updatedProduct = await Product.findOneAndUpdate({ productid }, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    console.log('Product updated successfully', updatedProduct);
    res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
  }
});

// Remove Product Endpoint
router.post('/removeproducts', async (req, res) => {
  try {
    await Product.findOneAndDelete({ productid: req.body.productid });
    console.log('Removed');
    res.json({ success: true, productid: req.body.productid });
  } catch (error) {
    console.error('Error removing product:', error);
    res.status(500).json({ success: false, message: 'Error removing product', error: error.message });
  }
});

// Add New Product Endpoint (with Strand and Image Upload)
router.post('/addproductss', upload.array('images', 10), async (req, res) => {
  const products = await Product.find({}).sort({ productid: -1 }).limit(1);
  const productid = products.length > 0 ? parseInt(products[products.length - 1].productid, 10) + 1 : 1;

  const {
    specifications,
    new_price,
    old_price,
    stock,
    category,
    subcategory,
    length,
    productName,
    description,
    customization,
    colorOptions,
    ratings,
    isActive,
    strand,  // Added strand field
  } = req.body;

  const newPrice = Number(new_price);
  const oldPrice = Number(old_price);
  const stockQuantity = Number(stock);

  console.log(req.body);

  try {
    // Handle image files and store URLs
    const imageUrls = req.files ? req.files.map(file => `http://localhost:${port}/images/${file.filename}`) : [];

    const product = new Product({
      productid,
      productName,
      description,
      category,
      subcategory,
      specifications,
      customization,
      colorOptions,
      length,
      old_price: oldPrice,
      new_price: newPrice,
      stock: stockQuantity,
      ratings,
      isActive,
      strand,  // Save strand field
      images: imageUrls,  // Store the image URLs
    });

    console.log(product);

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.log('Error details:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export the router
module.exports = router;
