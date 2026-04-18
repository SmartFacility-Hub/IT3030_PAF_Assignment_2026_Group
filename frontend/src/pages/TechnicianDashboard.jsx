import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Theme Definitions ────────────────────────────────────────────────────────
const themes = {
  dark: {
    "--bg-base": "#0a0f1e", "--bg-surface": "#111827", "--bg-elevated": "#1a2235",
    "--bg-overlay": "rgba(10,15,30,0.85)",
    "--accent": "#f5a623", "--accent-hover": "#f0b94f",
    "--accent-glow": "rgba(245,166,35,0.12)", "--accent-border": "rgba(245,166,35,0.3)",
    "--accent-fg": "#0a0f1e",
    "--text-primary": "#f0f4ff", "--text-secondary": "#c4cdd9", "--text-muted": "#8892a4",
    "--border": "rgba(255,255,255,0.07)",
    "--status-green": "#4ade80", "--status-red": "#f87171", "--status-amber": "#fbbf24",
    "--status-green-bg": "rgba(74,222,128,0.15)", "--status-red-bg": "rgba(248,113,113,0.15)",
    "--status-amber-bg": "rgba(245,166,35,0.15)",
    "--kpi-bg": "#1a2235", "--toggle-icon": "☀️",
    "--shadow-card": "0 4px 24px rgba(0,0,0,0.3)",
  },
  light: {
    "--bg-base": "#f5f7fa", "--bg-surface": "#ffffff", "--bg-elevated": "#eef1f6",
    "--bg-overlay": "rgba(245,247,250,0.88)",
    "--accent": "#d4840a", "--accent-hover": "#b97110",
    "--accent-glow": "rgba(212,132,10,0.10)", "--accent-border": "rgba(212,132,10,0.35)",
    "--accent-fg": "#ffffff",
    "--text-primary": "#111827", "--text-secondary": "#374151", "--text-muted": "#6b7280",
    "--border": "rgba(0,0,0,0.08)",
    "--status-green": "#15803d", "--status-red": "#dc2626", "--status-amber": "#d97706",
    "--status-green-bg": "rgba(21,128,61,0.10)", "--status-red-bg": "rgba(220,38,38,0.10)",
    "--status-amber-bg": "rgba(212,132,10,0.12)",
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
    --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
    --transition-theme: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root {
    background: var(--bg-base); color: var(--text-primary);
    font-family: var(--font-body); font-size: 15px;
    min-height: 100vh; transition: var(--transition-theme);
  }

  .td-topbar {
    position: fixed; top: 0; left: 0; right: 0; height: 64px; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px;
    background: var(--bg-overlay); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .td-logo {
    font-family: var(--font-display); font-size: 18px; font-weight: 700;
    color: var(--text-primary); display: flex; align-items: center; gap: 10px;
    text-decoration: none;
  }
  .td-logo-icon {
    width: 32px; height: 32px; border-radius: var(--radius-sm);
    background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 16px;
  }
  .td-nav-right { display: flex; align-items: center; gap: 12px; }
  .td-user-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 14px 6px 6px;
    background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 100px;
  }
  .td-user-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--accent); display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 11px; font-weight: 700; color: var(--accent-fg);
    overflow: hidden;
  }
  .td-user-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .td-user-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .td-role-badge {
    font-family: var(--font-mono); font-size: 10px;
    padding: 3px 10px; border-radius: 100px;
    background: var(--status-amber-bg); color: var(--status-amber);
    text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500;
  }
  .td-btn-ghost {
    padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer; transition: all 0.2s;
  }
  .td-btn-ghost:hover { border-color: var(--accent-border); color: var(--text-primary); }
  .td-theme-toggle {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: all 0.2s;
  }
  .td-theme-toggle:hover { transform: rotate(12deg) scale(1.1); border-color: var(--accent-border); }

  .td-main { max-width: 1000px; margin: 0 auto; padding: 100px 40px 60px; }
  .td-greeting { font-family: var(--font-display); font-size: 28px; font-weight: 800; margin-bottom: 6px; }
  .td-subtitle { font-size: 14px; color: var(--text-muted); margin-bottom: 32px; }

  .td-table-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 24px;
  }
  .td-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid var(--border);
  }
  .td-table-title {
    font-family: var(--font-display); font-size: 15px; font-weight: 700;
    display: flex; align-items: center; gap: 8px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th {
    font-family: var(--font-mono); font-size: 9.5px; font-weight: 500;
    color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;
    padding: 10px 16px; text-align: left;
  }
  th:first-child { padding-left: 22px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--bg-elevated); }
  td { padding: 12px 16px; color: var(--text-secondary); }
  td:first-child { padding-left: 22px; color: var(--text-primary); font-weight: 500; }

  .td-badge {
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    padding: 3px 10px; border-radius: 100px; display: inline-flex; align-items: center; gap: 5px;
  }
  .td-badge-dot { width: 5px; height: 5px; border-radius: 50%; }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
`;

// Mock data for assigned incidents
const assignedIncidents = [
  { id: "INC-092", title: "Projector fault — Lab A-102",       priority: "High",   status: "open",     location: "Block A, Room 102" },
  { id: "INC-091", title: "AC not cooling — Block B Room 201", priority: "Medium", status: "progress", location: "Block B, Room 201" },
  { id: "INC-090", title: "Network switch fault — Server Rm.", priority: "High",   status: "progress", location: "Server Room" },
  { id: "INC-089", title: "Door lock malfunction — Lab 5",     priority: "Low",    status: "open",     location: "Block C, Lab 5" },
];

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

export default function TechnicianDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "T";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <header className="td-topbar">
        <a className="td-logo" href="/">
          <span className="td-logo-icon">🏛</span>
          SmartCampus
        </a>
        <div className="td-nav-right">
          <div className="td-user-chip">
            <div className="td-user-avatar">
              {user?.picture ? <img src={user.picture} alt="" /> : getInitials(user?.name)}
            </div>
            <span className="td-user-name">{user?.name || "Technician"}</span>
          </div>
          <span className="td-role-badge">Technician</span>
          <button className="td-theme-toggle" onClick={toggle} title="Toggle theme">
            {themes[theme]["--toggle-icon"]}
          </button>
          <button className="td-btn-ghost" onClick={() => { logout(); navigate("/"); }}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="td-main">
        <div className="fade-in">
          <h1 className="td-greeting">⚙️ Technician Dashboard</h1>
          <p className="td-subtitle">View and manage your assigned maintenance incidents.</p>
        </div>

        <div className="td-table-card fade-in-1">
          <div className="td-table-header">
            <div className="td-table-title"><span>🔧</span> Assigned Incidents</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Issue</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignedIncidents.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{t.id}</td>
                  <td>{t.title}</td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.location}</td>
                  <td>
                    <span className="td-badge" style={{
                      background: t.priority === "High" ? "var(--status-red-bg)" : t.priority === "Medium" ? "var(--status-amber-bg)" : "var(--bg-elevated)",
                      color: t.priority === "High" ? "var(--status-red)" : t.priority === "Medium" ? "var(--status-amber)" : "var(--text-muted)",
                    }}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className="td-badge" style={{
                      background: t.status === "open" ? "var(--status-red-bg)" : t.status === "progress" ? "var(--status-amber-bg)" : "var(--status-green-bg)",
                      color: t.status === "open" ? "var(--status-red)" : t.status === "progress" ? "var(--status-amber)" : "var(--status-green)",
                    }}>
                      <span className="td-badge-dot" style={{
                        background: t.status === "open" ? "var(--status-red)" : t.status === "progress" ? "var(--status-amber)" : "var(--status-green)",
                      }} />
                      {t.status === "progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
