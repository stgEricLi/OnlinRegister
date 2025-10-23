import React from "react";
import { Link } from "react-router-dom";

const Navigation: React.FC = () => {
  return (
    <nav className="bg-gray-100 p-4 mb-8 shadow-sm">
      <ul className="flex gap-6 list-none m-0 p-0">
        <li>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 no-underline font-medium transition-colors"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            className="text-blue-600 hover:text-blue-800 no-underline font-medium transition-colors"
          >
            About
          </Link>
        </li>
        <li>
          <Link
            to="/contact"
            className="text-blue-600 hover:text-blue-800 no-underline font-medium transition-colors"
          >
            Contact
          </Link>
        </li>
        <li>
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 no-underline font-medium transition-colors"
          >
            Login
          </Link>
        </li>
        <li>
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-800 no-underline font-medium transition-colors"
          >
            Sign Up
          </Link>
        </li>
        <li>
          <Link
            to="/userlist"
            className="text-blue-600 hover:text-blue-800 no-underline font-medium transition-colors"
          >
            Users
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
