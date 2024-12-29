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
            res.json({ success: true, token });
        } else {
            res.status(400).json({ success: false, message: "Wrong password" });
        }
    } else {
        res.status(400).json({ success: false, message: "Email not found" });
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
        let products = await Product.find({}); // Fetch all products
        let newcollection = await Product.find({})
    .sort({ createdAt: -1 }) // Sort by 'createdAt' in descending order
    .limit(4);
        console.log("NewCollection fetched");
        res.json(newcollection); // Send the result as JSON
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
//creating middleware to fetch
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
  /*
  // Endpoint to add an item to the cart
  app.post('/addtocart', fetchUser, async (req, res) => {
    try {
      const { item } = req.body;
      if (!item) {
        console.log('No item provided in the request body.');
        return res.status(400).send({ error: 'No item provided' });
      }
  
      console.log('User:', req.user); // Log user details
      console.log('Item to add:', item); // Log the item details
  
      // Simulate saving the item (replace with DB logic)
      return res.status(200).send({ success: 'Item added to cart', item });
    } catch (error) {
      console.error('Error in /addtocart:', error.message);
      res.status(500).send({ error: 'Server Error' });
    }
  });
  */
 // Endpoint to add an item to the cart
// Add Item to Cart (Updates cartData in User)
app.post("/addtocart", fetchUser, async (req, res) => {
    try {
        const { item } = req.body;
        if (!item) return res.status(400).json({ error: "No item provided" });

        // Find the user
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Update the cartData with the new item
        const updatedCart = { ...user.cartData, [item.id]: (user.cartData[item.id] || 0) + 1 }; // Increment item quantity
        user.cartData = updatedCart;

        await user.save();
        res.json({ success: "Item added to cart", cartData: user.cartData });
    } catch (error) {
        console.error("Error adding to cart:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Fetch Cart Data
app.get("/fetchcart", fetchUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ success: true, cartData: user.cartData });
    } catch (error) {
        console.error("Error fetching cart:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Remove Item from Cart (Updates cartData in User)
app.delete("/removefromcart", fetchUser, async (req, res) => {
    try {
        const { itemId } = req.body;
        if (!itemId) return res.status(400).json({ error: "No item ID provided" });

        // Find the user
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Remove or decrement the item quantity
        const updatedCart = { ...user.cartData };
        if (updatedCart[itemId]) {
            updatedCart[itemId] -= 1; // Decrement quantity
            if (updatedCart[itemId] <= 0) {
                delete updatedCart[itemId]; // Remove item if quantity is 0 or less
            }
        } else {
            return res.status(400).json({ error: "Item not found in cart" });
        }

        user.cartData = updatedCart;
        await user.save();

        res.json({ success: "Item removed from cart", cartData: user.cartData });
    } catch (error) {
        console.error("Error removing from cart:", error.message);
        res.status(500).json({ error: "Server error" });
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
