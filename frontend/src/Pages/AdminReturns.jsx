import React, { useState, useEffect } from 'react';
import './AdminReturns.css';
import Sidebar from '../Components/Sidebar/Sidebar';
import { FaCheck } from "react-icons/fa";
import { ThreeDots } from 'react-loader-spinner';

const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setErrorMessage('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:4000/api/return/returns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch returns');
        }

        const data = await response.json();
        setReturns(data.returns);
      } catch (error) {
        setErrorMessage('Error fetching returns: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, []);

  const handleStatusChange = async (returnId) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setErrorMessage('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/return/returns/${returnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update return status');
      }

      const updatedReturn = await response.json();
      setReturns(returns.map(returnRequest => 
        returnRequest._id === returnId ? updatedReturn : returnRequest
      ));
    } catch (error) {
      setErrorMessage('Error updating return status: ' + error.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-container">
        <h1 className="admin-title">ADMIN - RETURNS MANAGEMENT</h1>
      
        
        {loading ? (
          <div className="loading-container">
            <ThreeDots color="#0047FF" height={50} width={50} />
          </div>
        ) : (
          <>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product ID</th>
                    <th>Reason</th>
                    <th>Condition</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((returnRequest) => (
                    <tr key={returnRequest._id}>
                      <td>{returnRequest.orderId}</td>
                      <td>{returnRequest.productId}</td>
                      <td>{returnRequest.reason}</td>
                      <td>{returnRequest.condition}</td>
                      <td className={getStatusClass(returnRequest.status)}>
                        {returnRequest.status}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                            className="status-select"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <button 
                            onClick={() => handleStatusChange(returnRequest._id)}
                            className="action-button"
                          >
                            <FaCheck />
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
    </div>
  );
};

export default AdminReturns;