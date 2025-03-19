import React, { useState } from "react";
import "./CheckoutModal.css";
import { useNavigate } from "react-router-dom";

const CheckoutModal = ({ cart, subtotal, total, handleCheckoutSuccess, onClose }) => {
  const navigate = useNavigate();   

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [billingAddress, setBillingAddress] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [useBillingAsShipping, setUseBillingAsShipping] = useState(true); // Default to using shipping as billing

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle payment and Razorpay integration
  const handlePayment = async () => {
    if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      setError("Please fill in all the shipping details.");
      return;
    }

    // Check for billing address only if it's different from shipping
    if (!useBillingAsShipping && (!billingAddress.name || !billingAddress.address || !billingAddress.city || !billingAddress.postalCode || !billingAddress.country)) {
      setError("Please fill in all the billing details.");
      return;
    }

    if (!isTermsAccepted) {
      setError("You must accept the terms and conditions.");
      return;
    }

    setLoading(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setError("Failed to load Razorpay. Try again.");
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
          billingAddress: useBillingAsShipping ? shippingAddress : billingAddress, // Send the appropriate billing address
          paymentMethod,
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        setError(orderData.message || "Failed to create payment order.");
        setLoading(false);
        return;
      }

      const options = {
        key: "rzp_test_6y4ihF8KtZx61t",
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
            paymentAmount: total,  // Capturing the selected payment method (UPI, card, etc.)
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
            setError(verifyResult.message || "Payment verification failed.");
            setLoading(false);
            return;
          }

          const orderToSave = {
            items: cart.map((item) => ({
              productid: item.productid,
              quantity: item.quantity,
              price: item.new_price,
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
            handleCheckoutSuccess(checkoutResult.message);
            navigate(`/order/${checkoutResult.orderId}`);
          } else {
            setError(checkoutResult.message || "Checkout failed.");
          }
          setLoading(false);
        },
        prefill: {
          name: shippingAddress.name,
          email: localStorage.getItem("user_email"),
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setError("Payment process failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="checkout-modal-overlay">
        <div className="checkout-modal">
          <div className="modal-header">
            <h2>Checkout</h2>
            <button className="close-btn" onClick={onClose}>✖</button>
          </div>

          <div className="modal-content">
            {/* Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              <ul>
                {cart.map((item) => (
                  <li key={item.productid}>
                    <span>{item.name}</span>
                    <span>{item.quantity} x ₹{item.new_price}</span>
                  </li>
                ))}
              </ul>
              <div className="subtotal">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="shipping">
                <span>Delivery Fee:</span>
                <span>₹{99}</span>
              </div>
              <div className="shipping">
                <span>Platform Fee:</span>
                <span>₹{19}</span>
              </div>
              <div className="total">
                <span>Total:</span>
                <span>₹{subtotal + 118}</span>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="shipping-information">
              <h3>Shipping Information</h3>
              <input
                type="text"
                placeholder="Full Name"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Address"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              />
              <input
                type="text"
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
              />
              <input
                type="text"
                placeholder="Country"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
              />
            </div>

            {/* Billing Information */}
            <div className="billing-information">
              <h3>Billing Information</h3>
              <label>
                <input
                  type="radio"
                  checked={useBillingAsShipping}
                  onChange={() => setUseBillingAsShipping(true)}
                />
                Use Shipping Address as Billing Address
              </label>
              <label>
                <input
                  type="radio"
                  checked={!useBillingAsShipping}
                  onChange={() => setUseBillingAsShipping(false)}
                />
                Use Different Billing Address
              </label>

              {/* Billing Address Fields (Only show if Use Different Billing Address is selected) */}
              {!useBillingAsShipping && (
                <>
                  <input
                    type="text"
                    placeholder="Billing Full Name"
                    value={billingAddress.name}
                    onChange={(e) => setBillingAddress({ ...billingAddress, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Billing Address"
                    value={billingAddress.address}
                    onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Billing City"
                    value={billingAddress.city}
                    onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Billing Postal Code"
                    value={billingAddress.postalCode}
                    onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Billing Country"
                    value={billingAddress.country}
                    onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                  />
                </>
              )}
            </div>

            {/* Payment Information */}
            <div className="payment-information">
              <h3>Payment Information</h3>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="Razorpay">Razorpay</option>
                {/* Add more payment methods if needed */}
              </select>
            </div>

            {/* Terms and Conditions */}
            <div className="terms-conditions">
              <label>
                <input
                  type="checkbox"
                  checked={isTermsAccepted}
                  onChange={() => setIsTermsAccepted(!isTermsAccepted)}
                />
                I agree to the <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a>
              </label>
            </div>
          </div>

          {/* Final Review & Confirmation */}
          <div className="modal-footer">
            {error && <div className="error-message">{error}</div>}
            <button className="submit-checkout-btn" onClick={handlePayment} disabled={loading}>
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutModal;
