
import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../assets/cross_icon.png";

const ListProduct = () => {
    const [all_product, setAllProduct] = useState([]);

    const fetchInfo = async () => {
        try {
            const res = await fetch("http://localhost:4000/allproducts"); // Corrected route
            const data = await res.json();
            console.log("API Data:", data);
            setAllProduct(data.products); // Ensure 'products' key is accessed
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchInfo();
    }, []);

    const remove_product = async (id) => {
        await fetch("http://localhost:4000/removeproducts", { // Corrected route
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        });
        await fetchInfo(); // Refresh products after deletion
    };

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
            <div className="listproduct-all_product">
                <hr />
                {all_product.length === 0 ? (
                    <p>No products available</p>
                ) : (
                    all_product.map((product) => (
                        <div key={product.id} className="listproduct-format-main listproduct-format">
                            <img
                                src={product.image}
                                alt="Product"
                                className="listproduct-product-icon"
                            />
                            <p>{product.name}</p>
                            <p>${product.old_price}</p>
                            <p>${product.new_price}</p>
                            <p>{product.category}</p>
                            <img
                                onClick={() => remove_product(product.id)}
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

/*import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../assets/cross_icon.png";

const ListProduct = () => {
    const [all_product, setAllProduct] = useState([]);

    const fetchInfo = async () => {
      try {
          const res = await fetch("http://localhost:4000/all_products");
          const data = await res.json();
          console.log("API Data:", data);
          setAllProduct(data);
      } catch (error) {
          console.error("Error fetching products:", error);
      }
  };
  

    useEffect(() => {
        fetchInfo();
    }, []);

    const remove_product = async (id) => {
        await fetch("http://localhost:4000/removeproducts", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        });
        await fetchInfo();
    };

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
            <div className="listproduct-all_product">
                <hr />
                {all_product.length === 0 ? (
                    <p>No products available</p>
                ) : (
                    all_product.map((product) => (
                        <div key={product.id} className="listproduct-format-main listproduct-format">
                            <img
                                src={product.image}
                                alt=""
                                className="listproduct-product-icon"
                            />
                            <p>{product.name}</p>
                            <p>${product.old_price}</p>
                            <p>${product.new_price}</p>
                            <p>{product.category}</p>
                            <img
                                onClick={() => remove_product(product.id)}
                                className="listproduct-remove-icon"
                                src={cross_icon}
                                alt=""
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ListProduct;*/