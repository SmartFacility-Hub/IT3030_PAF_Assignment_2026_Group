import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import OAuthCallback from "./pages/OAuthCallback";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import LectureDashboard from "./pages/Lecturerdashboard";
import StudentDashboard from "./pages/Studentdashboard";
import FacilitiesPage from "./pages/FacilitiesPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/oauth2/callback" element={<OAuthCallback />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected: any authenticated user */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected: ADMIN only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected: ADMIN only — Facilities */}
          <Route
            path="/admin/facilities"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <FacilitiesPage />
              </ProtectedRoute>
            }
          />

          {/* Protected: TECHNICIAN or ADMIN */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute requiredRoles={["ROLE_TECHNICIAN", "ROLE_ADMIN"]}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;