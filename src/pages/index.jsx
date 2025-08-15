
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// Remove Layout import that causes white screen
// import Layout from "./Layout"
import Home from "./Home";
import Dashboard from "./Dashboard";
import Flashcards from "./Flashcards";
// Add other working components one by one later

export default function Pages() {
  return (
    <Router>
      {/* Using routes without the problematic Layout component */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/flashcards" element={<Flashcards />} />
      </Routes>
    </Router>
  );
}
