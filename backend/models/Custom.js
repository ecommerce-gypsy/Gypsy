const mongoose = require('mongoose');
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
