
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// Remove Layout import that causes white screen
// import Layout from "./Layout"
import Home from "./Home";
import Dashboard from "./Dashboard";
import Flashcards from "./Flashcards";
import Upgrade from "./Upgrade";
import Aufklaerung from "./Aufklaerung";
import AufklaerungTest from "./AufklaerungTest"; // Re-enabled with real API implementation

export default function Pages() {
  return (
    <Router>
      {/* Using routes without the problematic Layout component */}
              <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/aufklaerung" element={<Aufklaerung />} />
          <Route path="/aufklaerungtest" element={<AufklaerungTest />} />
        </Routes>
    </Router>
  );
}
