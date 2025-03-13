import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import visaLogo from "../Assets/visa.png";
import MasterCardLogo from "../Assets/Mastercard.png";
import rupayLogo from "../Assets/rupay.png";
import paytmLogo from "../Assets/paytm.png";
import "./OrderSummary.css";

const steps = [
  { id: 1, label: "Account" },
  { id: 2, label: "Delivery" },
  { id: 3, label: "Billing Address" },
  { id: 4, label: "Shipping Method" },
  { id: 5, label: "Payment" },
];

// Billing Address Component
const BillingAddress = () => {
  const [sameAsShipping, setSameAsShipping] = useState(true);

  return (
    <div className="billing-options">
      <label className={`billing-option ${sameAsShipping ? "selected" : ""}`}>
        <input
          type="radio"
          name="billing"
          checked={sameAsShipping}
          onChange={() => setSameAsShipping(true)}
        />
        <span>Same as shipping address</span>
      </label>

      <label className={`billing-option ${!sameAsShipping ? "selected" : ""}`}>
        <input
          type="radio"
          name="billing"
          checked={!sameAsShipping}
          onChange={() => setSameAsShipping(false)}
        />
        <span>Use a different billing address</span>
      </label>

      {!sameAsShipping && (
        <form className="billing-form">
          <div className="form-group">
            <label htmlFor="country">
              Country/Region <span className="required-symbol">*</span>
            </label>
            <select id="country" disabled>
              <option>India</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="address">
              Address <span className="required-symbol">*</span>
            </label>
            <input id="address" type="text" />
          </div>
        </form>
      )}
    </div>
  );
};

const ShippingMethod = () => (
  <div className="shipping-box">
    <p>Enter your shipping address to view available shipping methods.</p>
  </div>
);

const Delivery = () => (
  <section id="delivery" className="billing-form">
    <div className="form-group">
      <label htmlFor="country">
        Country/Region <span className="required-symbol">*</span>
      </label>
      <select id="country" disabled>
        <option>India</option>
      </select>
    </div>
    <div className="form-group">
      <label htmlFor="address">
        Address <span className="required-symbol">*</span>
      </label>
      <input id="address" type="text" />
    </div>
  </section>
);

const OrderSummary = ({ currentStep, setCurrentStep }) => (
  <div className="stepper-container">
    {steps.map((step, index) => (
      <div
        key={step.id}
        className={`step ${currentStep === step.id ? "active" : "inactive"}`}
        onClick={() => setCurrentStep(step.id)}
      >
        <div
          className={`step-number ${currentStep >= step.id ? "completed" : ""}`}
        >
          {currentStep > step.id ? <span className="tick-symbol">&#10003;</span> : step.id}
        </div>
        <span className="step-label">{step.label}</span>
        {index < steps.length - 1 && <div className="step-divider"></div>}
      </div>
    ))}
  </div>
);

export default function OrderProcess({ userProfileData }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState("payu");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
  });

  useEffect(() => {
    if (userProfileData) {
      setUserData({
        name: userProfileData.name || "",
        email: userProfileData.email || "",
        phone: userProfileData.phone || "",
        dob: userProfileData.dob || "",
        gender: userProfileData.gender || "",
      });
    }
  }, [userProfileData]);

  return (
    <>
      <OrderSummary currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <div className="account-container">
        <h2>{steps.find((step) => step.id === currentStep)?.label} Details</h2>
        {currentStep === 1 && (
          <div className="account-info">
            <p><strong>Full Name:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Phone:</strong> {userData.phone}</p>
            <p><strong>Date of Birth:</strong> {userData.dob}</p>
            <p><strong>Gender:</strong> {userData.gender}</p>
          </div>
        )}
        {currentStep === 2 && <Delivery />}
        {currentStep === 3 && <BillingAddress />}
        {currentStep === 4 && <ShippingMethod />}
        {currentStep === 5 && (
          <div className="payment-container">
            <center><p>All transactions are secure and encrypted.</p></center>

            <label className={`payment-option ${selectedPayment === "payu" ? "selected" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="payu"
                checked={selectedPayment === "payu"}
                onChange={() => setSelectedPayment("payu")}
              />
              <div className="payment-details">
                <span>Cards, UPI, NB, Wallets, BNPL by PayU India</span>
                <div className="payment-logos">
                  <img src={visaLogo} alt="Visa" />
                  <img src={MasterCardLogo} alt="MasterCard" />
                  <img src={rupayLogo} alt="RuPay" />
                  <img src={paytmLogo} alt="Paytm" />
                </div>
              </div>
            </label>

            <label className={`payment-option ${selectedPayment === "cod" ? "selected" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={selectedPayment === "cod"}
                onChange={() => setSelectedPayment("cod")}
              />
              <span>Cash on Delivery (COD)</span>
            </label>

            <button className="pay-now-button">Pay now</button>
          </div>
        )}

        <div className="button-container">
          {currentStep > 1 && (
            <button className="update-btn" onClick={() => setCurrentStep(currentStep - 1)}>
              <FaArrowLeft />
            </button>
          )}
          {currentStep < steps.length && (
            <button className="next-btn" onClick={() => setCurrentStep(currentStep + 1)}>
              <FaArrowRight />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
