import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import UserLayout from "./components/UserLayout";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminIncidentsPage from "./pages/AdminIncidentsPage";
import UserDashboard from "./pages/UserDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import OAuthCallback from "./pages/OAuthCallback";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import UserIncidentsPage from "./pages/UserIncidentsPage";
import UserBookingsPage from "./pages/UserBookingsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/oauth2/callback" element={<OAuthCallback />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Technician */}
          <Route path="/technician" element={
            <ProtectedRoute requiredRole="ROLE_TECHNICIAN">
              <TechnicianDashboard />
            </ProtectedRoute>
          } />

          {/* ── ALL NON-ADMIN USERS (student, lecturer, user) ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="incidents" element={<UserIncidentsPage />} />
            <Route path="bookings"  element={<UserBookingsPage />} />
            {/* <Route path="bookings"  element={<BookingsPage />} /> */}
            {/* <Route path="incidents" element={<UserIncidentsPage />} /> */}
          </Route>

          {/* ── ADMIN (static sidebar via AdminLayout) ── */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ROLE_ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="incidents"  element={<AdminIncidentsPage />} />
            <Route path="facilities" element={<FacilitiesPage />} />
            <Route path="users"      element={<AdminUsersPage />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;