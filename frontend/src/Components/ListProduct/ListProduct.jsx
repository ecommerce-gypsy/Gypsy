import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../Assets/cross_icon.png";


const ListProduct = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]); // List of unique categories
    const [selectedCategory, setSelectedCategory] = useState(""); // state for selected category

    // Fetch all products from the API
    const fetchInfo = async () => {
        try {
            const res = await fetch("http://localhost:4000/allproducts");
            const data = await res.json();
            console.log("API Data:", data);
            setAllProducts(data.products);
            setFilteredProducts(data.products); // Initially, show all products

            // Extract unique categories from the products
            const uniqueCategories = [
                ...new Set(data.products.map((product) => product.category)),
            ];
            setCategories(uniqueCategories); // Set the categories state
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Remove a product and refresh the list
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
            fetchInfo(); // Refresh products after deletion
        } catch (error) {
            console.error("Error removing product:", error);
        }
    };

    // Filter products by category
    const filterByCategory = (category) => {
        setSelectedCategory(category);
        if (category === "All") {
            setFilteredProducts(allProducts);
        } else {
            setFilteredProducts(
                allProducts.filter((product) => product.category === category)
            );
        }
    };

    useEffect(() => {
        fetchInfo(); // Fetch products on component mount
    }, []);

    return (
        
        <div className="list-product">
            <h1>All Product List</h1>

            {/* Dropdown for Category Filter */}
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

            <div className="listproduct-format-main">
                <p>Product</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>New Price</p>
                <p>Category</p>
                <p>Description</p>
                <p>Stock</p>
                <p>Remove</p>
            </div>

            <div className="listproduct-all-product">
        
                <hr />
                {filteredProducts.length === 0 ? (
                    <p>No products available</p>
                ) : (
                    filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="listproduct-format-main listproduct-format"
                        >
                            <img
                                src={product.firstImage || "placeholder-image-url"}
                                alt={product.productName || product.name}
                                className="listproduct-product-icon"
                            />
                            <p>{product.productName || product.name}</p>
                            <p>₹{product.old_price}</p>
                            <p>₹{product.new_price}</p>
                            <p>{product.category}</p>
                            <p>{product.description || "No description available"}</p>
                            <p>{product.stock || "Out of stock"}</p>
                            <img
                                onClick={() => removeProduct(product.id)}
                                className="listproduct-remove-icon"
                                src={cross_icon}
                                alt="Remove"
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ListProduct;
