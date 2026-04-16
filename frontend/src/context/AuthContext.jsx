import { createContext, useContext, useState, useEffect, useCallback } from 'react';


const AuthContext = createContext(null);

/**
 * Decode a JWT token's payload (without verification — we trust
 * the backend already verified it).
 */
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // ── Initialize from stored token ──
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({
          email: decoded.sub,
          name: decoded.name,
          picture: decoded.picture,
          userId: decoded.userId,
          roles: decoded.roles || [],
        });
        setToken(storedToken);
      } else {
        // Token expired
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    const decoded = decodeToken(newToken);
    if (decoded) {
      setUser({
        email: decoded.sub,
        name: decoded.name,
        picture: decoded.picture,
        userId: decoded.userId,
        roles: decoded.roles || [],
      });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role) => {
      return user?.roles?.includes(role) || false;
    },
    [user]
  );

  const isAdmin = useCallback(() => hasRole('ROLE_ADMIN'), [hasRole]);
  const isTechnician = useCallback(() => hasRole('ROLE_TECHNICIAN'), [hasRole]);
  const isUser = useCallback(() => hasRole('ROLE_USER'), [hasRole]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
    isAdmin,
    isTechnician,
    isUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
