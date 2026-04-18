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

          {/* Protected: TECHNICIAN or ADMIN */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute requiredRoles={["ROLE_TECHNICIAN", "ROLE_ADMIN"]}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── ALL ADMIN PAGES share AdminLayout (static sidebar) ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* index = /admin */}
            <Route index element={<AdminDashboard />} />
            {/* /admin/facilities */}
            <Route path="facilities" element={<FacilitiesPage />} />
            {/* Add future pages here — same pattern */}
            {/* <Route path="bookings"   element={<BookingsPage />} /> */}
            {/* <Route path="incidents"  element={<IncidentsPage />} /> */}
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;