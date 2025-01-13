import React, { useEffect, useState } from "react";

function Account() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/account", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Failed to fetch account details.");
        }
      } catch (error) {
        console.error("Error fetching account details:", error);
      }
    };

    fetchData();
  }, []);

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Account</h1>
      <p>Name: {userData.name}</p>
      <p>Country: {userData.country}</p>
      <p>
        <a href="/addresses">View addresses ({userData.addresses.length})</a>
      </p>
      <a href="/logout">Log out</a>
    </div>
  );
}

export default Account;
