import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Theme Definitions ────────────────────────────────────────────────────────
const themes = {
  dark: {
    "--bg-base": "#0a0f1e", "--bg-surface": "#111827", "--bg-elevated": "#1a2235",
    "--bg-overlay": "rgba(10,15,30,0.85)", "--bg-overlay-solid": "rgba(10,15,30,0.97)",
    "--accent": "#f5a623", "--accent-dim": "#c4831a", "--accent-hover": "#f0b94f",
    "--accent-glow": "rgba(245,166,35,0.12)", "--accent-border": "rgba(245,166,35,0.3)",
    "--accent-fg": "#0a0f1e",
    "--text-primary": "#f0f4ff", "--text-secondary": "#c4cdd9", "--text-muted": "#8892a4",
    "--border": "rgba(255,255,255,0.07)",
    "--status-green": "#4ade80", "--status-green-bg": "rgba(74,222,128,0.15)",
    "--kpi-bg": "#1a2235", "--toggle-icon": "☀️",
    "--shadow-card": "0 4px 24px rgba(0,0,0,0.3)",
  },
  light: {
    "--bg-base": "#f5f7fa", "--bg-surface": "#ffffff", "--bg-elevated": "#eef1f6",
    "--bg-overlay": "rgba(245,247,250,0.88)", "--bg-overlay-solid": "rgba(245,247,250,0.98)",
    "--accent": "#d4840a", "--accent-dim": "#a86308", "--accent-hover": "#b97110",
    "--accent-glow": "rgba(212,132,10,0.10)", "--accent-border": "rgba(212,132,10,0.35)",
    "--accent-fg": "#ffffff",
    "--text-primary": "#111827", "--text-secondary": "#374151", "--text-muted": "#6b7280",
    "--border": "rgba(0,0,0,0.08)",
    "--status-green": "#15803d", "--status-green-bg": "rgba(21,128,61,0.10)",
    "--kpi-bg": "#f0f3f8", "--toggle-icon": "🌙",
    "--shadow-card": "0 2px 12px rgba(0,0,0,0.08)",
  },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
  :root {
    --font-display: 'Bricolage Grotesque', Georgia, serif;
    --font-body: 'Instrument Sans', system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', 'Courier New', monospace;
    --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px;
    --transition-theme: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root {
    background: var(--bg-base); color: var(--text-primary);
    font-family: var(--font-body); font-size: 15px;
    min-height: 100vh; transition: var(--transition-theme);
  }

  .ud-topbar {
    position: fixed; top: 0; left: 0; right: 0; height: 64px; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px;
    background: var(--bg-overlay); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: var(--transition-theme);
  }
  .ud-logo {
    font-family: var(--font-display); font-size: 18px; font-weight: 700;
    color: var(--text-primary); display: flex; align-items: center; gap: 10px;
    text-decoration: none;
  }
  .ud-logo-icon {
    width: 32px; height: 32px; border-radius: var(--radius-sm);
    background: var(--accent); display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .ud-nav-right { display: flex; align-items: center; gap: 12px; }
  .ud-user-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 14px 6px 6px;
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: 100px; cursor: default;
  }
  .ud-user-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--accent); display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 11px; font-weight: 700; color: var(--accent-fg);
    overflow: hidden;
  }
  .ud-user-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .ud-user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .ud-role-badge {
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    padding: 3px 10px; border-radius: 100px;
    background: var(--status-green-bg); color: var(--status-green);
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .ud-btn-ghost {
    padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer; transition: all 0.2s;
  }
  .ud-btn-ghost:hover { border-color: var(--accent-border); color: var(--text-primary); }
  .ud-theme-toggle {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: all 0.2s;
  }
  .ud-theme-toggle:hover { transform: rotate(12deg) scale(1.1); border-color: var(--accent-border); }

  .ud-main {
    max-width: 900px; margin: 0 auto;
    padding: 100px 40px 60px;
  }
  .ud-greeting {
    font-family: var(--font-display); font-size: 32px; font-weight: 800;
    color: var(--text-primary); margin-bottom: 6px;
  }
  .ud-subtitle { font-size: 15px; color: var(--text-muted); margin-bottom: 40px; }

  .ud-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .ud-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 24px;
    transition: all 0.2s; cursor: pointer;
  }
  .ud-card:hover { border-color: var(--accent-border); transform: translateY(-2px); box-shadow: var(--shadow-card); }
  .ud-card-icon { font-size: 28px; margin-bottom: 14px; }
  .ud-card-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
  .ud-card-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

  .ud-profile-section {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 28px; margin-bottom: 32px;
  }
  .ud-profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .ud-profile-pic {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--accent); display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--accent-fg);
    overflow: hidden;
  }
  .ud-profile-pic img { width: 100%; height: 100%; object-fit: cover; }
  .ud-profile-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); }
  .ud-profile-email { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
  .ud-profile-roles { display: flex; gap: 8px; margin-top: 6px; }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }
`;

function useTheme() {
  const getPreferred = () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const [theme, setTheme] = useState(getPreferred);
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themes[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);
  const toggle = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);
  return { theme, toggle };
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const roleLabels = {
    ROLE_USER: "User",
    ROLE_ADMIN: "Admin",
    ROLE_TECHNICIAN: "Technician",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <header className="ud-topbar">
        <a className="ud-logo" href="/">
          <span className="ud-logo-icon">🏛</span>
          SmartCampus
        </a>
        <div className="ud-nav-right">
          <div className="ud-user-chip">
            <div className="ud-user-avatar">
              {user?.picture ? <img src={user.picture} alt="" /> : getInitials(user?.name)}
            </div>
            <span className="ud-user-name">{user?.name || "User"}</span>
          </div>
          <button className="ud-theme-toggle" onClick={toggle} title="Toggle theme">
            {themes[theme]["--toggle-icon"]}
          </button>
          <button className="ud-btn-ghost" onClick={() => { logout(); navigate("/"); }}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="ud-main">
        <div className="fade-in">
          <h1 className="ud-greeting">Welcome, {user?.name?.split(" ")[0] || "User"} 👋</h1>
          <p className="ud-subtitle">Your SmartCampus dashboard — manage bookings and resources.</p>
        </div>

        {/* Profile Section */}
        <div className="ud-profile-section fade-in-1">
          <div className="ud-profile-header">
            <div className="ud-profile-pic">
              {user?.picture ? <img src={user.picture} alt="" /> : getInitials(user?.name)}
            </div>
            <div>
              <div className="ud-profile-name">{user?.name}</div>
              <div className="ud-profile-email">{user?.email}</div>
              <div className="ud-profile-roles">
                {user?.roles?.map(r => (
                  <span key={r} className="ud-role-badge">{roleLabels[r] || r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ud-cards fade-in-2">
          <div className="ud-card">
            <div className="ud-card-icon">📅</div>
            <div className="ud-card-title">My Bookings</div>
            <div className="ud-card-desc">View and manage your facility reservations.</div>
          </div>
          <div className="ud-card">
            <div className="ud-card-icon">🔧</div>
            <div className="ud-card-title">Report Issue</div>
            <div className="ud-card-desc">Submit a maintenance request for campus facilities.</div>
          </div>
          <div className="ud-card">
            <div className="ud-card-icon">🏛️</div>
            <div className="ud-card-title">Browse Facilities</div>
            <div className="ud-card-desc">Search available rooms, labs, and equipment.</div>
          </div>
          <div className="ud-card">
            <div className="ud-card-icon">📊</div>
            <div className="ud-card-title">My Reports</div>
            <div className="ud-card-desc">Track the status of your submitted reports.</div>
          </div>
        </div>
      </main>
    </>
  );
}
