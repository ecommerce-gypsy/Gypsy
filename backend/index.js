const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require('bcryptjs');

//DATABASE
const UserCartWishlist = require('./models/UserCartWishlist');
const Product = require('./models/ProductS');
const Category = require('./models/Category');
const Order = require('./models/Order');
const Users = require('./models/Users');
app.use(express.json());
app.use(cors());
// ROUTES
const adminOrderRoutes = require('./routes/admin/ordersa'); 
app.use('/admin/orders', adminOrderRoutes);
const salesReportRouter = require('./routes/admin/report'); 
app.use('/report', salesReportRouter);
const payment = require('./routes/payment.js');
app.use('/api/payment', payment);
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);  
const addressRoutes = require('./routes/updateAddress');
app.use('/api/address', addressRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);
const wishlistRoutes = require('./routes/wishlistRoutes');
app.use('/api/wishlist', wishlistRoutes);

const review = require('./routes/admin/review');
app.use('/api/review', review);

const customDesignsRoutes = require('./routes/Customize');
app.use('/api/custom-designs', customDesignsRoutes); 

const orderRoutes = require('./routes/admin/sales');
app.use('/api/sales', orderRoutes);

const stock = require('./routes/admin/stock');
app.use('/api/stock', stock);

const dashboard = require('./routes/dashboard');
app.use('/api/dashboard', dashboard);

const category = require('./routes/Category');
app.use('/api/categories', category);

const paydetails = require('./routes/admin/paydetails');
app.use('/api/payments', paydetails);

const categories = require('./routes/Category');
app.use('/api/categories ', categories );

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
  app.get('/bracelets', async (req, res) => {
    try {
      const bracelets = await Product.find({ category: 'bracelets' });
  
      if (bracelets.length === 0) {
        return res.status(404).json({ success: false, message: 'No bracelets found' });
      }
  
      const updatedBracelets = bracelets.map((product) => {
      
        if (product.stock === 0) {
          product.outOfStock = true;
          product.lowStock = false; 
        } else {
          product.outOfStock = false; 
          product.lowStock = product.stock <= 5;
        }
  
        // Log to verify the flags
        console.log(`Product: ${product.productName}, outOfStock: ${product.outOfStock}, lowStock: ${product.lowStock}`);
  
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

        console.log(productid); 
        const productData = {
            productid: productid, // productid int
            name: req.body.name,
            description: req.body.description,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
            stock: req.body.stock,
            category: req.body.category,
            images: req.body.images,
        };

        
        const product = new Product(productData);

        
        await product.save();
        res.json({ success: true, name: req.body.name });
    } catch (error) {
        if (error.code === 11000) {
           
            res.status(400).json({
                success: false,
                message: "Duplicate product ID or name exists",
                error: error.message,
            });
        } else {
            
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

        app.post('/updateproduct', async (req, res) => {
          try {
            const { productid, productName, old_price, new_price, category, stock, images, subcategory, specifications, customization, colorOptions, length } = req.body;
        
            // Validate the productid
            if (!productid) {
              return res.status(400).json({ success: false, message: "Product ID is required." });
            }
        
            // Prepare update object
            const updateData = {};
        
            if (productName) updateData.productName = productName;
            if (old_price) updateData.old_price = old_price;
            if (new_price) updateData.new_price = new_price;
            if (category) updateData.category = category;
            if (stock !== undefined) updateData.stock = stock;
            if (images) updateData.images = images;
            if (subcategory) updateData.subcategory = subcategory;
            if (specifications) updateData.specifications = specifications;
            if (customization !== undefined) updateData.customization = customization;
            if (colorOptions) updateData.colorOptions = colorOptions;
            if (length) updateData.length = length;
        
            // Find the product by productid and update only the fields provided
            const updatedProduct = await Product.findOneAndUpdate({ productid }, updateData, { new: true });
        
            if (!updatedProduct) {
              return res.status(404).json({ success: false, message: "Product not found." });
            }
        
            console.log("Product updated successfully", updatedProduct);
            res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
          } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ success: false, message: "Error updating product", error: error.message });
          }
        });
        
        app.post('/subscribe-newsletter', async (req, res) => {
          const { email } = req.body; // Get the email from the request body
        
          try {
            // Find the user by email
            const user = await Users.findOne({ email });
        
            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }
        
            // If the user is already subscribed, send a message
            if (user.newsletterSubscribed) {
              return res.status(400).json({ message: 'User is already subscribed to the newsletter' });
            }
        
            // Update the user's subscription status
            user.newsletterSubscribed = true;
            user.newsletterSubscriptionDate = Date.now(); // Store the subscription date
            await user.save();
        
            return res.status(200).json({ message: 'Subscribed to the newsletter successfully!' });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error', error });
          }
        });

        
        
//  New Products (Limit to 4)
app.get('/newcollections', async (req, res) => {
    try {
        let newcollection = await Product.find({}).sort({ createdAt: -1 }).limit(4);
        res.json(newcollection);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching new collections", error: error.message });
    }
});


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

 


  app.get('/products/:id', async (req, res) => {
    const { id } = req.params;  
    console.log('Received productid:', id);  

    try {
       
        const product = await Product.findOne({
            $or: [
                { productid: parseInt(id) },  
                { productid: id }            
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
// Route to fetch anklet products
app.get('/earrings', async (req, res) => {
  try {
      const earrings = await Product.find({ category: 'earrings' });
      if (earrings.length === 0) {
          return res.status(404).json({ success: false, message: 'No earrings found' });
      }
      res.json({ success: true, data: earrings });
      console.log("Fetching earrings...");
      console.log("earrings found:", earrings);
  } catch (error) {
      console.error('Error fetching earrings:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch earrings', error: error.message });
  }
  
});
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

app.get('/orderscon/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id)
      .populate('userid', 'name email')
      .populate('customDesign', 'name email');
  console.log(order);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
});

const Tok = (req, res, next) => {
    try {
       
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'Access Denied, No Token Provided' });
        }

        const token = authHeader.split(' ')[1];  
        if (!token) {
            return res.status(401).json({ message: 'Access Denied, Token Missing' });
        }

        // Verify the token
        const decoded = jwt.verify(token, 'secret-ecom');
        console.log('Decoded Token:', decoded);  

        
        if (!decoded.user || !decoded.user.id) {
            return res.status(403).json({ message: 'Invalid Token: User data or userId missing' });
        }

       
        req.user = {
            ...decoded.user,
            id: Number(decoded.user.id)  
        };

        next();  
    } catch (error) {
        console.error('Token verification error:', error.message || error);  

        
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Token Expired' });
        }

        
        return res.status(403).json({ message: 'Invalid Token' });
    }
};

app.post('/search', async (req, res) => {
    const { query } = req.body;
  
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }
  
    try {
     
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },    
          { description: { $regex: query, $options: 'i' } }, 
          { category: { $regex: query, $options: 'i' } }    
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
  
   
    const newPrice = Number(new_price);
    const oldPrice = Number(old_price);
    const stockQuantity = Number(stock);
  
    console.log(req.body); 
  
    try {
    
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
      
      await product.save();
      res.json({ success: true, product });
      //res.status(201).json({ message: 'Product added successfully', product });
    } catch (err) {
      console.log('Error details:', err);  
      res.status(500).json({ error: err.message });
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
    size,
    piercingType,
    productName,
    description,
    customization,
    colorOptions,
    ratings,
    isActive,
    images
  } = req.body;

  // Validate required fields
  if (!productName || !description || !new_price || !stock || !category || !subcategory || !images || images.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check for category-specific validations
  if (category === "rings" && !size) {
    return res.status(400).json({ error: 'Size is required for rings' });
  }

  if (["neckpieces", "bracelets", "anklets"].includes(category) && !length) {
    return res.status(400).json({ error: 'Length is required for this category' });
  }

  if (category === "earrings" && !piercingType) {
    return res.status(400).json({ error: 'Piercing type is required for earrings' });
  }

  const newPrice = Number(new_price);
  const oldPrice = Number(old_price);
  const stockQuantity = Number(stock);

  console.log(req.body); // Log request data for debugging

  try {
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
      size,  // Ensure size is set for rings
      piercingType, // Ensure piercingType is set for earrings
      old_price: oldPrice,
      new_price: newPrice,
      stock: stockQuantity,
      ratings,
      isActive,
      images
    });

    console.log('Product to be saved:', product); // Log product data for debugging

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.log('Error details:', err);  
    res.status(500).json({ error: err.message });
  }
});

  app.get('/api/filter', async (req, res) => {
    const { subcategory, material, price } = req.query;
console.log(req.query);
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
          $addToSet: { 
            items: {
              productid: productid,
              productName: productName,  
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

  const nodemailer = require('nodemailer');
  const sendConfirmationEmail = (orderData, userEmail) => {
  
    const templatePath = path.join(__dirname, "orderMail.html");
    let emailTemplate = fs.readFileSync(templatePath, "utf-8");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: "sornapriyamvathapentagon@gmail.com", 
          pass: "eouh aape mzwd gdcx"    
      }
  });
   
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
      to: userEmail, 
      subject: 'Order Confirmation',
      html: emailContent,  
    };
  
    return transporter.sendMail(mailOptions);
  };

  app.post("/checknut", authenticateToken, async (req, res) => {
    const { items, shippingAddress, paymentMethod, totalPrice, userEmail } = req.body;
    const userId = req.user.id; 
  
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }
  
    if (!shippingAddress || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields." });
    }
  
    try {
     
      const newOrder = new Order({
        userid: userId,
        items,
        shippingAddress,
        paymentMethod,
        totalPrice,
        orderStatus: "Pending",
        paymentStatus: "Pending", 
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      await newOrder.save();  

      for (const item of items) {
        const product = await Product.findOne({ productid: item.productid });
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.productid} not found.` });
        }
  
        
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Not enough stock for ${item.productName}. Only ${product.stock} items available.`,
          });
        }
  
      
        product.stock -= item.quantity;
        await product.save();
      }
  
      
      const cartWishlist = await UserCartWishlist.findOne({ userid: userId });
      if (cartWishlist) {
        cartWishlist.items = cartWishlist.items.filter(item => item.isInCart === false); 
        await cartWishlist.save(); 
      }
  
     
      await sendConfirmationEmail(newOrder, userEmail);
  
      res.status(201).json({
        message: "Order created successfully and cart cleared.",
        orderId: newOrder._id,
        orderDetails: newOrder,
      });
    } catch (err) {
      console.error("Error during checkout:", err);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });
  
  /*

  app.get('/admin/users', async (req, res) => {
    try {
      const users = await Users.find(); 
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: "Error fetching users", error: err.message });
    }
  });
  
  // Update user role for admin
  app.put('/admin/user/:id', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; 
  
    if (!['user', 'admin', 'vendor'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
  
    try {
      const user = await Users.findByIdAndUpdate(id, { role }, { new: true }); 
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
      const user = await Users.findByIdAndDelete(id); 
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting user", error: err.message });
    }
  }); */
 // Fetch all users with their order count and registration date
app.get('/admin/users', async (req, res) => {
  try {
    // Fetch all users
    const users = await Users.find(); 

    // Fetch order count for each user
    const usersWithOrders = await Promise.all(users.map(async (user) => {
      // Count the number of orders for the user
      const orderCount = await Order.countDocuments({ userid: user._id }); 

      // Add the registration date (createdAt) from the User schema
      const registrationDate = user.createdAt; 

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ordersCount: orderCount, // Include the order count
        registrationDate: registrationDate, // Include registration date
      };
    }));

    res.status(200).json(usersWithOrders);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// Update user role for admin
app.put('/admin/user/:id', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate role input
  if (!['user', 'admin', 'vendor'].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    // Find and update user by id
    const user = await Users.findByIdAndUpdate(id, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ message: "Error updating role", error: err.message });
  }
});

// Delete user for admin
app.delete('/admin/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete user by id
    const user = await Users.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});
  /*
  const http = require('http');
  const socketIo = require('socket.io');
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000", 
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });
  io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.emit('welcome', 'Welcome to the admin dashboard!');
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
*/
  app.post("/checkout", authenticateToken, async (req, res) => {
    const { items, shippingAddress, paymentMethod, totalPrice, userEmail } = req.body;
    const userId = req.user.id;
  
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }
  
    if (!shippingAddress || !paymentMethod || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields." });
    }
  
    try {
      const productDetails = [];
  
      for (const item of items) {
        const product = await Product.findOne({ productid: item.productid });
  
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.productid} not found.` });
        }
  
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Not enough stock for ${product.productName}. Only ${product.stock} available.`,
          });
        }
  
        product.stock -= item.quantity;
        await product.save();
  
        // Ensure images array is not empty
        const productImage = product.images && product.images.length > 0 ? product.images[0] : "hello";
  console.log("PRIMG",productImage );
        productDetails.push({
          productid: product.productid,
          productName: product.productName,
          images: productImage, 
          price: product.new_price,
          quantity: item.quantity,
        });
  
        console.log("Product added to order:", productDetails[productDetails.length - 1]);
      }
  
      const newOrder = new Order({
        userid: userId,
        items: productDetails,
        shippingAddress,
        paymentMethod,
        totalPrice,
        orderStatus: "Pending",
        paymentStatus: "Pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      await newOrder.save();
      console.log("New order saved:", newOrder);
  
      // Clear the cart
      await UserCartWishlist.updateOne(
        { userid: userId },
        { $set: { items: [] } } // Correcting cart clear logic
      );
  
      await sendConfirmationEmail(newOrder, userEmail);
  
      res.status(201).json({
        message: "Order placed successfully and cart cleared.",
        orderId: newOrder._id,
        orderDetails: newOrder,
      });
    } catch (err) {
      console.error("Error during checkout:", err);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.post("/orders/:orderid", authenticateToken, async (req, res) => {
    try {
      const { orderid } = req.params; // Get the order ID from the request URL
      console.log(orderid); // Log the order ID for debugging purposes
  
      // Fetch the order details using the order ID
      const order = await Order.findById(orderid)
        .populate('userid', 'name email') // Populate user info (name, email)
        .populate('customDesign') // Populate custom design information (if available)
        .exec();
  
      // If the order is not found, send a 404 error response
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Return the order details if found
      res.json({ success: true, order });
    } catch (err) {
      // Log any server error and send a 500 error response
      console.error('Error fetching order details:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  