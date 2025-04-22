import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../src/components/Dashboard/Dashboard";
import FinPilot from "./components/FinPilot/index";
import "../src/app.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/me" element={<FinPilot />} />
      </Routes>
    </Router>
  );
}

export default App;
