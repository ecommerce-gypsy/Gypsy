import React, { useState } from 'react';

export default function AddressForm() {
  const [showForm, setShowForm] = useState(true); // Set showForm to true initially
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Address Submitted:", formData);
    setShowForm(false); // Hide form after submission (optional)
  };

  return (
    <div className="p-4">
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded-lg shadow-md">
          <label className="block mb-2">
            Street:
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </label>

          <label className="block mb-2">
            City:
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </label>

          <label className="block mb-2">
            State:
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </label>

          <label className="block mb-2">
            ZIP Code:
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </label>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2">
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
