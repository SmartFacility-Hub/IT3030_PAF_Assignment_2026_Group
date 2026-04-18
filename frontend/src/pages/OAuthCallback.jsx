import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('Processing login...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      login(token);

      setTimeout(() => {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));
          const roles = payload.roles || [];

          // ── Role-based redirect ──────────────────────────
          if (roles.includes('ROLE_ADMIN')) {
            navigate('/admin', { replace: true });
          } else if (roles.includes('ROLE_TECHNICIAN')) {
            navigate('/technician', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
          // ────────────────────────────────────────────────

        } catch {
          navigate('/dashboard', { replace: true });
        }
      }, 100);
    } else {
      setStatus('Login failed — no token received.');
      setTimeout(() => navigate('/', { replace: true }), 2000);
    }
  }, [searchParams, login, navigate]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0a0f1e',
      color: '#f0f4ff',
      fontFamily: "'Instrument Sans', system-ui, sans-serif",
      gap: '16px',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid rgba(245,166,35,0.3)',
        borderTopColor: '#f5a623',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontSize: '16px', color: '#8892a4' }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}