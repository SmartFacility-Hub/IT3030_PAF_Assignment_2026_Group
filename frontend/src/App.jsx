import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import StudentLayout from "./components/StudentLayout";
import LecturerLayout from "./components/LecturerLayout";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import OAuthCallback from "./pages/OAuthCallback";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import StudentDashboard from "./pages/Studentdashboard";
import LecturerDashboard from "./pages/Lecturerdashboard";

import BookingsShell from './pages/BookingsShell';
import BookingFormPage from './pages/BookingFormPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';

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
            <Route path="facilities" element={<FacilitiesPage />} />
          </Route>

          {/* ── STUDENT (static sidebar via StudentLayout) ── */}
          <Route path="/student" element={
            <ProtectedRoute requiredRole="ROLE_STUDENT">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
          </Route>

          {/* ── LECTURER (static sidebar via LecturerLayout) ── */}
          <Route path="/lecturer" element={
            <ProtectedRoute requiredRole="ROLE_LECTURER">
              <LecturerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<LecturerDashboard />} />
          </Route>

          {/* Bookings*/}
          <Route path="/bookings" element={<BookingsShell />}>
            <Route index element={<Navigate to="my" replace />} />
            <Route path="new" element={<BookingFormPage />} />
            <Route path="my" element={<MyBookingsPage />} />
            <Route path="admin" element={<AdminBookingsPage />} />
            <Route path=":id" element={<BookingDetailPage />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
