import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ListProduct.css";
import cross_icon from "../Assets/cross_icon.png";
import edit from "../Assets/edit.png";
import Sidebar from "../Sidebar/Sidebar";

const ListProduct = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [specificationsOpen, setSpecificationsOpen] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);

  const fetchInfo = async () => {
    try {
      const res = await fetch("http://localhost:4000/allproducts");
      const data = await res.json();
      console.log("API Data:", data);
      setAllProducts(data.products);
      setFilteredProducts(data.products);

      const uniqueCategories = [...new Set(data.products.map((product) => product.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const removeProduct = async (id) => {
    try {
      await fetch("http://localhost:4000/removeproducts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      fetchInfo();
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(allProducts.filter((product) => product.category === category));
    }
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('specifications.')) {
      const specField = name.split('.')[1];
      setCurrentProduct({
        ...currentProduct,
        specifications: {
          ...currentProduct.specifications,
          [specField]: value
        }
      });
    } else if (name === "colorOptions") {
      const updatedColorOptions = value ? value.split(",").map((item) => item.trim()) : [];
      setCurrentProduct({
        ...currentProduct,
        [name]: updatedColorOptions,
      });
    } else if (name === "images") {
      const updatedImages = value ? value.split(",").map((item) => item.trim()) : [];
      setCurrentProduct({
        ...currentProduct,
        [name]: updatedImages,
      });
    } else {
      setCurrentProduct({
        ...currentProduct,
        [name]: value,
      });
    }
  };

  const updateProduct = async () => {
    try {
      console.log("Update Data:", currentProduct);

      const updateData = {};
      for (let key in currentProduct) {
        if (currentProduct[key] !== undefined && currentProduct[key] !== null) {
          updateData[key] = currentProduct[key];
        }
      }

      if (!updateData.productid) {
        updateData.productid = currentProduct.productid;
      }

      if (!updateData.productid || !updateData.productName) {
        console.error("Missing required fields!");
        return;
      }

      const res = await fetch("http://localhost:4000/updateproduct", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        console.error("Failed to update product:", res.status);
        const errorData = await res.json();
        console.error("Error details:", errorData);
      } else {
        fetchInfo();
        closeModal();
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div className="main-container">
      <Sidebar />
      <div className="list-product-content">
        <div className="heading-container">
          <div className="heading-box">All Product List</div>
          <button className="add-product-button" onClick={() => navigate("/addproduct")}>
            Add Product
          </button>
        </div>

        <div className="category-filter">
          <label htmlFor="category-select">Filter by Category: </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => filterByCategory(e.target.value)}
          >
            <option value="All">All</option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))
            ) : (
              <option value="">Loading categories...</option>
            )}
          </select>
        </div>

        <div className="table-container">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product Image</th>
                <th>Title</th>
                <th>Old Price</th>
                <th>New Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-products-message">
                    <div className="empty-state">
                      <i className="fas fa-box-open"></i>
                      <p>No products found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-image-container">
                        <img
                          src={product.firstImage || "https://via.placeholder.com/100"}
                          alt={product.productName || product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/100";
                          }}
                        />
                      </div>
                    </td>
                    <td>{product.productName || product.name}</td>
                    <td>₹{product.old_price}</td>
                    <td>₹{product.new_price}</td>
                    <td>{product.category}</td>
                    <td>
                      <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="edit-button"
                        onClick={() => openEditModal(product)}
                      >
                        <img src={edit} alt="Edit" />
                        <span>Edit</span>
                      </button>
                      <button 
                        className="remove-button"
                        onClick={() => removeProduct(product.id)}
                      >
                        <img src={cross_icon} alt="Remove" />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Edit Product Modal */}
        {isModalOpen && currentProduct && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Edit Product: {currentProduct.productName}</h3>
                <button className="close-modal" onClick={closeModal}>
                  &times;
                </button>
              </div>
              
              <div className="modal-body">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="form-section">
                    <h4>Basic Information</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          Product Name*
                          <input
                            type="text"
                            name="productName"
                            value={currentProduct.productName || ""}
                            onChange={handleInputChange}
                            required
                          />
                        </label>
                      </div>
                      <div className="form-group">
                        <label>
                          Category*
                          <select
                            name="category"
                            value={currentProduct.category || ""}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select category</option>
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          Old Price (₹)
                          <input
                            type="number"
                            name="old_price"
                            value={currentProduct.old_price || ""}
                            onChange={handleInputChange}
                          />
                        </label>
                      </div>
                      <div className="form-group">
                        <label>
                          New Price (₹)*
                          <input
                            type="number"
                            name="new_price"
                            value={currentProduct.new_price || ""}
                            onChange={handleInputChange}
                            required
                          />
                        </label>
                      </div>
                      <div className="form-group">
                        <label>
                          Stock Quantity*
                          <input
                            type="number"
                            name="stock"
                            value={currentProduct.stock || ""}
                            onChange={handleInputChange}
                            required
                          />
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        Description
                        <textarea
                          name="description"
                          value={currentProduct.description || ""}
                          onChange={handleInputChange}
                          rows="3"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Specifications Section */}
                  <div className="form-section">
                    <div className="section-header" onClick={() => setSpecificationsOpen(!specificationsOpen)}>
                      <h4>Specifications</h4>
                      <span className="toggle-icon">
                        {specificationsOpen ? '−' : '+'}
                      </span>
                    </div>
                    {specificationsOpen && (
                      <div className="specifications-grid">
                        <div className="form-group">
                          <label>
                            Material
                            <input
                              type="text"
                              name="specifications.material"
                              value={currentProduct.specifications?.material || ""}
                              onChange={handleInputChange}
                            />
                          </label>
                        </div>
                        <div className="form-group">
                          <label>
                            Bead Size
                            <input
                              type="text"
                              name="specifications.beadSize"
                              value={currentProduct.specifications?.beadSize || ""}
                              onChange={handleInputChange}
                            />
                          </label>
                        </div>
                        <div className="form-group">
                          <label>
                            Bead Shape
                            <input
                              type="text"
                              name="specifications.beadShape"
                              value={currentProduct.specifications?.beadShape || ""}
                              onChange={handleInputChange}
                            />
                          </label>
                        </div>
                        <div className="form-group">
                          <label>
                            Stringing Material
                            <input
                              type="text"
                              name="specifications.stringingMaterial"
                              value={currentProduct.specifications?.stringingMaterial || ""}
                              onChange={handleInputChange}
                            />
                          </label>
                        </div>
                        <div className="form-group">
                          <label>
                            Closure Type
                            <input
                              type="text"
                              name="specifications.closureType"
                              value={currentProduct.specifications?.closureType || ""}
                              onChange={handleInputChange}
                            />
                          </label>
                        </div>
                        <div className="form-group">
                          <label>
                            Weight (grams)
                            <input
                              type="text"
                              name="specifications.weight"
                              value={currentProduct.specifications?.weight || ""}
                              onChange={handleInputChange}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customization Section */}
                  <div className="form-section">
                    <div className="section-header" onClick={() => setCustomizationOpen(!customizationOpen)}>
                      <h4>Customization Options</h4>
                      <span className="toggle-icon">
                        {customizationOpen ? '−' : '+'}
                      </span>
                    </div>
                    {customizationOpen && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>
                            Color Options (comma separated)
                            <input
                              type="text"
                              name="colorOptions"
                              value={currentProduct.colorOptions?.join(", ") || ""}
                              onChange={handleInputChange}
                              placeholder="e.g., Gold, Silver, Rose Gold"
                            />
                          </label>
                        </div>
                        <div className="form-group">
                          <label>
                            Image URLs (comma separated)
                            <input
                              type="text"
                              name="images"
                              value={currentProduct.images?.join(", ") || ""}
                              onChange={handleInputChange}
                              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="cancel-button" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="button" className="update-button" onClick={updateProduct}>
                      Update Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListProduct;