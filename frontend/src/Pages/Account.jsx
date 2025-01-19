import React from "react";
import "./Account.css";


const Account = () => {
  return (
    <div className="account">
     
      {/* Main Content */}
      <main className="account-content">
        <h1>Account</h1>
        <section className="order-history">
          <h2>Order history</h2>
          <p>You haven't placed any orders yet.</p>
        </section>
        <section className="account-details">
          <h3>Account details</h3>
          <p>Roshni VR</p>
          <p>India</p>
          <button onClick={() => alert("View addresses clicked")}>View addresses (1)</button>
        </section>
        <button className="logout-link" onClick={() => alert("Logout clicked")}>Log out</button>
      </main>
    </div>
  );
};

export default Account;