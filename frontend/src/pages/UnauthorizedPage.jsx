import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  .unauth-container {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 100vh;
    background: #0a0f1e;
    color: #f0f4ff;
    font-family: 'Instrument Sans', system-ui, sans-serif;
    text-align: center;
    padding: 40px 20px;
  }
  .unauth-icon {
    width: 80px; height: 80px;
    border-radius: 20px;
    background: rgba(248,113,113,0.12);
    border: 1px solid rgba(248,113,113,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px;
    margin-bottom: 28px;
  }
  .unauth-code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 64px; font-weight: 800;
    color: #f87171;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 12px;
  }
  .unauth-title {
    font-family: 'Bricolage Grotesque', serif;
    font-size: 28px; font-weight: 700;
    margin-bottom: 12px;
  }
  .unauth-desc {
    font-size: 15px; color: #8892a4;
    max-width: 400px; line-height: 1.7;
    margin-bottom: 32px;
  }
  .unauth-actions { display: flex; gap: 12px; }
  .unauth-btn {
    padding: 10px 22px;
    border-radius: 10px;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  .unauth-btn-primary {
    background: #f5a623; color: #0a0f1e;
  }
  .unauth-btn-primary:hover { background: #f0b94f; transform: translateY(-1px); }
  .unauth-btn-ghost {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.07);
    color: #c4cdd9;
  }
  .unauth-btn-ghost:hover { border-color: rgba(245,166,35,0.3); color: #f0f4ff; }
`;

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="unauth-container">
        <div className="unauth-icon">🚫</div>
        <div className="unauth-code">403</div>
        <h1 className="unauth-title">Access Denied</h1>
        <p className="unauth-desc">
          You don't have the required permissions to access this page.
          Contact your administrator if you believe this is an error.
        </p>
        <div className="unauth-actions">
          <button className="unauth-btn unauth-btn-primary" onClick={() => navigate('/')}>
            ← Go Home
          </button>
          {isAuthenticated && (
            <button className="unauth-btn unauth-btn-ghost" onClick={() => { logout(); navigate('/'); }}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </>
  );
}
