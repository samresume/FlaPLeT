// Contact.js
import React from "react";
import "./App.css";
import logo from "./logo.png";
import { Link } from "react-router-dom";
import { FaGlobe, FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";

function Contact() {
  return (
    <div className="contact-page">
      <header className="contact-header">
        <Link to="/">
          <img className="contact-logo" src={logo} alt="Logo" />
        </Link>
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-subtitle">
          We are here to help you. Feel free to reach out with any questions or
          concerns.
        </p>
      </header>

      <div className="contact-content">
        <div className="contact-columns">
          <div className="contact-column">
            <h2 className="contact-heading">Project Funding</h2>
            <p className="contact-text">
              This project is generously funded by NSF through the Office of
              Advanced Cyberinfrastructure (OAC).
            </p>
            <div className="project-funding">
              <FaGlobe className="contact-icon" />
              <a
                className="contact-link"
                href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2305781&HistoricalAwards=false"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Project Funding
              </a>
            </div>
          </div>

          <div className="contact-column">
            <h2 className="contact-heading">Principal Investigator</h2>
            <p className="contact-text">
              Shah Muhammad Hamdi (Assistant Professor)
            </p>
            <div className="contact-links">
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                Email:{" "}
                <a href="mailto:s.hamdi@usu.edu" className="contact-link">
                  s.hamdi@usu.edu
                </a>
              </div>
              <div className="contact-item">
                <FaGlobe className="contact-icon" />
                Website:{" "}
                <a
                  href="https://www.usu.edu/cs/directory/faculty/hamdi-muhammad-shad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  Hamdi's Profile
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-columns">
          <div className="contact-column">
            <h2 className="contact-heading">
              Developer and Research Assistant
            </h2>
            <p className="contact-text">
              MohammadReza EskandariNasab (Ph.D. candidate)
            </p>
            <div className="contact-links">
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                Email:{" "}
                <a
                  href="mailto:reza.eskandarinasab@usu.edu"
                  className="contact-link"
                >
                  reza.eskandarinasab@usu.edu
                </a>
                ,{" "}
                <a
                  href="mailto:sameskandarinasab@gamil.com"
                  className="contact-link"
                >
                  sameskandarinasab@gmail.com
                </a>
              </div>
              <div className="contact-item">
                <FaGlobe className="contact-icon" />
                Website:{" "}
                <a
                  href="https://samresume.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  samresume.com
                </a>
              </div>
              <div className="contact-item">
                <FaLinkedin className="contact-icon" />
                LinkedIn:{" "}
                <a
                  href="https://www.linkedin.com/in/samresume/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  linkedin.com/in/samresume
                </a>
              </div>
              <div className="contact-item">
                <FaGithub className="contact-icon" />
                GitHub:{" "}
                <a
                  href="https://github.com/samresume"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  github.com/samresume
                </a>
              </div>
            </div>
            <p className="contact-text-footer">
              Please feel free to reach out to Mr. EskandariNasab with any
              inquiries, feedback, or support requests.
            </p>
          </div>
        </div>
      </div>

      <footer className="contact-footer">
        <p>
          &copy; {new Date().getFullYear()} Utah State University. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

export default Contact;
