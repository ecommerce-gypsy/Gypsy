const express = require('express');
const Product = require('../../models/ProductS');
const auth = require('../../middleware/auth');  
const isAdmin = require('../../middleware/isAdmin'); 
const router = express.Router();

// GET all products that are out of stock
router.get('/', auth, isAdmin,  async (req, res) => {
  try {
    const products = await Product.find({ stock: 0 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update product stock (restock a product)
router.put('/:id/restock', auth, isAdmin,   async (req, res) => {
  const { stock } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.stock = stock;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET product details by id
router.get('/:id',   async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// DELETE product
router.delete('/:id',  async (req, res) => {
    try {
        const id = req.params.id; // This will get the id from the URL parameters

        Product.findByIdAndDelete(id)
            .then((deletedProduct) => {
                if (!deletedProduct) {
                    res.status(404).send({ message: 'Product not found' });
                } else {
                    res.status(200).send({ message: 'Product deleted successfully' });
                }
            })
            .catch((err) => {
                res.status(500).send({ message: 'Server error', error: err.message });
            });
    } catch (err) {
        res.status(500).send({ message: 'Server error', error: err.message });
    }
});

   
  
module.exports = router;
