import React from "react";
import "./App.css";
import { Link } from "react-router-dom";
import logo from "./logo.png";
import flareHelp from "./flareHelp.jpg";
import architectureImage from "./Architecture.png";
import { FaEnvelope, FaGithub, FaGlobe } from "react-icons/fa";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

function Help() {
  return (
    <div className="help-page">
      {/* Header */}
      <header className="help-header">
        <Link to="/">
          <img className="help-logo" src={logo} alt="Logo" />
        </Link>
        <h1 className="help-title">Help</h1>
      </header>

      {/* Main Card */}
      <div className="help-card">
        <img className="help-card-image" src={flareHelp} alt="Help Header" />
        <div className="help-card-content">
          {/* Registration */}
          <section className="help-section">
            <h2 className="help-section-title">Registration</h2>
            <p className="help-text">
              To access and use this application, please email{" "}
              <a
                href="mailto:reza.eskandarinasab@usu.edu"
                className="help-link"
              >
                MohammadReza EskandariNasab
              </a>{" "}
              with your personal information, institutional details, and
              intended use. Once verified, you can register via the{" "}
              <Link to="/signup" className="help-link">
                Sign Up
              </Link>{" "}
              page.
            </p>
          </section>

          {/* Test Datasets */}
          <section className="help-section">
            <h2 className="help-section-title">Test Datasets</h2>
            <p className="help-text">
              Sample datasets are available on our{" "}
              <a
                href="https://github.com/samresume/FlaPLeT/tree/main/sample_dataset"
                target="_blank"
                rel="noopener noreferrer"
                className="help-link"
              >
                GitHub page
              </a>
              . You can upload these to explore the platform.
            </p>
          </section>

          {/* Uploading Datasets */}
          <section className="help-section">
            <h2 className="help-section-title">Uploading Your Datasets</h2>
            <p className="help-text">
              Uploaded datasets must follow these rules:
            </p>
            <ul className="help-list">
              <li className="help-list-item">
                Total file size must not exceed 25 MB.
              </li>
              <li className="help-list-item">
                Two `.pkl` files required:
                <ul>
                  <li>
                    Time series data: <code>(samples, time, features)</code>
                  </li>
                  <li>
                    Binary labels: <code>(samples)</code>
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="help-section">
            <h2 className="help-section-title">Platform Demo Video</h2>
            <p className="help-text">
              A recorded demonstration of the platform is available on YouTube.
              The video provides an overview of key features, including dataset
              upload, preprocessing, data augmentation, functional network
              generation, model training, and downloading reports through the
              web interface.
            </p>
            <div className="about-award-link">
              <FaGlobe className="about-icon" />
              <a
                className="about-link"
                href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID" // Replace with actual video link
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Platform Demo on YouTube
              </a>
            </div>
          </section>

          {/* Platform Features */}
          <section className="help-section">
            <h2 className="help-section-title">Platform Features</h2>
            <p className="help-text">
              The platform provides an end-to-end pipeline for working with
              multivariate time series (MVTS) data:
            </p>
            <ul className="help-list">
              <li className="help-list-item">
                <ul>
                  <li>
                    <strong>Dataset Upload and Preprocessing:</strong> Upload
                    time series datasets in `.pkl` format. Missing values can be
                    handled using mean imputation or sample removal.
                    Normalization options include z-score and min-max scaling.
                  </li>
                  <li>
                    <strong>Data Augmentation:</strong> Use SMOTE or TimeGAN to
                    address class imbalance. Hyperparameters like k_neighbors
                    (for SMOTE) or batch size, layers, and iterations (for
                    TimeGAN) can be configured.
                  </li>
                  <li>
                    <strong>Functional Network Generation:</strong> Generate
                    graph-based datasets by computing pairwise Pearson
                    correlations. Users can set the correlation threshold and
                    max number of neighbors.
                  </li>
                  <li>
                    <strong>Machine Learning Classification:</strong> Train GRU,
                    SVM, or Node2Vec+Logistic Regression models using
                    preprocessed, augmented, or graph-based datasets. Users can
                    set hyperparameters and train/test split ratio.
                  </li>
                  <li>
                    <strong>Task Reports:</strong> Each task produces a
                    downloadable report that includes metadata, runtime, and
                    performance metrics such as Accuracy, Precision, Recall,
                    AUC, TSS, HSS, and GS.
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          {/* System Architecture */}
          <section className="help-section">
            <h2 className="help-section-title">System Architecture</h2>
            <p className="help-text">
              The platform is implemented as a modular web application using
              modern full-stack technologies:
            </p>
            <ul className="help-list">
              <li className="help-list-item">
                <ul>
                  <li>
                    <strong>Frontend:</strong> Developed using React and styled
                    with Material UI for a responsive and component-based user
                    interface.
                  </li>
                  <li>
                    <strong>Backend:</strong> Built with Django and served
                    through Waitress. It handles routing, API logic, user
                    sessions, and database interactions.
                  </li>
                  <li>
                    <strong>Asynchronous Task Processing:</strong> Celery is
                    used to run long-running tasks like preprocessing and
                    training. Redis acts as the message broker.
                  </li>
                  <li>
                    <strong>Web Server:</strong> NGINX serves static files and
                    proxies HTTPS API traffic to the backend.
                  </li>
                  <li>
                    <strong>Database:</strong> PostgreSQL stores all structured
                    data including user records, datasets, task metadata, and
                    results.
                  </li>
                </ul>
              </li>
            </ul>

            <div
              className="about-project-link"
              style={{
                marginTop: "20px",
              }}
            >
              <FaGithub className="about-icon" />
              <a
                className="about-link"
                href="https://github.com/samresume/FlaPLeT"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore FlaPLeT (Open-Source Project)
              </a>
            </div>
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <img
                className="help-card-image"
                src={architectureImage}
                alt="System Architecture"
                style={{
                  maxWidth: "450px",
                  width: "100%",
                  height: "auto",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="help-footer">
        <p className="help-footer-text">
          &copy; {new Date().getFullYear()} Utah State University. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

export default Help;
