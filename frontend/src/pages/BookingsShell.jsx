import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import { Outlet } from 'react-router-dom';

/**
 * Shell component that wraps the booking pages with the appropriate sidebar layout
 * based on the current user's role. This ensures the sidebar remains visible 
 * when navigating to any booking-related route.
 */
export default function BookingsShell() {
  const { user } = useAuth();
  
  const role = user?.role || (user?.roles && user.roles[0]) || '';
  const isAdmin = role.includes('ADMIN');
  const isStudent = role.includes('STUDENT');
  const isLecturer = role.includes('LECTURER');

  if (isAdmin) {
    return <AdminLayout />;
  }
  
    // Fallback
  return (
    <div className="bookings-module" style={{padding: '24px'}}>
      <main className="bookings-main">
        <Outlet />
      </main>
    </div>
  );
}
