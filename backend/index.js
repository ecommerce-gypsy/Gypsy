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
const UserCartWishlist = require('./models/UserCartWishlist');
const ProductS = require('./models/ProductS');
const Order = require('./models/Order');


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
  
      const token = jwt.sign({ user: { id: user.id, role: user.role } }, 'secret-ecom', { expiresIn: '1h' });
      await sendSignupMail(req.body.name, req.body.email);
      res.json({ success: true, token });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  });
  const nodemailer = require('nodemailer');

  
// Function to send welcome email
const sendSignupMail = async (name, email) => {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "sornapriyamvathapentagon@gmail.com", // Your email
                pass: "eouh aape mzwd gdcx"    // Your app password (not your email password)
            }
        });

        // Load the HTML template
        const emailTemplate = fs.readFileSync(
            path.join(__dirname, "emailTemplate.html"),
            "utf-8"
        );

        // Replace placeholders in the template
        const customizedTemplate = emailTemplate.replace("{{name}}", name);

        // Set email options
        const mailOptions = {
            from: '"RP" <sornapriyamvathapentagon@gmail.com>',
            to: email,
            subject: "Welcome to Your Store!",
            html: customizedTemplate
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Signup email sent to:", email);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

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

// Get All Products
app.get('/allproductsd', async (req, res) => {
    try {
        let products = await ProductS.find({});
        console.log("All Products fetched");
        res.json({ success: true, products: products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
    }
});
// Get All Product
        // Map over the products to include the first image in the response
app.get('/allproducts', async (req, res) => {
            try {
                let products = await ProductS.find({});
                
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
        const userId = new mongoose.Types.ObjectId(req.user.id);
  
        // Fetch user details from Users collection
        const user = await Users.findById(userId).exec();
  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
  
        // Fetch cart and wishlist data from UserCartWishlist collection
        const userCartWishlist = await UserCartWishlist.findOne({ userid: userId }).exec();
        const orders = await Order.find({ userid: userId }).exec();
        // Prepare response
        const userData = {
            name: user.name,
            email: user.email,
            country: user.country || '',
            addresses: user.addresses || [],
            orders: orders || [],
            cartData: userCartWishlist ? userCartWishlist.items.filter(item => item.isInCart) : [],
            wishlistData: userCartWishlist ? userCartWishlist.items.filter(item => !item.isInCart) : [],
        };
  
        res.json(userData);
  
    } catch (error) {
        console.error("Error fetching account details:", error);
        res.status(500).json({ message: 'Error fetching account details' });
    }
  });

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
};

  app.post('/wishlist/add', async (req, res) => {
    try {
      const { userid, productid } = req.body;
  
      const result = await UserCartWishlist.updateOne(
        { userid },
        {
          $push: {
            items: {
              productid,
              quantity: 0,
              isInCart: false,
            },
          },
        },
        { upsert: true }
      );
  
      res.status(200).json({ success: true, message: 'Product added to wishlist', result });
    } catch (error) {
      console.error('Error adding product to wishlist:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  });
  app.post('/cart/add', async (req, res) => {
    try {
      const { userid, productid, quantity } = req.body;
  
      const result = await UserCartWishlist.updateOne(
        { userid, 'items.productid': productid },
        {
          $set: {
            'items.$.isInCart': true,
            'items.$.quantity': quantity,
          },
        },
        { upsert: true }
      );
  
      res.status(200).json({ success: true, message: 'Product added to cart', result });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  });
  
  // POST Search API endpoint
app.post('/search', async (req, res) => {
    const { query } = req.body;
  
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }
  
    try {
      // Perform a case-insensitive search for products by name
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },     // Search in 'name' field
          { description: { $regex: query, $options: 'i' } }, // Search in 'description' field
          { category: { $regex: query, $options: 'i' } }    // Search in 'category' field
        ]
      });
      
  
      // Return the products as JSON
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/addproductss', async (req, res) => {
    const products = await ProductS.find({}).sort({ productid: -1 }).limit(1);
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
      images
    } = req.body;
  
    // Convert old_price, new_price, and stock to Numbers
    const newPrice = Number(new_price);
    const oldPrice = Number(old_price);
    const stockQuantity = Number(stock);
  
    console.log(req.body);  // Check the incoming request body
  
    try {
      // Create and save the product document
      const product = new ProductS({
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
        images
      });
  console.log(product);
      // Save the product to the database
      await product.save();
      res.json({ success: true, product });
      //res.status(201).json({ message: 'Product added successfully', product });
    } catch (err) {
      console.log('Error details:', err);  // Log detailed error for debugging
      res.status(500).json({ error: err.message });
    }
  });
  //filter
/*
// Filter endpoint using query parameters
app.get('/api/products/filter', async (req, res) => {
    const { subcategory, material, price } = req.query;
  
    // Build the filter query based on the parameters
    const filter = {};
  
    if (subcategory) {
      filter.subcategory = subcategory;
    }
  
    if (material) {
      filter.material = material;
    }
  
    if (price) {
      switch (price) {
        case 'under-99':
          filter.new_price = { $lt: 99 };
          break;
        case 'under-299':
          filter.new_price = { $lt: 299 };
          break;
        case 'over-399':
          filter.new_price = { $gt: 399 };
          break;
        default:
          break;
      }
    }
  
    try {
      const filteredProducts = await Product.find(filter);
      res.json(filteredProducts);
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      res.status(500).json({ message: 'Failed to fetch filtered products' });
    }
  });
 */
  app.get('/api/filter', async (req, res) => {
    const { subcategory, material, price } = req.query;
console.log(req.query);
    // Build the filter query based on the parameters
    const filter = {};

    if (subcategory) {
        filter.subcategory = subcategory;
    }

    if (material

    ) {
        filter['specifications.material'] = material;
    }

    if (price) {
        switch (price) {
            case 'under-99':
                filter.new_price = { $lt: 99 };
                break;
            case 'under-299':
                filter.new_price = { $lt: 299 };
                break;
            case 'over-399':
                filter.new_price = { $gt: 399 };
                break;
            default:
                break;
        }
    }

    console.log('Filter:', filter);  

    try {
        const filteredProducts = await Product.find(filter);
        res.json(filteredProducts);
        console.log("SUccess");
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        res.status(500).json({ message: 'Failed to fetch filtered products' });
    }
});
 
app.post('/cartss/add', authenticateToken, async (req, res) => {
    try {
      const { productid, quantity } = req.body;
      const userid = req.user.id; 
      console.log(userid);
      
      const product = await ProductS.findOne({ productid: productid });
  
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      // Now you have the ObjectId of the product
      const productObjectId = product._id;
  console.log(productObjectId);
      // Proceed to add the product to the cart using the product's ObjectId
      const result = await UserCartWishlist.updateOne(
        { userid },
        {
          $addToSet: { // This ensures that the product is added only once
            items: {
              productid: productObjectId,
              quantity: quantity,
              isInCart: true,
            },
          },
        },
        { upsert: true }
      );
      
  
      res.status(200).json({ success: true, message: 'Product added to cart', result });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  });
  app.delete('/cartss/remove', authenticateToken, async (req, res) => {
    try {
        const { productid } = req.body;  // Get the productid from the request parameters
        const userid = req.user.id;  // The logged-in user's id
        
        console.log(userid, productid);  // Log the user and productid for debugging

        // Find the cart of the user
        const userCart = await UserCartWishlist.findOne({ userid });

        if (!userCart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        const product = await ProductS.findOne({ productid: productid });
  
        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
    
        // Now you have the ObjectId of the product
        const productObjectId = product._id;
    console.log(productObjectId);
        // Find the product in the user's cart and remove it
        const result = await UserCartWishlist.updateOne(
            { userid, "items.productid": productObjectId },  // Match the cart and productid
            {
                $pull: {  // This operation removes the product from the cart
                    items: { productObjectId }
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: 'Product not found in cart' });
        }

        res.status(200).json({ success: true, message: 'Product removed from cart' });

    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});
