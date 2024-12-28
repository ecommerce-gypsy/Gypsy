import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../assets/upload_area.png'; // Correct the path here


const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
      name: "",
      image: "",
      category: "anklets",
      new_price: "",
      old_price: ""
  });

  const imageHandler = (e) => {
      setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
      setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  const Add_Product = async () => {
      try {
          // Upload image
          const formData = new FormData();
          formData.append('product', image);

          const uploadResponse = await fetch('http://localhost:4000/upload', {
              method: 'POST',
              body: formData,
          });

          const uploadData = await uploadResponse.json();
          if (!uploadData.success) {
              alert("Failed to upload image");
              return;
          }

          // Add product with image URL
          const product = {
              ...productDetails,
              image: uploadData.image_url,
          };

          const productResponse = await fetch('http://localhost:4000/addproduct', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(product),
          });

          const productData = await productResponse.json();
          if (productData.success) {
              alert("Product added successfully!");
          } else {
              alert("Failed to add product");
          }
      } catch (error) {
          console.error("Error:", error);
          alert("An error occurred while adding the product");
      }
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Product title</p>
        <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type here' />
      </div>
      <div className="addproduct-price">
      <div className="addproduct-itemfield">
        <p>Price</p>
        <input value={productDetails.old_price} onChange={changeHandler}type="text" name="old_price" placeholder='Type here' />
      </div>
      <div className="addproduct-itemfield">
        <p>offer Price</p>
        <input value={productDetails.new_price} onChange={changeHandler}type="text" name="new_price" placeholder='Type here' />
      </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select value={productDetails.category}onChange={changeHandler} name="category" className='add-product-selector'>
        <option value="anklets">ANKLETS</option>
            <option value="neckpieces">NECKPIECES</option>
          
            <option value="bracelets">BRACELETS</option>
        </select>
      </div>
      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
            <img src={ image?URL.createObjectURL(image):upload_area} className='addproduct-thumnail-img' alt=""/>
        </label>
        <input onChange={imageHandler} type="file" name='image' id='file-input' hidden/>
      </div>
      <button onClick={()=>{Add_Product()}} className='addproduct-btn'>ADD</button>
    </div>
  );
};

export default AddProduct;