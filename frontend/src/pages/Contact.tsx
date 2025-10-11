import React from "react";

const Contact: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">Contact Page</h1>
      <p className="text-lg text-gray-600 mb-4">Get in touch with us!</p>

      {/* Test Tailwind styles */}
      <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
        🔴 If you see this red box, Tailwind is working!
      </div>

      <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
        🟢 This green box also confirms Tailwind is active
      </div>

      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Test Button
      </button>
    </div>
  );
};

export default Contact;
