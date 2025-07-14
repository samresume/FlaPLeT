import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Login from "./components/login";
import Signup from "./components/signup";
import Dashboard from "./components/dashboard-sessions/Dashboard";
import DashboardNewSession from "./components/dashboard-newsession/Dashboard";
import ProfileDashboard from "./components/dashboard-profile/Dashboard";
import ReportDashboard from "./components/dashboard-mlreport/Dashboard";
import DashboardNewDataset from "./components/dashboard-newdataset/Dashboard";
import DatasetDashboard from "./components/dashboard-datasets/Dashboard";
import DataAugDashboard from "./components/dashboard-dataaug/Dashboard";
import FNDashboard from "./components/dashboard-fngeneration/Dashboard";
import DashboardNewProfile from "./components/dashboard-newprofile/Dashboard";
import DashboardBugReport from "./components/dashboard-bugreport/Dashboard";
import DashboardFeedback from "./components/dashboard-feedback/Dashboard";
import MainDashboard from "./components/dashboard/Dashboard";
import About from "./about";
import Contact from "./contact";
import Notfound from "./notfound";
import DashboardNewFNDataset from "./components/dashboard-newfndataset/Dashboard";
import DashboardNewAugmented from "./components/dashboard-newaugmented/Dashboard";
import MessageDashboard from "./components/dashboard-messages/Dashboard";
import DAReportDashboard from "./components/dashboard-dareport/Dashboard";
import DataAnalyticsDashboard from "./components/dashboard-data-analytics/Dashboard";
import { CookiesProvider } from "react-cookie";

import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Help from "./help";
import AccessPage from "./access";

export default function Routing() {
  return (
    <BrowserRouter>
      <CookiesProvider>
        <Routes>
          <Route exact path="/" element={<App />}></Route>
          <Route exact path="/about" element={<About />}></Route>
          <Route exact path="/contact" element={<Contact />}></Route>
          <Route exact path="/help" element={<Help />}></Route>
          <Route
            exact
            path="/bug-report"
            element={<DashboardBugReport />}
          ></Route>
          <Route exact path="/feedback" element={<DashboardFeedback />}></Route>
          <Route exact path="/messages" element={<MessageDashboard />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/ml-sessions" element={<Dashboard />}></Route>
          <Route path="/datasets" element={<DatasetDashboard />}></Route>
          <Route path="/graph-generation" element={<FNDashboard />}></Route>
          <Route path="/new-graph" element={<DashboardNewFNDataset />}></Route>
          <Route
            path="/new-augmented"
            element={<DashboardNewAugmented />}
          ></Route>
          <Route
            path="/data-augmentation"
            element={<DataAugDashboard />}
          ></Route>
          <Route path="/new-session" element={<DashboardNewSession />}></Route>
          <Route path="/new-dataset" element={<DashboardNewDataset />}></Route>
          <Route path="/profile" element={<ProfileDashboard />}></Route>
          <Route path="/edit-profile" element={<DashboardNewProfile />}></Route>
          <Route path="/ml-report" element={<ReportDashboard />}></Route>
          <Route path="/da-report" element={<DAReportDashboard />}></Route>
          <Route
            path="/data-analysis"
            element={<DataAnalyticsDashboard />}
          ></Route>
          <Route path="/dashboard" element={<MainDashboard />}></Route>
          <Route path="*" element={<Notfound />}></Route>
          <Route path="/access" element={<AccessPage />}></Route>
        </Routes>
      </CookiesProvider>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Routing />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
