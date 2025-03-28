const mongoose = require('mongoose');

const ProductS = new mongoose.Schema({
  productid: {  
    type: Number,
    required: true,
  },
  productName: {
    type: String,
   // required: true,
  },
  description: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock quantity cannot be negative'],
  },
  category: {
    type: String,
    enum: ['anklets', 'neckpieces', 'bracelets', 'earrings'],  
    required: true,
  },
  subcategory: {
    type: String,
    enum: ['single-stranded', 'multistranded', 'minimalistic'], 
    required: true,
  },
  specifications: {
    material: {
      type: String,
      enum: ['glass', 'wood', 'acrylic', 'metal beads'],
      required: true,
    },
    beadSize: {
      type: String,
      required: true,
    },
    beadShape: {
      type: String,
      required: true,
    },
    stringingMaterial: {
      type: String,
      enum: ['elastic cord', 'nylon thread', 'wire', 'leather cord'],
      required: true,
    },
    closureType: {
      type: String,
      enum: ['lobster', 'clasp', 'adjustable tie'],
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
  },
  customization: {
    type: Boolean,
    default: false,  
  },
  colorOptions: {
    type: [String], 
    default: [],
  },
  length: {
    type: String,
    enum: ['16', '18', '20'],  // Length options  Chocker 16", Princess 18", Matine 20"
  },
  images: [{
    type: String,  // URL or file path for product images
  }],
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String }
  }],
  isActive: {
    type: Boolean,
    default: true,  // Product availability (active/inactive)
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Products= mongoose.model('ProductS', ProductS);

module.exports = Products;
/*const mongoose = require('mongoose');

const ProductS = new mongoose.Schema({
  productid: {  
    type: Number,
    required: true,
  },
  productName: {
    type: String,
   // required: true,
  },
  description: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock quantity cannot be negative'],
  },
  category: {
    type: String,
    enum: ['anklets', 'neckpieces', 'bracelets', 'rings'],  
    required: true,
  },
  subcategory: {
    type: String,
    enum: ['kids', 'men', 'women'], 
    
  },
  
  specifications: {
    material: {
      type: String,
      enum: ['glass', 'wood', 'acrylic', 'metal beads'],
      required: true,
    },
    beadSize: {
      type: String,
      required: true,
    },
    strand:{
        type: String,
        enum: ['single-stranded', 'multistranded', 'minimalistic'], 
       
    },
    beadShape: {
      type: String,
      required: true,
    },
    stringingMaterial: {
      type: String,
      enum: ['elastic cord', 'nylon thread', 'wire', 'leather cord'],
      required: true,
    },
    closureType: {
      type: String,
      enum: ['lobster', 'clasp', 'adjustable tie'],
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
  },
  customization: {
    type: Boolean,
    default: false,  
  },
  colorOptions: {
    type: [String], 
    default: [],
  },
  length: {
    type: String,
    enum: ['16', '18', '20'],  // Length options  Chocker 16", Princess 18", Matine 20"
  },
  images: [{
    type: String,  // URL or file path for product images
  }],
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String }
  }],
  isActive: {
    type: Boolean,
    default: true,  // Product availability (active/inactive)
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Products= mongoose.model('ProductS', ProductS);

module.exports = Products;
*/