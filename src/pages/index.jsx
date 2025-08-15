
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./Layout"
import Home from "./Home";
import Dashboard from "./Dashboard";
import Practice from "./Practice";
import Progress from "./Progress";
import MedicalCases from "./MedicalCases";
import CaseDetail from "./CaseDetail";
import CaseTest from "./CaseTest";
import AssessmentDetail from "./AssessmentDetail";
import OnDemand from "./OnDemand";
import Flashcards from "./Flashcards";
import PrivateClasses from "./PrivateClasses";
import EbookReader from "./EbookReader";
import CourseDetail from "./CourseDetail";
import Certificate from "./Certificate";
import ProfessorDashboard from "./ProfessorDashboard";
import UserSettings from "./UserSettings";
import ClassDashboard from "./ClassDashboard";
import Anamnese from "./Anamnese";
import Aufklaerung from "./Aufklaerung";
import AufklaerungTest from "./AufklaerungTest";
import Upgrade from "./Upgrade";
import Redeem from "./Redeem";
import AdminPanel from "./AdminPanel";
import PaymentSuccess from "./PaymentSuccess";

export default function Pages() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/medicalcases" element={<MedicalCases />} />
          <Route path="/casedetail" element={<CaseDetail />} />
          <Route path="/casetest" element={<CaseTest />} />
          <Route path="/assessmentdetail" element={<AssessmentDetail />} />
          <Route path="/ondemand" element={<OnDemand />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/privateclasses" element={<PrivateClasses />} />
          <Route path="/ebookreader" element={<EbookReader />} />
          <Route path="/coursedetail" element={<CourseDetail />} />
          <Route path="/certificate" element={<Certificate />} />
          <Route path="/professordashboard" element={<ProfessorDashboard />} />
          <Route path="/usersettings" element={<UserSettings />} />
          <Route path="/classdashboard" element={<ClassDashboard />} />
          <Route path="/anamnese" element={<Anamnese />} />
          <Route path="/aufklaerung" element={<Aufklaerung />} />
          <Route path="/aufklaerungtest" element={<AufklaerungTest />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/redeem" element={<Redeem />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
          <Route path="/paymentsuccess" element={<PaymentSuccess />} />
        </Routes>
      </Layout>
    </Router>
  );
}
