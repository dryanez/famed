import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./pages/Layout"

import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Flashcards from "./pages/Flashcards"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/flashcards" element={<Flashcards />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster />
    </AuthProvider>
  )
}

export default App 