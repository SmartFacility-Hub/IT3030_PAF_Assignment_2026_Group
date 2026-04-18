import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps a route that requires authentication and optionally a specific role.
 *
 * Props:
 *   - children: the component to render if authorized
 *   - requiredRole: (optional) e.g. "ROLE_ADMIN", "ROLE_TECHNICIAN"
 *   - requiredRoles: (optional) array of roles, user must have at least one
 */
export default function ProtectedRoute({ children, requiredRole, requiredRoles }) {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-base, #0a0f1e)',
        color: 'var(--text-muted, #8892a4)',
        fontFamily: "'Instrument Sans', system-ui, sans-serif",
        fontSize: '14px',
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check single required role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check multiple roles (user needs at least one)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some((role) => hasRole(role));
    if (!hasAnyRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}
