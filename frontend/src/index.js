import React from "react";
import ReactDOM from "react-dom/client"; // Use the new `react-dom/client` API
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")); // Create a root
root.render(
    <Router>
      <App />
    </Router>
);
