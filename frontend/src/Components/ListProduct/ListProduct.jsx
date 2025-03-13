import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../Assets/cross_icon.png";
import edit from "../Assets/edit.png";  // Assuming you have an edit icon
import Sidebar from "../Sidebar/Sidebar";

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);  // For managing modal visibility
  const [currentProduct, setCurrentProduct] = useState(null); // To store the product being edited
  const [specificationsOpen, setSpecificationsOpen] = useState(false); // For showing specifications
  const [customizationOpen, setCustomizationOpen] = useState(false); // For showing customization

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
    setCurrentProduct({
      ...currentProduct,
      [e.target.name]: e.target.value,
    });
    const { name, value } = e.target;

  // Handle colorOptions as an array
  if (name === "colorOptions") {
    const updatedColorOptions = value ? value.split(',').map(item => item.trim()) : [];
    setCurrentProduct({
      ...currentProduct,
      [name]: updatedColorOptions,
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
      // Log the data to ensure it's correct before sending
      console.log('Update Data:', currentProduct);
  
      const updateData = {};
      for (let key in currentProduct) {
        if (currentProduct[key] !== undefined && currentProduct[key] !== null) {
          updateData[key] = currentProduct[key];
        }
      }
  
      // Ensure the product ID is included
      if (!updateData.productid) {
        updateData.productid = currentProduct.productid;  // Add the 'productid' here if missing
      }
  
      // Check if the data is valid
      if (!updateData.productid || !updateData.productName) {
        console.error('Missing required fields!');
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
                <th>Product</th>
                <th>Title</th>
                <th>Old Price</th>
                <th>New Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Edit</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8">No products available</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={product.firstImage || "placeholder-image-url"}
                        alt={product.productName || product.name}
                        className="product-image"
                      />
                    </td>
                    <td>{product.productName || product.name}</td>
                    <td>₹{product.old_price}</td>
                    <td>₹{product.new_price}</td>
                    <td>{product.category}</td>
                    <td>{product.stock || "Out of stock"}</td>
                    <td>
                      <img
                        onClick={() => openEditModal(product)}
                        className="edit"
                        src={edit}
                        alt="Edit"
                      />
                    </td>
                    <td>
                      <img
                        onClick={() => removeProduct(product.id)}
                        className="remove-icon"
                        src={cross_icon}
                        alt="Remove"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Product</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Basic Fields */}
              <label>
                Title:
                <input
                  type="text"
                  name="productName"
                  value={currentProduct.productName}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Description:
                <input
                  type="text"
                  name="description"
                  value={currentProduct.description}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Old Price:
                <input
                  type="number"
                  name="old_price"
                  value={currentProduct.old_price}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                New Price:
                <input
                  type="number"
                  name="new_price"
                  value={currentProduct.new_price}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Stock:
                <input
                  type="number"
                  name="stock"
                  value={currentProduct.stock}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Category:
                <input
                  type="text"
                  name="category"
                  value={currentProduct.category}
                  onChange={handleInputChange}
                />
              </label>

              {/* Specifications Section */}
              <button type="button" onClick={() => setSpecificationsOpen(!specificationsOpen)}>
                {specificationsOpen ? "Hide Specifications" : "Edit Specifications "}
              </button>
              {specificationsOpen && (
                <>
                  <label>
                    Material:
                    <input
                      type="text"
                      name="specifications.material"
                      value={currentProduct.specifications?.material || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Bead Size:
                    <input
                      type="text"
                      name="specifications.beadSize"
                      value={currentProduct.specifications?.beadSize || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Bead Shape:
                    <input
                      type="text"
                      name="specifications.beadShape"
                      value={currentProduct.specifications?.beadShape || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Stringing Material:
                    <input
                      type="text"
                      name="specifications.stringingMaterial"
                      value={currentProduct.specifications?.stringingMaterial || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Closure Type:
                    <input
                      type="text"
                      name="specifications.closureType"
                      value={currentProduct.specifications?.closureType || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Weight:
                    <input
                      type="text"
                      name="specifications.weight"
                      value={currentProduct.specifications?.weight || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                </>
              )}

              {/* Customization Section */}
              <button type="button" onClick={() => setCustomizationOpen(!customizationOpen)}>
                {customizationOpen ? "Hide Customization" : "Edit Customization "}
              </button>
              {customizationOpen && (
                <>
                  <label>
                    Color Options:
                    <input
                      type="text"
                      name="colorOptions"
                      value={currentProduct.colorOptions?.join(", ")}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Images (URLs):
                    <input
                      type="text"
                      name="images"
                      value={currentProduct.images?.join(", ")}
                      onChange={handleInputChange}
                    />
                  </label>
                </>
              )}

              <div className="modal-actions">
                <button type="button" onClick={updateProduct}>Update</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProduct;
