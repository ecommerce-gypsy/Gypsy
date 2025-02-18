import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../Assets/cross_icon.png";
import Sidebar from "../Sidebar/Sidebar";

const ListProduct = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

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

    useEffect(() => {
        fetchInfo();
    }, []);

    return (
        <div className="main-container">
            <Sidebar />

            <div className="list-product-content">
                {/* New Styled Heading */}
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
                                <th>Remove</th>
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
        </div>
    );
};

export default ListProduct;
