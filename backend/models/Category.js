const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: { type: String, required: true },
  link: { type: String, required: true },
  subCategories: [{ 
    name: { type: String, required: true }, 
    link: { type: String, required: true }
  }],
  // category: { type: String, unique: true } // Consider removing this line if not needed
});

module.exports = mongoose.model('Category', categorySchema);


/*const mongoose = require('mongoose');

const category= new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, 
});

category.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Category = mongoose.model('Category', category);

module.exports = Category;
*/