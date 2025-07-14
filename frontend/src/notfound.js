import React from "react";
import "./App.css";
import { Link } from "react-router-dom";
import logo from "./logo.png"; // Replace with the correct path to your logo

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <Link to="/">
          <img className="not-found-logo" src={logo} alt="Logo" />
        </Link>
        <h1 className="not-found-title">Oops! 404 Page Not Found</h1>
        <p className="not-found-text">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="not-found-home-link">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
