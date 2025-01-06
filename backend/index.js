const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());

// Ensure upload directory exists
const dir = './upload/images';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// MongoDB connection
mongoose.connect("mongodb+srv://sornapriyamvatha:%23Priya24@cluster0.ihjp2.mongodb.net/Ecom", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Product Schema
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
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
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    }
});

// User Schema
const Users = mongoose.model("Users", {
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Routes

// Signup
app.post('/signup', async (req, res) => {
    console.log("Incoming signup request:", req.body);

    try {
        if (!req.body.name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({ success: false, message: "User with the same email already exists" });
        }

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const user = new Users({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });

        await user.save();

        const token = jwt.sign({ user: { id: user.id } }, 'secret-ecom');
        res.json({ success: true, token });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: "Validation failed", errors: error.errors });
        }
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

// Login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const token = jwt.sign({ user: { id: user.id } }, 'secret-ecom');
            res.json({ success: true, token, username: user.username }); // Ensure username is included
        } else {
            res.status(400).json({ success: false, message: "Wrong password" });
        }
    } else {
        res.status(400).json({ success: false, message: "Email not found" });
    }
});

app.get('/user-details', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const decoded = jwt.verify(token, 'secret-ecom');
      const user = await Users.findById(decoded.user.id); 
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ username: user.username });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  });
  

// Add Product
app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    if (!req.body.name || !req.body.image || !req.body.category || !req.body.new_price || !req.body.old_price) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });

    try {
        await product.save();
        res.json({ success: true, name: req.body.name });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error saving product", error: error.message });
    }
});

// Remove Product
app.post('/removeproducts', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        console.log("Removed");
        res.json({ success: true, name: req.body.name });
    } catch (error) {
        console.error("Error removing product:", error);
        res.status(500).json({ success: false, message: "Error removing product", error: error.message });
    }
});

// Get All Products
app.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({});
        console.log("All Products fetched");
        res.json({ success: true, products: products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
    }
});

// Multer Storage for Image Uploads
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        const uniqueName = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// Serve Static Files
app.use('/images', express.static('upload/images'));

// Upload Endpoint
app.post("/upload", upload.single('product'), (req, res) => {
    console.log(req.file);
    if (!req.file) {
        return res.status(400).json({ success: 0, message: 'No file uploaded or invalid field name' });
    }
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`,
    });
});
//fetch new products
app.get('/newcollections', async (req, res) => {
    try {
        let products = await Product.find({}); 
        let newcollection = await Product.find({})
    .sort({ createdAt: -1 }) 
    .limit(4);
        console.log("NewCollection fetched");
        res.json(newcollection); 
    } catch (error) {
        console.error("Error fetching new collections:", error);
        res.status(500).json({ success: false, message: "Error fetching new collections", error: error.message });
    }
});

//creating endpoint for popular in bracelet
app.get('/popularbracelet',async(req,res)=>{
    let products = await Product.find({category:"bracelet"});
    let popular_in_bracelet = products.slice(0,4);
    console.log("Popular in Bracelet category");
    res.send(popular_in_bracelet);
})
// Middleware to fetch user from token
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
      return res.status(401).send({ errors: 'Please authenticate using a valid token' });
    }
    try {
      const data = jwt.verify(token, 'secret_ecom');
      req.user = data.user;
      next();
    } catch (error) {
      return res.status(401).send({ errors: 'Please authenticate using a valid token' });
    }
  };
 
app.use(express.json());

// Middleware 
const authenticateToken = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user; // store user info 
    next();
  });
};

// Endpoint to add an item to the user's cart
app.post('/addtocart', authenticateToken, async (req, res) => {
  const { item } = req.body;  
  const userId = req.user._id; 

  try {
    // Find the product by its ID
    const product = await Product.findOne({ id: item.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the user by userId
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the item is already in the cart
    const itemIndex = user.cartData.findIndex(cartItem => cartItem.id === item.id);
    if (itemIndex !== -1) {
      // If item exists, you can update it or prevent duplicates (optional)
      return res.status(400).json({ message: 'Item already in the cart' });
    }

    // Add the item to the user's cartData
    user.cartData.push(item);
    await user.save();

    res.status(200).json({ message: 'Item added to cart', cartData: user.cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to fetch anklet products
app.get('/anklets', async (req, res) => {
    try {
        const anklets = await Product.find({ category: 'anklets' });
        if (anklets.length === 0) {
            return res.status(404).json({ success: false, message: 'No anklets found' });
        }
        res.json({ success: true, data: anklets });
        console.log("Fetching anklets...");
        console.log("Anklets found:", anklets);
    } catch (error) {
        console.error('Error fetching anklets:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch anklets', error: error.message });
    }
    
});
// Route to fetch anklet products
app.get('/bracelets', async (req, res) => {
    try {
        const bracelets = await Product.find({ category: 'bracelets' });
        if (bracelets.length === 0) {
            return res.status(404).json({ success: false, message: 'No bracelets found' });
        }
        res.json({ success: true, data: bracelets });
        console.log("Fetching bracelets...");
        console.log("bracelets found:", bracelets);
    } catch (error) {
        console.error('Error fetching bracelets:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bracelets', error: error.message });
    }
    
});
// Route to fetch anklet products
app.get('/neckpieces', async (req, res) => {
    try {
        const neckpieces = await Product.find({ category: 'neckpieces' });
        if (neckpieces.length === 0) {
            return res.status(404).json({ success: false, message: 'No neckpieces found' });
        }
        res.json({ success: true, data: neckpieces });
        console.log("Fetching neckpieces...");
        console.log("neckpieces found:", neckpieces);
    } catch (error) {
        console.error('Error fetching neckpieces:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch neckpieces', error: error.message });
    }
    
});
// Root Endpoint
app.get("/", (req, res) => {
    res.send("Express App is Running");
});

// Start Server
app.listen(port, (error) => {
    if (!error) {
        console.log("Running on Port", port);
    } else {
        console.log("Error:", error);
    }
});
