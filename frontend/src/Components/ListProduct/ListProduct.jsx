import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../Assets/cross_icon.png";
import Sidebar from "../Sidebar/Sidebar";
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const ListProduct = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [editingProduct, setEditingProduct] = useState(null);

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

    const editProduct = (product) => {
        setEditingProduct({ ...product });
    };

    const closeEditModal = () => {
        setEditingProduct(null);
    };

    const handleChange = (e) => {
        setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch("http://localhost:4000/updateproduct", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editingProduct),
            });
            setEditingProduct(null);
            fetchInfo();
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
                    <select id="category-select" value={selectedCategory} onChange={(e) => filterByCategory(e.target.value)}>
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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7">No products available</td>
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
                                            <button className="edit-btn" onClick={() => editProduct(product)}>
                                                <FaEdit />
                                            </button>
                                            <button className="delete-btn" onClick={() => removeProduct(product.id)}>
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {editingProduct && (
                    <div className="modal-overlay">
                        <div className="modal-container">
                            <div className="modal-header">
                                <h2>Edit Product</h2>
                                <button className="close-btn" onClick={closeEditModal}>
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <label>Title:</label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={editingProduct.productName}
                                    onChange={handleChange}
                                    required
                                />
                                <label>Old Price:</label>
                                <input
                                    type="text"
                                    name="old_price"
                                    value={editingProduct.old_price}
                                    onChange={handleChange}
                                    required
                                />
                                <label>New Price:</label>
                                <input
                                    type="text"
                                    name="new_price"
                                    value={editingProduct.new_price}
                                    onChange={handleChange}
                                    required
                                />
                                <label>Category:</label>
                                <select
                                    name="category"
                                    value={editingProduct.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Anklets">Anklets</option>
                                    <option value="Bracelets">Bracelets</option>
                                    <option value="Neckpieces">Neckpieces</option>
                                </select>
                                <label>Stock:</label>
                                <input
                                    type="text"
                                    name="stock"
                                    value={editingProduct.stock}
                                    onChange={handleChange}
                                    required
                                />

                                <div className="modal-buttons">
                                    <button className="save-btn" type="submit">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListProduct;
