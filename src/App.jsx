import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "./config/maps";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import AuthDashboard from "./pages/auth/AuthDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CitizenRegisterCase from "./pages/citizen/CitizenRegisterCase";
import AuthRegisterCase from "./pages/auth/AuthRegisterCase";
import CitizenCases from "./pages/citizen/CitizenCases";
import AuthCases from "./pages/auth/AuthCases";
import CitizenCaseDetails from "./pages/citizen/CitizenCaseDetails";
import AuthCaseDetails from "./pages/auth/AuthCaseDetails";
import TotalCases from "./pages/auth/TotalCases";
import ResolvedCases from "./pages/auth/ResolvedCases";
import ApprovedCases from "./pages/auth/ApprovedCases";
import PendingCases from "./pages/auth/PendingCases";
import GoogleTranslate from "./components/GoogleTranslator";

function App() {
  return (
    <LoadScript {...GOOGLE_MAPS_CONFIG}>
      <AuthProvider>
      <GoogleTranslate />

        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
            <Route path="/auth-dashboard" element={<AuthDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/citizen-register-case"
              element={<CitizenRegisterCase />}
            />
            <Route path="/auth-register-case" element={<AuthRegisterCase />} />
            <Route path="/citizen-cases" element={<CitizenCases />} />
            <Route path="/auth-cases" element={<AuthCases />} />
            <Route path="/case/:id" element={<AuthCaseDetails />} />
            <Route path="/total" element={<TotalCases />} />
            <Route path="/resolved" element={<ResolvedCases />} />
            <Route path="/approved" element={<ApprovedCases />} />
            <Route path="/pending" element={<PendingCases />}></Route>
          </Routes>
        </Router>
      </AuthProvider>
    </LoadScript>
  );
}

export default App;
