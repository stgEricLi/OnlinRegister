import React from "react";
import { Link } from "react-router-dom";

const Navigation: React.FC = () => {
  return (
    <nav
      style={{
        padding: "1rem",
        backgroundColor: "#f0f0f0",
        marginBottom: "2rem",
      }}
    >
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          gap: "1rem",
          margin: 0,
          padding: 0,
        }}
      >
        <li>
          <Link to="/" style={{ textDecoration: "none", color: "#007bff" }}>
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            style={{ textDecoration: "none", color: "#007bff" }}
          >
            About
          </Link>
        </li>
        <li>
          <Link
            to="/contact"
            style={{ textDecoration: "none", color: "#007bff" }}
          >
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
