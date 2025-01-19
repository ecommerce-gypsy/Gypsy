const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());

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

// Ensure upload directory exists
const dir = './upload/images';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// MongoDB connection
mongoose.connect("mongodb+srv://sornapriyamvatha:priya@cluster0.7fk6l.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Product Schema
const Users = mongoose.model("Users", {
    userid: {  // Custom unique identifier for the user (if not using MongoDB _id)
        type: Number,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, // Email format validation
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        default: "",  // User address (optional)
    },
    phone_number: {
        type: String,
        default: "",  // Phone number (optional)
    },
    cartData: [{
        //productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },  // Reference to Product schema
        productid: {type: Number},
        quantity: { type: Number, default: 1 },  // Default quantity set to 1
    }],
    wishlistData: [{
       // productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },  // Reference to Product schema
       productid: {type: Number},
    }],
    orders: [{
        orderId: { type: String, required: true },
        products: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },  // Reference to Product schema
            quantity: { type: Number, default: 1 }
        }],
        totalAmount: { type: Number, required: true },
        orderDate: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'shipped', 'delivered', 'canceled'], default: 'pending' }
    }],
    role: {
        type: String,
        enum: ['user', 'admin','vendor'],
        default: 'user',  // Default role is 'user'
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// User Schema
const  Product = mongoose.model("Product", {
    productid: {  // Custom unique identifier for the product (if not using MongoDB _id)
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
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
        enum: ['anklets', 'bracelets', 'neckpieces', 'rings'],  // Categories for filtering
        required: true,
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

// Routes
// Signup Route
app.post('/signup', async (req, res) => {
    try {
      if (!req.body.name) {
        return res.status(400).json({ success: false, message: "Name is required" });
      }
  
      let check = await Users.findOne({ email: req.body.email });
      if (check) {
        return res.status(400).json({ success: false, message: "User with the same email already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const lastUser = await Users.findOne().sort({ userid: -1 }); // Sort by descending userid to get the latest user
      const newUserId = lastUser ? lastUser.userid + 1 : 1;
      const user = new Users({
        userid :newUserId,
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        // Cart and wishlist should be empty on user signup by default
        cartData: [],
        wishlistData: []
      });
  
      await user.save();
  
      const token = jwt.sign({ user: { id: user.userid, role: user.role } }, 'secret-ecom');
      res.json({ success: true, token });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  });
  

// Login
app.post('/login', async (req, res) => {
    try {
        // Find the user by email
        let user = await Users.findOne({ email: req.body.email });
        
        if (user) {
            // Compare the provided password with the stored hashed password
            const passCompare = await bcrypt.compare(req.body.password, user.password);
            
            if (passCompare) {
                // Generate a JWT token and include the user role in the payload
                const token = jwt.sign({ user: { id: user.id, role: user.role } }, 'secret-ecom', { expiresIn: '1h' });

                // Set the redirection URL based on the user role
                let redirectUrl = '';

                if (user.role === 'admin') {
                    redirectUrl = '/admin';  // Admin role redirects to the add product page
                } else if (user.role === 'user') {
                    redirectUrl = '/';  // Regular user redirects to the home page
                } else if (user.role === 'vendor') {
                    redirectUrl = '/anklets';  // Vendor role redirects to the anklets page
                }

                // Respond with the token, username, and the redirection URL
                res.json({
                    success: true,
                    token,
                    username: user.name,
                    redirectUrl,  // This field will be used by the frontend to determine where to redirect
                });
            } else {
                res.status(400).json({ success: false, message: "Wrong password" });
            }
        } else {
            res.status(400).json({ success: false, message: "Email not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
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
app.post("/upload", upload.array('image', 10), (req, res) => {  // Handle multiple images
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: 0, message: 'No files uploaded' });
    }
    
    const imageUrls = req.files.map(file => `http://localhost:${port}/images/${file.filename}`);
    res.json({
        success: 1,
        image_urls: imageUrls,
    });
});
app.use(express.json()); // Add this line if it's missing
// Add Product

app.post('/addproduct', async (req, res) => {
    console.log(req.body); // Log the incoming request body

    try {
        // Get the last product and calculate the next `productid`
        const products = await Product.find({}).sort({ productid: -1 }).limit(1);
        const productid = products.length > 0 ? parseInt(products[products.length - 1].productid, 10) + 1 : 1;

        if (!req.body.name || !req.body.images || !req.body.category || !req.body.new_price || !req.body.old_price) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        console.log(productid); // Log the generated productid for debugging

        // Prepare the product data
        const productData = {
            productid: productid, // Use the correct productid here
            name: req.body.name,
            description: req.body.description,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
            stock: req.body.stock,
            category: req.body.category,
            images: req.body.images,
        };

        // Create a new product instance
        const product = new Product(productData);

        // Save the product to the database
        await product.save();
        res.json({ success: true, name: req.body.name });
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error
            res.status(400).json({
                success: false,
                message: "Duplicate product ID or name exists",
                error: error.message,
            });
        } else {
            // Handle other errors
            res.status(500).json({
                success: false,
                message: "Error saving product",
                error: error.message,
            });
        }
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
/*
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
});*/
// Get All Product
        // Map over the products to include the first image in the response
        app.get('/allproducts', async (req, res) => {
            try {
                let products = await Product.find({});
                
                // Add firstImage dynamically for each product
                products = products.map(product => ({
                    ...product._doc, // Spread the original product object
                    firstImage: product.images && product.images.length > 0 ? product.images[0] : null
                }));
        
                console.log("All Products fetched");
                res.json({ success: true, products: products });
            } catch (error) {
                console.error("Error fetching products:", error);
                res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
            }
        });
        
// Fetch New Products (Limit to 4)
app.get('/newcollections', async (req, res) => {
    try {
        let newcollection = await Product.find({}).sort({ createdAt: -1 }).limit(4);
        res.json(newcollection);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching new collections", error: error.message });
    }
});

// Fetch Products by Category
app.get('/:category', async (req, res) => {
    const category = req.params.category;
    try {
        const products = await Product.find({ category: category });
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: `No products found in category: ${category}` });
        }
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
    }
});
/*
// Fetch Product by ID
app.get("/product/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findOne({ id: parseInt(id) });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
});*/


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
// Middleware for Token Authentication


  app.get('/products/:id', async (req, res) => {
    const { id } = req.params;  // Access 'id' from the URL parameter
    console.log('Received productid:', id);  // Log the received ID

    try {
        // Attempt to search for product by matching the productid (either number or string)
        const product = await Product.findOne({
            $or: [
                { productid: parseInt(id) },  // Search if productid is a number
                { productid: id }             // Search if productid is a string
            ]
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error: " + error.message });
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
// Route to fetch details of a specific anklet
app.get('/anklets/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const anklet = await Product.findById(id);
        if (!anklet) {
            return res.status(404).json({ success: false, message: 'Anklet not found' });
        }
        res.json({ success: true, data: anklet });
        console.log("Fetching anklet details...");
        console.log("Anklet found:", anklet);
    } catch (error) {
        console.error('Error fetching anklet details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch anklet details', error: error.message });
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
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Get token from the Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Access Denied, No Token Provided' });
    }

    try {
        const decoded = jwt.verify(token, 'secret-ecom');  // Decode the token
        console.log('Decoded Token:', decoded);  // Log the decoded token to check expiration

        req.user = decoded.user;  // Attach user data to the request object
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid Token' });
    }
};

app.get('/api/account', authenticateToken, async (req, res) => {
    try {
        // Get user details from the database using the user ID from the decoded token
        const user = await Users.findById(req.user.id).populate('cartData.productid').populate('wishlistData.productid').exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prepare the user data to be sent to the frontend
        const userData = {
            name: user.name,
            email: user.email,
            country: user.country || '',  // Ensure fallback value for country
            addresses: user.addresses || [],  // Fallback to empty array if no addresses
            orders: user.orders || [],  // Include orders if present
            cartData: user.cartData.map(item => ({
                productId: item.productId,  // Full product details can be included
                quantity: item.quantity,
            })) || [],  // Fallback to empty array if no cart items
            wishlistData: user.wishlistData.map(item => ({
                productId: item.productId,  // Full product details can be included
            })) || [],  // Fallback to empty array if no wishlist items
        };

        res.json(userData);  // Respond with the user data

    } catch (error) {
        console.error("Error fetching account details:", error);
        res.status(500).json({ message: 'Error fetching account details' });
    }
});/*
const Tok = (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'Access Denied, No Token Provided' });
        }

        const token = authHeader.split(' ')[1]; // Extract the token after "Bearer"
        if (!token) {
            return res.status(401).json({ message: 'Access Denied, Token Missing' });
        }

        // Verify the token
        const decoded = jwt.verify(token, 'secret-ecom');
        console.log('Decoded Token:', decoded); // Debugging: Log decoded token data

        // Check if user data exists in the token
        if (!decoded.user || Object.keys(decoded.user).length === 0) {
            return res.status(403).json({ message: 'Invalid Token: User data missing' });
        }

        // Attach user data to the request object
        req.user = decoded.user;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification error:', error.message || error); // Log the error for debugging

        // Handle token expiration specifically
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Token Expired' });
        }

        return res.status(403).json({ message: 'Invalid Token' });
    }
};const jwt = require('jsonwebtoken');  // Make sure to require jsonwebtoken
*/


const Tok = (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'Access Denied, No Token Provided' });
        }

        const token = authHeader.split(' ')[1];  // Extract the token after "Bearer"
        if (!token) {
            return res.status(401).json({ message: 'Access Denied, Token Missing' });
        }

        // Verify the token
        const decoded = jwt.verify(token, 'secret-ecom');
        console.log('Decoded Token:', decoded);  // Debugging: Log the decoded token data

        // Check if user data exists in the token and ensure the userId is available
        if (!decoded.user || !decoded.user.id) {
            return res.status(403).json({ message: 'Invalid Token: User data or userId missing' });
        }

        // Convert userId to a Number (if needed)
        req.user = {
            ...decoded.user,
            id: Number(decoded.user.id)  // Ensure userId is a Number
        };

        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification error:', error.message || error);  // Log the error for debugging

        // Handle token expiration specifically
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Token Expired' });
        }

        // Handle other errors (Invalid Token)
        return res.status(403).json({ message: 'Invalid Token' });
    }
};app.post('/addwishlist', Tok, async (req, res) => {
    const { productId } = req.body; // Use productId from request body
    const userId = req.user.id;    // Numeric userid from the decoded token

    try {
        // Log incoming request data for debugging
        console.log('Received request:', req.body);

        // Validate productId
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const productIdNumber = Number(productId); // Ensure productId is a number
        if (isNaN(productIdNumber)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        console.log('Searching for product with productid:', productIdNumber);

        // Find the product in the Product collection
        const product = await Product.findOne({ productid: productIdNumber });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        console.log('Found product:', product);

        // Find the user in the Users collection using numeric userid
        const user = await Users.findOne({ userid: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Found user:', user);

        // Check if the product is already in the user's wishlist
        const existingWishlistItem = user.wishlistData.find(
            (wishlistItem) => wishlistItem.productid === productIdNumber
        );

        if (existingWishlistItem) {
            return res.status(400).json({ message: 'Product is already in the wishlist' });
        }

        // Add the product to the user's wishlist
        user.wishlistData.push({ productid: productIdNumber });
        await user.save();

        console.log('Updated wishlist:', user.wishlistData);

        // Respond with success message and updated wishlist
        res.status(200).json({
            message: 'Product added to wishlist',
            wishlistData: user.wishlistData
        });
    } catch (error) {
        console.error('Error occurred:', error.message || error);

        res.status(500).json({
            message: 'Server error',
            error: error.message || error,
        });
    }
});

  // Route to add item to the cart
  app.post('/addtocart', authenticateToken, async (req, res) => {
    const { item } = req.body;
    const userId = req.user.id;  // Use the user ID from the decoded JWT token
  
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
  
      // Check if the item is already in the user's cart
      const existingCartItem = user.cartData.find(cartItem => cartItem.productId.toString() === product._id.toString());
      if (existingCartItem) {
        // Item already exists, update its quantity
        existingCartItem.quantity += item.quantity || 1;
        await user.save();
        return res.status(200).json({ message: 'Item quantity updated', cartData: user.cartData });
      }
  
      // Item is not in the cart, add it
      user.cartData.push({ productId: product._id, quantity: item.quantity || 1 });
      await user.save();
  
      res.status(200).json({ message: 'Item added to cart', cartData: user.cartData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  