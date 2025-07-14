import React from "react";
import "./App.css";
import logo from "./logo.png"; // Adjust if needed
import { Link } from "react-router-dom";

function AccessPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <Link to="/">
          <img className="not-found-logo" src={logo} alt="Logo" />
        </Link>
        <h1 className="not-found-title">Account Created Successfully</h1>
        <p className="not-found-text">
          Your account is created successfully. To access and use this
          application, please email MohammadReza EskandariNasab at{" "}
          <a href="mailto:reza.eskandarinasab@usu.edu">
            reza.eskandarinasab@usu.edu
          </a>{" "}
          with your institutional details and intended use.
        </p>
        <p className="not-found-text">
          Once your account is verified in our database, you will be
          automatically directed to the dashboard after login.
        </p>
        <Link to="/" className="not-found-home-link">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default AccessPage;
