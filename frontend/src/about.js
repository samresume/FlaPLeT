// About.js
import React from "react";
import "./App.css";
import logo from "./logo.png";
import usuImage from "./usuImage.jpg"; // Replace with the correct image path
import piImage from "./piImage.jpg"; // Replace with the correct image path
import devImage from "./devImage.jpg"; // Replace with the correct image path
import {
  FaGlobe,
  FaGithub,
  FaEnvelope,
  FaUniversity,
  FaCalendarAlt,
  FaDollarSign,
  FaGoogle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">
      {/* Header Section */}
      <header className="about-header">
        <Link to="/">
          <img className="about-logo" src={logo} alt="Logo" />
        </Link>
        <h1 className="about-title">About Us</h1>
      </header>

      {/* Main Card Section */}
      <div className="about-card">
        <img
          className="about-card-image"
          src={usuImage}
          alt="Utah State University"
        />
        <div className="about-card-content">
          <section className="about-lab-info">
            <h2 className="about-section-title">About Our Lab</h2>
            <p className="about-text">
              At Utah State University, our research group develops cutting-edge
              machine learning methods for solar flare prediction and solar
              energetic particle (SEP) forecasting. Our work focuses on
              time-series data modeling using advanced generative techniques,
              including GANs, diffusion models, adversarial autoencoders, and
              autoregressive frameworks. We also explore graph neural networks
              to improve the accuracy, interpretability, and real-world
              applicability of solar event forecasting systems.
            </p>
          </section>

          <section className="about-funding-details">
            <h2 className="about-section-title">Project Funding</h2>
            <p className="about-text">
              This research is supported by the National Science Foundation
              (NSF) under the Office of Advanced Cyberinfrastructure (OAC).
            </p>
            <ul className="about-list">
              <li className="about-list-item">
                <FaUniversity className="about-list-item-icon" />
                Recipient: UTAH STATE UNIVERSITY
              </li>
              <li className="about-list-item">
                <FaGlobe className="about-list-item-icon" />
                Award Number: 2305781
              </li>
              <li className="about-list-item">
                <FaCalendarAlt className="about-list-item-icon" />
                Start Date: October 1, 2022
              </li>
              <li className="about-list-item">
                <FaCalendarAlt className="about-list-item-icon" />
                End Date: May 31, 2025 (Estimated)
              </li>
              <li className="about-list-item">
                <FaDollarSign className="about-list-item-icon" />
                Total Award Amount: $174,984.00
              </li>
            </ul>
            <div className="about-award-link">
              <FaGlobe className="about-icon" />
              <a
                className="about-link"
                href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2305781&HistoricalAwards=false"
                target="_blank"
                rel="noopener noreferrer"
              >
                View NSF Award Details
              </a>
            </div>
          </section>

          <section className="about-principal-investigator">
            <h2 className="about-section-title">Principal Investigator</h2>
            <img
              className="about-image-pi"
              src={piImage}
              alt="Shah Muhammad Hamdi"
            />
            <p className="about-text">
              Shah Muhammad Hamdi (Assistant Professor)
            </p>
            <div className="about-contact-item">
              <FaEnvelope className="about-icon" />
              Email:{" "}
              <a href="mailto:s.hamdi@usu.edu" className="about-link">
                s.hamdi@usu.edu
              </a>
            </div>
            <div className="about-contact-item">
              <FaGoogle className="about-icon" />
              Google Scholar:{" "}
              <a
                href="https://scholar.google.com/citations?user=naRVOVoAAAAJ&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
              >
                Hamdi's Scholar Profile
              </a>
            </div>
          </section>

          <section className="about-developer">
            <h2 className="about-section-title">
              Developer and Research Assistant
            </h2>
            <img
              className="about-image-dev"
              src={devImage}
              alt="MohammadReza EskandariNasab"
            />
            <p className="about-text">
              MohammadReza EskandariNasab (Ph.D. candidate)
            </p>
            <div className="about-contact-item">
              <FaEnvelope className="about-icon" />
              Email:{" "}
              <a
                href="mailto:reza.eskandarinasab@usu.edu"
                className="about-link"
              >
                reza.eskandarinasab@usu.edu
              </a>
            </div>
            <div className="about-contact-item">
              <FaGoogle className="about-icon" />
              Google Scholar:{" "}
              <a
                href="https://scholar.google.com/citations?view_op=list_works&hl=en&hl=en&user=oUuVbaUAAAAJ"
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
              >
                EskandariNasab's Scholar Profile
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="about-footer">
        <p className="about-footer-text">
          &copy; {new Date().getFullYear()} Utah State University. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

export default About;
