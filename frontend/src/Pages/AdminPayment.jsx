import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import { Trash2 } from 'lucide-react';
import { ThreeDots } from 'react-loader-spinner';
import Sidebar from '../Components/Sidebar/Sidebar';
import './AdminPayment.css'; // Ensure correct path

const PaymentDetails = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewPayment, setViewPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/api/payments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      setErrorMessage('Error fetching payments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (paymentId) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/api/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }
      const paymentDetails = await response.json();
      setViewPayment(paymentDetails.payment);
    } catch (err) {
      setErrorMessage('Error fetching payment details: ' + err.message);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage('No token found. Please log in.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }

      // Refresh payments list after deletion
      fetchPayments();
    } catch (err) {
      setErrorMessage('Error deleting payment: ' + err.message);
    }
  };

  const closeViewModal = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setViewPayment(null);
    }
  };

  return (
    <div className="payment-layout">
      <Sidebar />
      <div className="payment-container">
        <h1 className="payment-title">Payment Management</h1>
        {loading ? (
          <div className="loading-container">
            <ThreeDots color="#0047FF" height={50} width={50} />
          </div>
        ) : (
          <>
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            <div className="table-container">
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Order ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Date & Time</th> {/* New column for Date & Time */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td>{payment._id}</td>
                      <td>{payment.razorpay_order_id}</td>
                      <td>{payment.user?.email || 'Unknown User'}</td>
                      <td>₹{payment.paymentAmount}</td>
                      <td>{payment.paymentStatus}</td>
                      <td>
                        {/* Format the payment date to a readable string */}
                        {new Date(payment.paymentDate).toLocaleString()}
                      </td>
                      <td>
                        <button className="view-btn" onClick={() => handleViewDetails(payment._id)}>
                          <FaEye className="view-icon" />
                        </button>
                        <Trash2 
                          className="delete-icon" 
                          size={20} 
                          color="red" 
                          onClick={() => handleDeletePayment(payment._id)} 
                          style={{ cursor: 'pointer', marginLeft: '10px' }} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {viewPayment && (
          <div className="modal-overlay" onClick={closeViewModal}>
            <div className="modal-container">
              <div className="modal-header">
                <h2>Payment Details</h2>
                <button className="close-btn" onClick={() => setViewPayment(null)}>X</button>
              </div>
              <div className="modal-body">
                <p><strong>Payment ID:</strong> {viewPayment._id}</p>
                <p><strong>Order ID:</strong> {viewPayment.razorpay_order_id}</p>
                <p><strong>Status:</strong> {viewPayment.paymentStatus}</p>
                <p><strong>Amount:</strong> ₹{viewPayment.paymentAmount}</p>
                <p><strong>Method:</strong> {viewPayment.paymentMethod}</p>
                <p><strong>Date:</strong> {new Date(viewPayment.paymentDate).toLocaleString()}</p>
                
                <h3>User Details:</h3>
                <p><strong>Name:</strong> {viewPayment.user?.name}</p>
                <p><strong>Email:</strong> {viewPayment.user?.email}</p>

                {viewPayment.order && (
                  <>
                    <h3>Order Details:</h3>
                    <p><strong>Order Number:</strong> {viewPayment.order?.orderNumber}</p>
                    <p><strong>Total Amount:</strong> ₹{viewPayment.order?.totalPrice}</p>
                    <p><strong>Status:</strong> {viewPayment.order?.orderStatus}</p>
                    <p><strong>Payment Method:</strong> {viewPayment.order?.paymentMethod}</p>
                    <p><strong>Payment Status:</strong> {viewPayment.order?.paymentStatus}</p>
                    <p><strong>Ordered Date:</strong> {new Date(viewPayment.order?.orderedDate).toLocaleString()}</p>
                    <p><strong>Ordered Time:</strong> {viewPayment.order?.orderedTime}</p>
                    <h4>Shipping Address:</h4>
                    <p>{viewPayment.order?.shippingAddress.name}</p>
                    <p>{viewPayment.order?.shippingAddress.address}, {viewPayment.order?.shippingAddress.city}, {viewPayment.order?.shippingAddress.postalCode}, {viewPayment.order?.shippingAddress.country}</p>

                    <h4>Billing Address:</h4>
                    <p>{viewPayment.order?.billingAddress.name}</p>
                    <p>{viewPayment.order?.billingAddress.address}, {viewPayment.order?.billingAddress.city}, {viewPayment.order?.billingAddress.postalCode}, {viewPayment.order?.billingAddress.country}</p>

                    <ul>
                      <strong>Items:</strong>
                      {viewPayment.order?.items?.map((item, index) => (
                        <li key={index}>{item.productName} - ₹{item.price} x {item.quantity}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="close-btn" onClick={() => setViewPayment(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetails;
