import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../Assets/cross_icon.png";
//import Sidebar from '../Components/Sidebar/Sidebar'
const ListProduct = () => {
    const [allProducts, setAllProducts] = useState([]);

    // Fetch all products from the API
    const fetchInfo = async () => {
        try {
            const res = await fetch("http://localhost:4000/allproducts");
            const data = await res.json();
            console.log("API Data:", data);
            setAllProducts(data.products); // Ensure correct key is used
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
            await fetchInfo(); // Refresh products after deletion
        } catch (error) {
            console.error("Error removing product:", error);
        }
    };

    useEffect(() => {
        fetchInfo(); // Fetch products on component mount
    }, []);

    return (
        <div className="list-product">
            
            <h1>All Product List</h1>
            <div className="listproduct-format-main">
                <p>Product</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>New Price</p>
                <p>Category</p>
                <p>Remove</p>
            </div>
            <div className="listproduct-all-product">
                <hr />
                {allProducts.length === 0 ? (
                    <p>No products available</p>
                ) : (
                    allProducts.map((product) => (
                        <div
                            key={product.id}
                            className="listproduct-format-main listproduct-format"
                        >
                            <img
                                src={product.firstImage || "placeholder-image-url"}
                                alt={product.name}
                                className="listproduct-product-icon"
                            />
                            <p>{product.name}</p>
                            <p>₹{product.old_price}</p>
                            <p>₹{product.new_price}</p>
                            <p>{product.category}</p>
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
