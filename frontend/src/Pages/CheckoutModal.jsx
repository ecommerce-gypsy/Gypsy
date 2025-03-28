import React, { useState, useEffect, useRef } from "react";
import "./CheckoutModal.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CheckoutModal = ({ 
  cart, 
  subtotal, 
  total, 
  handleCheckoutSuccess, 
  onClose = () => console.log("Modal closed") 
}) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: ""
  });
  const [billingAddress, setBillingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [loading, setLoading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [useBillingAsShipping, setUseBillingAsShipping] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const showNotification = (message, type = 'error') => {
    const toastOptions = {
      position: "top-center",
      autoClose: type === 'success' ? 3000 : 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: `custom-toast ${type}`,
    };

    if (type === 'success') {
      toast.success(message, toastOptions);
    } else {
      toast.error(message, toastOptions);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!shippingAddress.name.trim()) {
      errors.shippingName = "Full name is required";
      isValid = false;
    }
    if (!shippingAddress.address.trim()) {
      errors.shippingAddress = "Address is required";
      isValid = false;
    }
    if (!shippingAddress.city.trim()) {
      errors.shippingCity = "City is required";
      isValid = false;
    }
    if (!shippingAddress.postalCode.trim()) {
      errors.shippingPostalCode = "Postal code is required";
      isValid = false;
    }
    if (!shippingAddress.country.trim()) {
      errors.shippingCountry = "Country is required";
      isValid = false;
    }
    if (shippingAddress.phone && !/^\d{10}$/.test(shippingAddress.phone)) {
      errors.shippingPhone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    if (!useBillingAsShipping) {
      if (!billingAddress.name.trim()) {
        errors.billingName = "Full name is required";
        isValid = false;
      }
      if (!billingAddress.address.trim()) {
        errors.billingAddress = "Address is required";
        isValid = false;
      }
      if (!billingAddress.city.trim()) {
        errors.billingCity = "City is required";
        isValid = false;
      }
      if (!billingAddress.postalCode.trim()) {
        errors.billingPostalCode = "Postal code is required";
        isValid = false;
      }
      if (!billingAddress.country.trim()) {
        errors.billingCountry = "Country is required";
        isValid = false;
      }
      if (billingAddress.phone && !/^\d{10}$/.test(billingAddress.phone)) {
        errors.billingPhone = "Please enter a valid 10-digit phone number";
        isValid = false;
      }
    }

    if (!isTermsAccepted) {
      errors.terms = "You must accept the terms and conditions";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      const firstErrorElement = document.querySelector(".error-message");
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      showNotification("Failed to load payment processor. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("auth_token");
      const response = await fetch("http://localhost:4000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          cart,
          shippingAddress,
          billingAddress: useBillingAsShipping ? shippingAddress : billingAddress,
          paymentMethod,
        }),
      });

      const orderData = await response.json();
      if (!response.ok) {
        showNotification(orderData.message || "Failed to create payment order.");
        setLoading(false);
        return;
      }

      const options = {
        key: "rzp_test_vgn6l0o6lKXhrg",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RP Collections",
        description: "Purchase Items",
        order_id: orderData.id,
        handler: async function (paymentResult) {
          const paymentDetails = {
            razorpay_order_id: paymentResult.razorpay_order_id,
            razorpay_payment_id: paymentResult.razorpay_payment_id,
            razorpay_signature: paymentResult.razorpay_signature,
            paymentMethodUsed: paymentResult.method,
            paymentAmount: total,
          };

          const verifyResponse = await fetch("http://localhost:4000/api/payment/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(paymentDetails),
          });

          const verifyResult = await verifyResponse.json();

          if (!verifyResponse.ok) {
            showNotification(verifyResult.message || "Payment verification failed.");
            setLoading(false);
            return;
          }

          const orderToSave = {
            items: cart.map((item) => ({
              productid: item.productid,
              quantity: item.quantity,
              price: item.new_price,
              images: item.images[0],
              productName: item.productName
            })),
            shippingAddress,
            billingAddress: useBillingAsShipping ? shippingAddress : billingAddress, 
            paymentMethod: paymentMethod, 
            totalPrice: total,
            userEmail: localStorage.getItem("user_email"),
            paymentStatus: "Paid",
            razorpay_order_id: paymentResult.razorpay_order_id,
            razorpay_payment_id: paymentResult.razorpay_payment_id,
          };

          const checkoutResponse = await fetch("http://localhost:4000/api/payment/checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(orderToSave),
          });

          const checkoutResult = await checkoutResponse.json();

          if (checkoutResponse.ok) {
            showNotification("Order placed successfully", 'success');
            setTimeout(() => {
              showNotification("Cart has been cleared", 'success');
            }, 1000);
            handleCheckoutSuccess(checkoutResult.message);
            navigate(`/order/${checkoutResult.orderId}`);
          } else {
            showNotification(checkoutResult.message || "Checkout failed.");
          }
          setLoading(false);
        },
        prefill: {
          name: shippingAddress.name,
          email: localStorage.getItem("user_email"),
          contact: shippingAddress.phone
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showNotification("Payment process failed. Please try again.");
      setLoading(false);
    }
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    onClose();
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="custom-toast-container"
        progressClassName="custom-progress"
      />
      <div className="checkout-modal-overlay" onClick={handleClose}>
        <div className="checkout-modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Checkout</h2>
            <button 
              className="close-btn" 
              onClick={handleClose} 
              aria-label="Close checkout modal"
            >
              <span className="close-icon">×</span>
            </button>
          </div>

          <div className="modal-scrollable-content">
            <div className="order-summary">
              <h3>Order Summary</h3>
              <ul>
                {cart.map((item) => (
                  <li key={item.productid}>
                    <span>{item.productName}</span>
                    <span>{item.quantity} × ₹{item.new_price.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="price-summary">
                <div className="price-row">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Delivery Fee:</span>
                  <span>₹99.00</span>
                </div>
                <div className="price-row">
                  <span>Platform Fee:</span>
                  <span>₹19.00</span>
                </div>
                <div className="price-row total-row">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Shipping Information</h3>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                  className={fieldErrors.shippingName ? "error" : ""}
                />
                {fieldErrors.shippingName && (
                  <div className="error-message animate-error">{fieldErrors.shippingName}</div>
                )}
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className={fieldErrors.shippingPhone ? "error" : ""}
                  placeholder="Enter 10-digit phone number"
                />
                {fieldErrors.shippingPhone && (
                  <div className="error-message animate-error">{fieldErrors.shippingPhone}</div>
                )}
              </div>
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  className={fieldErrors.shippingAddress ? "error" : ""}
                />
                {fieldErrors.shippingAddress && (
                  <div className="error-message animate-error">{fieldErrors.shippingAddress}</div>
                )}
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className={fieldErrors.shippingCity ? "error" : ""}
                />
                {fieldErrors.shippingCity && (
                  <div className="error-message animate-error">{fieldErrors.shippingCity}</div>
                )}
              </div>
              <div className="form-group">
                <label>Postal Code *</label>
                <input
                  type="text"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                  className={fieldErrors.shippingPostalCode ? "error" : ""}
                />
                {fieldErrors.shippingPostalCode && (
                  <div className="error-message animate-error">{fieldErrors.shippingPostalCode}</div>
                )}
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className={fieldErrors.shippingCountry ? "error" : ""}
                />
                {fieldErrors.shippingCountry && (
                  <div className="error-message animate-error">{fieldErrors.shippingCountry}</div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Billing Information</h3>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    checked={useBillingAsShipping}
                    onChange={() => setUseBillingAsShipping(true)}
                  />
                  Use Shipping Address as Billing Address
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    checked={!useBillingAsShipping}
                    onChange={() => setUseBillingAsShipping(false)}
                  />
                  Use Different Billing Address
                </label>
              </div>

              {!useBillingAsShipping && (
                <>
                  <div className="form-group">
                    <label>Billing Full Name *</label>
                    <input
                      type="text"
                      value={billingAddress.name}
                      onChange={(e) => setBillingAddress({ ...billingAddress, name: e.target.value })}
                      className={fieldErrors.billingName ? "error" : ""}
                    />
                    {fieldErrors.billingName && (
                      <div className="error-message animate-error">{fieldErrors.billingName}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Billing Phone Number</label>
                    <input
                      type="tel"
                      value={billingAddress.phone}
                      onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                      className={fieldErrors.billingPhone ? "error" : ""}
                      placeholder="Enter 10-digit phone number"
                    />
                    {fieldErrors.billingPhone && (
                      <div className="error-message animate-error">{fieldErrors.billingPhone}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Billing Address *</label>
                    <input
                      type="text"
                      value={billingAddress.address}
                      onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                      className={fieldErrors.billingAddress ? "error" : ""}
                    />
                    {fieldErrors.billingAddress && (
                      <div className="error-message animate-error">{fieldErrors.billingAddress}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Billing City *</label>
                    <input
                      type="text"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                      className={fieldErrors.billingCity ? "error" : ""}
                    />
                    {fieldErrors.billingCity && (
                      <div className="error-message animate-error">{fieldErrors.billingCity}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Billing Postal Code *</label>
                    <input
                      type="text"
                      value={billingAddress.postalCode}
                      onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                      className={fieldErrors.billingPostalCode ? "error" : ""}
                    />
                    {fieldErrors.billingPostalCode && (
                      <div className="error-message animate-error">{fieldErrors.billingPostalCode}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Billing Country *</label>
                    <input
                      type="text"
                      value={billingAddress.country}
                      onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                      className={fieldErrors.billingCountry ? "error" : ""}
                    />
                    {fieldErrors.billingCountry && (
                      <div className="error-message animate-error">{fieldErrors.billingCountry}</div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="form-section">
              <h3>Payment Information</h3>
              <div className="form-group">
                <label>Payment Method</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Razorpay">Razorpay</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>

            <div className="terms-conditions">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={isTermsAccepted}
                  onChange={() => setIsTermsAccepted(!isTermsAccepted)}
                  className={fieldErrors.terms ? "error-checkbox" : ""}
                />
                I agree to the <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a>
              </label>
              {fieldErrors.terms && (
                <div className="error-message animate-error">{fieldErrors.terms}</div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="submit-checkout-btn" 
              onClick={handlePayment} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                `Pay ₹${total.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutModal;