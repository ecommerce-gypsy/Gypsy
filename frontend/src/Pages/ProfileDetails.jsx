import React from "react";
import { useLocation } from "react-router-dom";

export default function ProfileDetails() {
  const { state } = useLocation(); // Get submitted data

  if (!state) {
    return <p className="text-center text-gray-500">No data submitted.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-2xl font-semibold mb-6">Submitted Information</h2>
      <div className="space-y-4">
        {Object.entries(state).map(([key, value]) => (
          <div key={key} className="border-b pb-2">
            <p className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
            <p className="text-gray-700">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
