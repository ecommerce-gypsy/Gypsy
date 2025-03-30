/*const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customDesignSchema = new Schema({
  name: {
    type: String,
    required: true,  
  },
  image: {
    type: String,
    required: true,  
  },
  description: {
    type: String,
    required: false,  
  },
  createdAt: {
    type: Date,
    default: Date.now,  
  },
});

const CustomDesign = mongoose.model('CustomDesign', customDesignSchema);

module.exports = CustomDesign;
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customDesignSchema = new Schema({
  name: {
    type: String,
    required: true,  // Name of the bead material (e.g., "Ruby", "Wooden Bead")
  },
  image: {
    type: String,
    required: true,  // URL to the image of the bead material
  },
  description: {
    type: String,
    required: false,  // Optional description of the bead material
  },
  price: {
    type: Number,
    required: true,  // Base price for the bead material
  },
  priceMultiplier: {
    type: Number,
    default: 1,  // Optional price multiplier for adjusting the cost based on material type
  },
  category: {
    type: [String],  // Now it's an array of strings to support multiple categories
    required: true,  // Categories such as "Beads", "Pendants", "Charms", "Closures", "Strings"
    enum: ['Beads', 'Pendants', 'Charms', 'Closures', 'Strings', 'Dollar'],  // You can define all possible categories here
  },
  type: {
    type: String,
    required: false,  // Optional: Specific type for the category (e.g., for pendants it might be "Heart", "Circle", etc.)
  },
  size: {
    type: String,
    required: false,  // Optional: Size for specific categories (e.g., for closures, "Small", "Medium", "Large")
  },
  material: {
    type: String,
    required: false,  // Optional: Specific material type for a category (e.g., "Silver", "Gold" for Pendants)
  },
  createdAt: {
    type: Date,
    default: Date.now,  // Timestamp of when the bead material was added
  },
});

const CustomDesign = mongoose.model('CustomDesign', customDesignSchema);

module.exports = CustomDesign;
