import React, { useState } from "react";
import "./CheckoutModal.css";

const CheckoutModal = ({ cart, calculateTotal, handleCheckoutSuccess, setError }) => {
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [isOpen, setIsOpen] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    console.log("Payment process started...");

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setError("Failed to load Razorpay. Try again.");
      return;
    }

    const accessToken = localStorage.getItem("auth_token");
    console.log("Access Token: ", accessToken);

    try {
      // Step 1: Create an order on the backend without saving to DB yet
      const response = await fetch("http://localhost:4000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          amount: calculateTotal() * 100, // Razorpay expects amount in paise
          currency: "INR",
          cart, // Send cart items for the order creation process
          shippingAddress,
          paymentMethod, // Send payment method
        }),
      });

      const orderData = await response.json();
      console.log("Order Creation Response: ", orderData);

      if (!response.ok) {
        setError(orderData.message || "Failed to create payment order.");
        return;
      }

      // Step 2: Open Razorpay Payment Window
      const options = {
        key: "rzp_test_6y4ihF8KtZx61t", // Replace with your Razorpay Key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RP Collections",
        description: "Purchase Items",
        order_id: orderData.id,
        handler: async function (paymentResult) {
          console.log("Payment Result: ", paymentResult);

          const paymentDetails = {
            razorpay_order_id: paymentResult.razorpay_order_id,
            razorpay_payment_id: paymentResult.razorpay_payment_id,
            razorpay_signature: paymentResult.razorpay_signature,
          };
          console.log("Payment Result: ", paymentDetails);
          // Step 3: Verify Payment on Backend
          const verifyResponse = await fetch("http://localhost:4000/api/payment/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(paymentDetails),
          });

          const verifyResult = await verifyResponse.json();
          console.log("Payment Verification Response: ", verifyResult);

          if (!verifyResponse.ok) {
            setError(verifyResult.message || "Payment verification failed.");
            return;
          }

          // Step 4: Send Checkout Data to Backend (Save the Order in DB after payment verification)
          const orderToSave = {
            items: cart.map((item) => ({
              productid: item.productid,
              quantity: item.quantity,
              price: item.new_price,
            })),
            shippingAddress,
            paymentMethod,
            totalPrice: calculateTotal(),
            userEmail: localStorage.getItem("user_email"),
            paymentStatus: "Paid",
            razorpay_order_id: paymentResult.razorpay_order_id, // Include Razorpay order ID
            razorpay_payment_id: paymentResult.razorpay_payment_id, // Include Payment ID
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
          console.log("Checkout Response: ", checkoutResult);

          if (checkoutResponse.ok) {
            handleCheckoutSuccess(checkoutResult.message);
            setIsOpen(false);
          } else {
            setError(checkoutResult.message || "Checkout failed.");
          }
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
      console.error("Error during payment process: ", error);
      setError("Payment process failed. Try again.");
    }
  };

  return (
    <>
      <button className="checkout-btn" onClick={() => setIsOpen(true)}>
        CHECKOUT
      </button>

      {isOpen && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal">
            <div className="modal-header">
              <h2>Checkout</h2>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                ✖
              </button>
            </div>

            <div className="modal-content">
              <div className="left-section">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={shippingAddress.name}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, address: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                />
              </div>

              <div className="right-section">
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={shippingAddress.country}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, country: e.target.value })
                  }
                />
              </div>
            </div>

            <button className="submit-checkout-btn" onClick={handlePayment}>
              Pay Now
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutModal;
