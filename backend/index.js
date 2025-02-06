const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
//const userRoutes = require('../routes/userRoutes');
const bcrypt = require("bcryptjs");
const UserCartWishlist = require('./models/UserCartWishlist');
const Product = require('./models/ProductS');
const Category = require('./models/Category');
const Order = require('./models/Order');
const Users = require('./models/Users');
app.use(express.json());
app.use(cors());
// In your backend (Express setup)
const adminOrderRoutes = require('./routes/admin/ordersa'); // Assuming your route is in this file
app.use('/admin/orders', adminOrderRoutes);
const salesReportRouter = require('./routes/admin/report'); 
app.use('/report', salesReportRouter);


const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);  
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
    const lastUser = await Users.findOne().sort({ userid: -1 });
    const newUserId = lastUser ? lastUser.userid + 1 : 1;

    const user = new Users({
      userid: newUserId,
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ user: { id: user.id, role: user.role, user_email: user.email } }, 'secret-ecom', { expiresIn: '1h' });

    await sendSignupMail(req.body.name, req.body.email);

    res.json({ 
      success: true, 
      token, 
      username: user.name,  // Add username (name)
      email: user.email,    // Add email
      redirectUrl: '/' // Optional redirect URL based on user role or preference
    });
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
const sendConfirmationEmail = (orderData, userEmail) => {
  // Read the HTML template file
  const templatePath = path.join(__dirname, "orderMail.html");
  let emailTemplate = fs.readFileSync(templatePath, "utf-8");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sornapriyamvathapentagon@gmail.com", // Your email
        pass: "eouh aape mzwd gdcx"    // Your app password (not your email password)
    }
});
  // Replace placeholders in the template with order data
  let orderDetails = "";
  orderData.items.forEach(item => {
    orderDetails += `<p>${item.quantity} x ${item.productid} - ₹${item.price}</p>`;
  });

  const emailContent = emailTemplate
    .replace("{{name}}", orderData.shippingAddress.name)
    .replace("{{order_details}}", orderDetails)
    .replace("{{total_price}}", orderData.totalPrice)
    .replace("{{shipping_address}}", `${orderData.shippingAddress.name}<br>${orderData.shippingAddress.address}<br>${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}<br>${orderData.shippingAddress.country}`)
    .replace("{{payment_method}}", orderData.paymentMethod);

  const mailOptions = {
    from: 'sornapriyamvathapentagon@gmail.com',
    to: userEmail,  // The user's email address
    subject: 'Order Confirmation',
    html: emailContent,  // HTML content
  };

  return transporter.sendMail(mailOptions);
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
                    redirectUrl, 
                    email:user.email // This field will be used by the frontend to determine where to redirect
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
        let products = await Product.find({});
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


//creating endpoint for popular in bracelet
app.get('/popularbracelet',async(req,res)=>{
    let products = await Product.find({category:"bracelet"});
    let popular_in_bracelet = products.slice(0,4);
    console.log("Popular in Bracelet category");
    res.send(popular_in_bracelet);
})

 
app.use(express.json());

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
        const updatedBracelets = bracelets.map((product) => {
          if (product.stock === 0) {
            product.outOfStock = true; 
           // console.log(product.productName); 
          } else {
            product.outOfStock = false;
          }
          return product;
        });
       
        res.json({ success: true, data: updatedBracelets });
        console.log("Fetching bracelets...");
        console.log("bracelets found:", updatedBracelets);
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
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/addproductss', async (req, res) => {
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
      images
    } = req.body;
  
    // Convert old_price, new_price, and stock to Numbers
    const newPrice = Number(new_price);
    const oldPrice = Number(old_price);
    const stockQuantity = Number(stock);
  
    console.log(req.body);  // Check the incoming request body
  
    try {
      // Create and save the product document
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
      const { productid, quantity,productName,new_price ,images} = req.body;
      const userid = req.user.id; 
      console.log(userid);
      
      const product = await Product.findOne({ productid: productid });
  
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      const result = await UserCartWishlist.updateOne(
        { userid },
        {
          $addToSet: { // This ensures that the product is added only once
            items: {
              productid: productid,
              productName: productName,  // Store productName
              new_price: new_price,  
              quantity: quantity,
              images:images,
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

  
app.post('/checkouts', authenticateToken, async (req, res) => {
    try {
      console.log("Checkout endpoint hit"); 
  
      const { items, shippingInfo, paymentMethod } = req.body;
      console.log("Request body:", { items, shippingInfo, paymentMethod }); 
  
      const userId = req.user.id;
      console.log("Authenticated user ID:", userId); 
  
      
      if (!items || items.length === 0) {
        console.error("Cart is empty"); // Error log
        return res.status(400).json({ success: false, message: 'Cart is empty.' });
      }
  
      // Calculate total price
      const totalPrice = items.reduce((total, item) => {
        console.log(`Calculating item total: ${item.quantity} * ${item.price}`); 
        return total + item.quantity * item.price;
      }, 0);
      console.log("Total price calculated:", totalPrice); 
  
      // Create the order object
      const newOrder = new Order({
        user: userId,
        items,
        shippingInfo,
        paymentMethod,
        total: totalPrice,
        status: 'Pending',
      });
      console.log("Order object created:", newOrder); // Debugging log
  
      // Save the order to the database
      await newOrder.save();
      console.log("Order saved to database"); // Debugging log
  
      // Respond with success
      res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order: newOrder,
      });
      console.log("Response sent to client"); 
  
    } catch (error) {
      console.error('Error creating order:', error); // Error log
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  app.post('/wishlist/add', authenticateToken, async (req, res) => {
    try {
      const { productid, productName, images,new_price } = req.body; 
      const userid = req.user.id; 
      console.log(productid);
      console.log("UserID:",userid);
  
      const product = await Product.findOne({ productid: productid });
  
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      const productObjectId = product._id;
      console.log(productObjectId);
  
      const result = await UserCartWishlist.updateOne(
        { userid },
        {
          $addToSet: {  // Ensure product is added only once
            items: {
              productid: productid,
              productName: productName,  // Store productName
              new_price: new_price,  
              images:images,    // Store new_price
              isInCart: false,
            },
          },
        },
        { upsert: true } // If no matching document is found, create a new one
      );
  
      res.status(200).json({ success: true, message: 'Product added to Wishlist', result });
  
    } catch (error) {
      console.error('Error adding product to Wishlist:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  });
  
app.post('/cartss/removes', authenticateToken, async (req, res) => {
  try {
    const { productid } = req.body;
    const userid = req.user.id;
    console.log('User ID:', userid);
    console.log('Product ID:', productid);

    const product = await Product.findOne({ productid: productid });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const productObjectId = product._id;
    console.log('Product ObjectId:', productObjectId);
    const cart = await UserCartWishlist.findOne({ userid });
    console.log('Current Cart:', cart);
    const productInCart = cart.items.find(item => item.productid.toString() === productObjectId.toString() && item.isInCart === true);

    if (!productInCart) {
      return res.status(404).json({ success: false, message: 'Product not found in cart with isInCart: false' });
    }

    const result = await UserCartWishlist.updateOne(
      { 
        userid, 
        'items.productid': productObjectId,
        'items.isInCart': true // Ensure we are removing only if isInCart is false
      },
      {
        $pull: { 
          items: { productid: productObjectId, isInCart: true } // Pull only the one where isInCart is false
        },
      }
    );

    // Check if the product was actually removed
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart or could not be removed',
      });
    }

    res.status(200).json({ success: true, message: 'Product removed from cart', result });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});
app.get('/cart/get', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;  // Get user ID from JWT token
      const cart = await UserCartWishlist.findOne({ userid: userId });
  
      if (!cart) {
        return res.status(404).json({ message: "Wishlist not found." });
      }
  
      // Only return items with isInCart = true
      const itemsInCart = cart.items.filter(item => item.isInCart === true);
      res.json({ items: itemsInCart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching cart." });
    }
  }); 
  app.get('/wishlist/get', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;  // Get user ID from JWT token
      const cart = await UserCartWishlist.findOne({ userid: userId });
  
      if (!cart) {
        return res.status(404).json({ message: "Wishlist not found." });
      }
  
      // Only return items with isInCart = true
      const itemsInCart = cart.items.filter(item => item.isInCart === false);
      res.json({ items: itemsInCart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching cart." });
    }
  }); 
  app.post('/wishlist/remove', authenticateToken, async (req, res) => {
    try {
      const { productid } = req.body;  // Product ID is a number now
      const userid = req.user.id;
      console.log('User ID:', userid);
      console.log('Product ID:', productid);  // Ensure productid is a number
  
      // Find the product by productid
      const product = await Product.findOne({ productid: productid });
  
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      const cart = await UserCartWishlist.findOne({ userid });
      
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found for this user' });
      }
  
      console.log('Current Cart:', cart);
  
      const productInCart = cart.items.find(item => item.productid === productid && item.isInCart === false);
  
      if (!productInCart) {
        return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
      }
  
      const result = await UserCartWishlist.updateOne(
        { 
          userid, 
          'items.productid': productid,
          'items.isInCart': false // Ensure only wishlist items are removed
        },
        {
          $pull: { 
            items: { productid: productid, isInCart: false }
          },
        }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ success: false, message: 'Product not removed from wishlist' });
      }
  
      res.status(200).json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  });
  
  app.post('/cartss/remove', authenticateToken, async (req, res) => {
    try {
      const { productid } = req.body;  // Product ID is a number now
      const userid = req.user.id;
      console.log('User ID:', userid);
      console.log('Product ID:', productid);  // Ensure productid is a number
  
      // Find the product by productid
      const product = await Product.findOne({ productid: productid });
  
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      const cart = await UserCartWishlist.findOne({ userid });
      
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found for this user' });
      }
  
      console.log('Current Cart:', cart);
  
      const productInCart = cart.items.find(item => item.productid === productid && item.isInCart === true);
  
      if (!productInCart) {
        return res.status(404).json({ success: false, message: 'Product not found in Cart' });
      }
  
      const result = await UserCartWishlist.updateOne(
        { 
          userid, 
          'items.productid': productid,
          'items.isInCart': true // Ensure only wishlist items are removed
        },
        {
          $pull: { 
            items: { productid: productid, isInCart: true }
          },
        }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ success: false, message: 'Product not removed from wishlist' });
      }
  
      res.status(200).json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  });
  app.post('/cart/update', authenticateToken, async (req, res) => {
    const { productid, quantity } = req.body;
    try {
      const userId = req.user.id;  
      console.log("User ID:", userId);
      const userCart = await UserCartWishlist.findOne({ userid: userId });
  
      if (!userCart) {
        return res.status(404).json({ message: "User cart not found" });
      }
  
      const cartItem = userCart.items.find(item => item.productid === productid && item.isInCart === true);
  
      if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart with isInCart set to true" });
      }
  
      cartItem.quantity = quantity;
  
      await userCart.save();
      
      res.json({ message: "Cart updated successfully", updatedCart: userCart });
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({ message: "Failed to update cart" });
    }
  });
  app.post("/checkout", authenticateToken, async (req, res) => {
    const { items, shippingAddress, paymentMethod, totalPrice ,userEmail} = req.body;
    const userId = req.user.id; // Assuming the token contains user info
  
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }
  
    if (!shippingAddress || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields." });
    }
  
    try {
      // Create a new order in the database
      const newOrder = new Order({
        userid: userId,
        items,
        shippingAddress,
        paymentMethod,
        totalPrice,
        orderStatus: "Pending", // Initially set as pending
        paymentStatus: "Pending", // Initially set as pending
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newOrder.save();
      await sendConfirmationEmail(newOrder, userEmail);
      // Respond with the order details
      res.status(201).json({
        
        message: "Order created successfully.",
        orderId: newOrder._id,
        orderDetails: newOrder,
      });
    } catch (err) {
      console.error("Error during checkout:", err);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });
  
  // Get all users for admin
  app.get('/admin/users', async (req, res) => {
    try {
      const users = await Users.find(); // Use the `find()` method on the Users model
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: "Error fetching users", error: err.message });
    }
  });
  
  // Update user role for admin
  app.put('/admin/user/:id', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; // New role to update
  
    if (!['user', 'admin', 'vendor'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
  
    try {
      const user = await Users.findByIdAndUpdate(id, { role }, { new: true }); // Update user role
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: "Error updating role", error: err.message });
    }
  });
  
  // Delete user for admin
  app.delete('/admin/user/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await Users.findByIdAndDelete(id); // Delete user by ID
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting user", error: err.message });
    }
  });
  
  const http = require('http');
  const socketIo = require('socket.io');
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",  // Replace with your frontend URL
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });
  io.on('connection', (socket) => {
    console.log('a user connected');
    
    // Optional: You can emit a welcome message to the connected client
    socket.emit('welcome', 'Welcome to the admin dashboard!');
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
  
  app.post('/check', authenticateToken, async (req, res) => {
    try {
      console.log("Checkout endpoint hit");
  
      const { items, shippingInfo, paymentMethod } = req.body;
      console.log("Request body:", { items, shippingInfo, paymentMethod });
  
      const userId = req.user.id;
      console.log("Authenticated user ID:", userId);
  
      if (!items || items.length === 0) {
        console.error("Cart is empty");
        return res.status(400).json({ success: false, message: 'Cart is empty.' });
      }
  
      // Check stock availability
      for (const item of items) {
        const product = await Product.findOne({ productid: item.productid });
  
        if (!product) {
          return res.status(404).json({ success: false, message: `Product with ID ${item.productid} not found.` });
        }
  
        console.log("Fetched Product:", product);
        console.log("Product Name:", product.productName);
  
        if (!product.productName || product.stock === undefined) {
          console.error(`Product validation failed for product ID: ${item.productid}`);
          return res.status(400).json({
            success: false,
            message: `Product with ID ${item.productid} has missing or invalid data.`,
          });
        }
  
        // Check if there is enough stock
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.productName}. Only ${product.stock} left.`,
          });
        }
      }
  
      // Calculate total price
      const totalPrice = items.reduce((total, item) => {
        console.log(`Calculating item total: ${item.quantity} * ${item.price}`);
        return total + item.quantity * item.price;
      }, 0);
      console.log("Total price calculated:", totalPrice);
  
      // Create the order object
      const newOrder = new Order({
        userid: userId,
        items,
        shippingAddress: shippingInfo,
        paymentMethod,
        totalPrice,
        orderStatus: 'Pending',
      });
      console.log("Order object created:", newOrder);
  
      // Save the order to the database
      await newOrder.save();
      console.log("Order saved to database");
  
      // Deduct stock for each ordered item
      for (const item of items) {
        const product = await Product.findOne({ productid: item.productid });
  
        if (!product) {
          return res.status(404).json({ success: false, message: `Product with ID ${item.productid} not found.` });
        }
  
        console.log("Fetched Product Object:", product);
        console.log("Product Name:", product.productName);
  
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.productName}. Only ${product.stock} left.`,
          });
        }
        product.stock -= item.quantity;
        await product.save();
        console.log(`Updated stock for product ${product.productName}: ${product.stock}`);
      }
  
      io.emit('new-order', {
        orderId: newOrder._id,
        totalPrice: newOrder.totalPrice,
        items: newOrder.items,
        status: newOrder.orderStatus
      });
  
      res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order: newOrder,
      });
      console.log("Response sent to client");
  
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
