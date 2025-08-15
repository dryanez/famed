import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"

function App() {
  return (
    <div>
      <h1>FAMED Test - Loading...</h1>
      <AuthProvider>
        <Pages />
        <Toaster />
      </AuthProvider>
    </div>
  )
}

export default App 