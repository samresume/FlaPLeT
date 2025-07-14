import "./App.css";
import videoBg from "./videoBg.mp4";
import logo from "./logo.png";
import NSF from "./NSF.png";
import NOAA from "./NOAA.png";
import UState from "./UState.png";
import React from "react";
import { Cookies } from "react-cookie";
import { Link } from "react-router-dom";

const cookies = new Cookies();

function App(props) {
  const [value, setValue] = React.useState(0);

  const handleLoginClick = () => {
    const token = cookies.get("user-token");
    const access = cookies.get("access");

    if (token) {
      if (access && access.toString() === "1") {
        window.location.href = `${process.env.PUBLIC_URL}/dashboard`;
      } else {
        window.location.href = `${process.env.PUBLIC_URL}/login`;
      }
    } else {
      window.location.href = `${process.env.PUBLIC_URL}/login`;
    }
  };

  return (
    <div className="App">
      <video src={videoBg} autoPlay loop muted />
      <div className="overlay"></div>
      <div className="content-center">
        <h3 className="main-h3">Machine Learning Based</h3>
        <h1 className="main-h1">Solar Flare Prediction</h1>
        <div className="div-logo">
          <img className="brandlogo" src={UState} alt="UState Logo" />
          <img className="brandlogo" src={NSF} alt="NSF Logo" />
        </div>
      </div>

      <div className="content">
        <button className="atag" onClick={handleLoginClick}>
          Log in
        </button>
        <button
          className="atag"
          onClick={() => {
            window.location.href = `${process.env.PUBLIC_URL}/signup`;
          }}
        >
          Sign up
        </button>
        <button
          className="atag"
          onClick={() => {
            window.location.href = `${process.env.PUBLIC_URL}/help`;
          }}
        >
          Help
        </button>
        <button
          className="atag"
          onClick={() => {
            window.location.href = `${process.env.PUBLIC_URL}/contact`;
          }}
        >
          Contact
        </button>
        <button
          className="atag"
          onClick={() => {
            window.location.href = `${process.env.PUBLIC_URL}/about`;
          }}
        >
          About
        </button>
      </div>
    </div>
  );
}

export default App;
