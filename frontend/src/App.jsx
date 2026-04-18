import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminIncidentsPage from "./pages/AdminIncidentsPage";
import UserDashboard from "./pages/UserDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import OAuthCallback from "./pages/OAuthCallback";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import FacilitiesPage from "./pages/FacilitiesPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/oauth2/callback" element={<OAuthCallback />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Fallback authenticated user */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

          {/* Technician */}
          <Route path="/technician" element={
            <ProtectedRoute requiredRoles={["ROLE_TECHNICIAN", "ROLE_ADMIN"]}>
              <TechnicianDashboard />
            </ProtectedRoute>
          } />

          {/* ── ADMIN (static sidebar via AdminLayout) ── */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ROLE_ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="incidents" element={<AdminIncidentsPage />} />
            <Route path="facilities" element={<FacilitiesPage />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;