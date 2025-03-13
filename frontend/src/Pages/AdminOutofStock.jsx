import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/Sidebar/Sidebar';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { ThreeDots } from 'react-loader-spinner';

const AdminOutOfStock = () => {
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const fetchProducts = async () => {
    let url = 'http://localhost:4000/api/stock'; // Default to fetch all products
    if (statusFilter !== 'all') {
      url = `http://localhost:4000/api/stock`; // Adjust based on your filtering route
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setErrorMessage('Error fetching products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    const updatedProductData = {
      ...editProduct,
      stock: parseInt(editProduct.stock), // Ensure stock is an integer
    };

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setErrorMessage('No token found. Please log in.');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/stock/${editProduct._id}/restock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: updatedProductData.stock }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = await response.json();

      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === updatedProduct._id ? updatedProduct : product
        )
      );

      closeEditModal();
    } catch (err) {
      setErrorMessage('Error updating product: ' + err.message);
    }
  };

  const openEditModal = (product) => {
    setEditProduct({ ...product });
  };

  const closeEditModal = () => {
    setEditProduct(null);
  };

  const handleDeleteProduct = async (id) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/api/stock/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }
    
      // Handle successful deletion
    } catch (err) {
      setErrorMessage(`Error deleting product: ${err.message}`);
    }
    
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-container">
        <h1 className="admin-title">Product Management</h1>
        {loading ? (
          <div className="loading-container">
            <ThreeDots color="#0047FF" height={50} width={50} />
          </div>
        ) : (
          <>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            <div className="status-filter">
              <button onClick={() => setStatusFilter('all')}>All</button>
              <button onClick={() => setStatusFilter('in-stock')}>In Stock</button>
              <button onClick={() => setStatusFilter('out-of-stock')}>Out of Stock</button>
            </div>
            <div className="table-container">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>{product.productName}</td>
                      <td>{product.category}</td>
                      <td>${product.new_price}</td>
                      <td>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn" onClick={() => openEditModal(product)}>
                            <FaEdit className="edit-icon" />
                          </button>
                          <button className="icon-btn" onClick={() => handleDeleteProduct(product._id)}>
                            <FaTrash className="delete-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit Product Stock</h2>
              <button className="close-btn" onClick={closeEditModal}>X</button>
            </div>
            <form>
              <label>Stock Quantity:</label>
              <input
                type="number"
                value={editProduct.stock}
                onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                min="0"
              />
              <div className="modal-buttons">
                <button className="save-btn" type="button" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOutOfStock;
