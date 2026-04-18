import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import OAuthCallback from "./pages/OAuthCallback";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import LectureDashboard from "./pages/Lecturerdashboard";
import StudentDashboard from "./pages/Studentdashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/oauth2/callback" element={<OAuthCallback />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected: any authenticated user (fallback) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected: STUDENT */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="ROLE_STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected: LECTURER */}
          <Route
            path="/lecturer"
            element={
              <ProtectedRoute requiredRole="ROLE_LECTURER">
                <LectureDashboard />
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

          {/* ALL ADMIN PAGES share AdminLayout (static sidebar) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="facilities" element={<FacilitiesPage />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;