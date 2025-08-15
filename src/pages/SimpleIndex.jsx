import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import Practice from "./Practice";
import Progress from "./Progress";
import MedicalCases from "./MedicalCases";
import Flashcards from "./Flashcards";
import UserSettings from "./UserSettings";

export default function SimplePages() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/medicalcases" element={<MedicalCases />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/usersettings" element={<UserSettings />} />
      </Routes>
    </Router>
  );
}
