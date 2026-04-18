import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
  :root {
    --font-display: 'Bricolage Grotesque', Georgia, serif;
    --font-body:    'Instrument Sans', system-ui, sans-serif;
    --font-mono:    'JetBrains Mono', 'Courier New', monospace;
    --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px;
    --transition-theme: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
    --sidebar-w: 250px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body, #root {
    background: var(--bg-base); color: var(--text-primary);
    font-family: var(--font-body); font-size: 15px; line-height: 1.6;
    min-height: 100vh; overflow-x: hidden; transition: var(--transition-theme);
  }

  .sidebar {
    width: var(--sidebar-w); min-height: 100vh;
    background: var(--bg-surface); border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 50; overflow-y: auto;
    transition: var(--transition-theme), transform 0.3s ease;
    scrollbar-width: thin; scrollbar-color: var(--bg-elevated) transparent;
  }
  .sidebar::-webkit-scrollbar { width: 6px; }
  .sidebar::-webkit-scrollbar-track { background: transparent; }
  .sidebar::-webkit-scrollbar-thumb { background: var(--bg-elevated); border-radius: 100px; }
  .sidebar.collapsed { transform: translateX(calc(-1 * var(--sidebar-w))); }

  .sidebar-logo {
    display: flex; align-items: center; gap: 10px; padding: 20px 20px 0;
    font-family: var(--font-display); font-size: 17px; font-weight: 700;
    color: var(--text-primary); letter-spacing: -0.02em; text-decoration: none; flex-shrink: 0;
  }
  .sidebar-logo-icon {
    width: 34px; height: 34px; background: var(--accent);
    border-radius: var(--radius-sm); display: flex; align-items: center;
    justify-content: center; font-size: 17px; flex-shrink: 0;
  }
  .sidebar-role-badge {
    margin: 14px 20px 20px; padding: 7px 12px;
    background: var(--status-violet-bg); border: 1px solid rgba(167,139,250,0.3);
    border-radius: var(--radius-sm); font-family: var(--font-mono);
    font-size: 10px; font-weight: 500; color: var(--status-violet);
    letter-spacing: 0.1em; text-transform: uppercase;
    display: flex; align-items: center; gap: 6px;
  }
  .role-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--status-violet); animation: pulse 2s infinite; }
  .sidebar-nav { flex: 1; padding: 0 12px; }
  .sidebar-section-label {
    font-family: var(--font-mono); font-size: 9px; font-weight: 500;
    color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase;
    padding: 0 8px; margin: 20px 0 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px;
    border-radius: var(--radius-sm); font-size: 13.5px; color: var(--text-secondary);
    cursor: pointer; margin-bottom: 2px;
    border: 1px solid transparent; transition: all 0.15s; user-select: none;
  }
  .nav-item:hover { background: var(--bg-elevated); color: var(--text-primary); }
  .nav-item.active { background: var(--status-violet-bg); color: var(--status-violet); border-color: rgba(167,139,250,0.3); font-weight: 600; }
  .nav-item-icon { font-size: 15px; flex-shrink: 0; }
  .nav-item-label { flex: 1; }
  .nav-badge {
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-mono); font-size: 9px; font-weight: 700;
    padding: 2px 7px; border-radius: 100px;
  }
  .nav-badge.red { background: var(--status-red); color: #fff; }

  .sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border); flex-shrink: 0; }
  .user-profile {
    display: flex; align-items: center; gap: 10px; padding: 10px;
    border-radius: var(--radius-sm); cursor: pointer; transition: background 0.15s;
  }
  .user-profile:hover { background: var(--bg-elevated); }
  .profile-avatar {
    width: 34px; height: 34px; border-radius: 50%; background: var(--status-violet);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 12px; font-weight: 700;
    color: #fff; flex-shrink: 0; overflow: hidden;
  }
  .profile-info { flex: 1; min-width: 0; }
  .profile-name  { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .profile-email { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .topbar {
    position: fixed; top: 0; left: var(--sidebar-w); right: 0; height: 60px;
    background: var(--bg-overlay); backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 16px;
    padding: 0 32px; z-index: 40;
    transition: var(--transition-theme), left 0.3s ease;
  }
  .topbar.sidebar-collapsed { left: 0; }
  .topbar-menu-btn {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: var(--text-secondary); transition: all 0.2s; flex-shrink: 0;
  }
  .topbar-menu-btn:hover { border-color: rgba(167,139,250,0.4); color: var(--status-violet); }
  .topbar-breadcrumb {
    flex: 1; font-family: var(--font-display);
    font-size: 17px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;
  }
  .topbar-breadcrumb span { color: var(--text-muted); font-weight: 400; font-size: 14px; margin-left: 8px; }
  .topbar-search {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 7px 14px;
    font-family: var(--font-body); font-size: 13px; color: var(--text-muted);
    width: 200px; cursor: pointer; transition: all 0.2s;
  }
  .topbar-search:hover { border-color: rgba(167,139,250,0.4); }
  .search-kbd {
    margin-left: auto; font-family: var(--font-mono); font-size: 10px;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 4px; padding: 1px 5px; color: var(--text-muted);
  }
  .topbar-actions { display: flex; gap: 8px; align-items: center; }
  .icon-btn {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: var(--text-secondary); transition: all 0.2s; position: relative;
  }
  .icon-btn:hover { border-color: rgba(167,139,250,0.4); color: var(--status-violet); background: var(--status-violet-bg); }
  .notif-dot {
    position: absolute; top: 6px; right: 6px;
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--status-red); border: 2px solid var(--bg-surface);
  }
  .theme-toggle {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: var(--transition-theme), transform 0.2s;
  }
  .theme-toggle:hover { transform: rotate(12deg) scale(1.1); border-color: var(--accent-border); }

  .lecturer-page-content {
    margin-left: var(--sidebar-w); margin-top: 60px;
    min-height: calc(100vh - 60px); transition: margin-left 0.3s ease;
  }
  .lecturer-page-content.sidebar-collapsed { margin-left: 0; }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .topbar { left: 0 !important; }
    .lecturer-page-content { margin-left: 0 !important; }
  }
`;

const themes = {
  dark: {
    "--bg-base": "#0a0f1e", "--bg-surface": "#111827", "--bg-elevated": "#1a2235",
    "--bg-overlay": "rgba(10,15,30,0.85)", "--accent": "#f5a623", "--accent-hover": "#f0b94f",
    "--accent-glow": "rgba(245,166,35,0.12)", "--accent-border": "rgba(245,166,35,0.3)",
    "--accent-fg": "#0a0f1e", "--text-primary": "#f0f4ff", "--text-secondary": "#c4cdd9",
    "--text-muted": "#8892a4", "--border": "rgba(255,255,255,0.07)",
    "--status-green": "#4ade80", "--status-red": "#f87171", "--status-blue": "#60a5fa",
    "--status-amber": "#fbbf24", "--status-violet": "#a78bfa",
    "--status-green-bg": "rgba(74,222,128,0.15)", "--status-red-bg": "rgba(248,113,113,0.15)",
    "--status-blue-bg": "rgba(96,165,250,0.15)", "--status-amber-bg": "rgba(245,166,35,0.15)",
    "--status-violet-bg": "rgba(167,139,250,0.15)", "--shadow-card": "0 4px 24px rgba(0,0,0,0.3)",
  },
  light: {
    "--bg-base": "#f5f7fa", "--bg-surface": "#ffffff", "--bg-elevated": "#eef1f6",
    "--bg-overlay": "rgba(245,247,250,0.88)", "--accent": "#d4840a", "--accent-hover": "#b97110",
    "--accent-glow": "rgba(212,132,10,0.10)", "--accent-border": "rgba(212,132,10,0.35)",
    "--accent-fg": "#ffffff", "--text-primary": "#111827", "--text-secondary": "#374151",
    "--text-muted": "#6b7280", "--border": "rgba(0,0,0,0.08)",
    "--status-green": "#15803d", "--status-red": "#dc2626", "--status-blue": "#2563eb",
    "--status-amber": "#d97706", "--status-violet": "#7c3aed",
    "--status-green-bg": "rgba(21,128,61,0.10)", "--status-red-bg": "rgba(220,38,38,0.10)",
    "--status-blue-bg": "rgba(37,99,235,0.10)", "--status-amber-bg": "rgba(212,132,10,0.12)",
    "--status-violet-bg": "rgba(124,58,237,0.10)", "--shadow-card": "0 2px 12px rgba(0,0,0,0.08)",
  },
};

const breadcrumbs = {
  "/lecturer":           { title: "My Dashboard",  sub: "Lecturer" },
  "/bookings/my":        { title: "My Bookings",   sub: "Reservations" },
  "/bookings/new":       { title: "New Booking",   sub: "Reservations" },
  "/lecturer/incidents": { title: "My Incidents",  sub: "Reports" },
};

const routeToNavId = {
  "/lecturer":           "dashboard",
  "/bookings/my":        "bookings",
  "/bookings/new":       "new",
  "/lecturer/incidents": "incidents",
};

const navSections = [
  {
    label: "Overview",
    items: [
      { icon: "📊", label: "Dashboard",     id: "dashboard", route: "/lecturer" },
      { icon: "🔔", label: "Notifications", id: "notifs",    route: "/lecturer/notifications", badge: "2" },
    ],
  },
  {
    label: "Schedule & Bookings",
    items: [
      { icon: "📅", label: "My Schedule",   id: "schedule",  route: "/lecturer/schedule" },
      { icon: "🏛️", label: "New Booking",  id: "book",      route: "/bookings/new" },
      { icon: "📋", label: "My Bookings",   id: "bookings",  route: "/bookings/my" },
    ],
  },
  {
    label: "Maintenance",
    items: [
      { icon: "🔧", label: "My Incidents",  id: "incidents", route: "/lecturer/incidents", badge: "1", badgeRed: true },
      { icon: "📝", label: "Report Issue",  id: "report",    route: "/lecturer/report" },
    ],
  },
];

export default function LecturerLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themes[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const activeNavId = routeToNavId[location.pathname] || "dashboard";
  const crumb = breadcrumbs[location.pathname] || { title: "My Dashboard", sub: "Faculty" };

  const getInitials = (name) =>
    name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${sidebarOpen ? "" : " collapsed"}`}>
        <a className="sidebar-logo" href="/lecturer">
          <span className="sidebar-logo-icon">🏛</span>
          SmartCampus
        </a>
        <div className="sidebar-role-badge">
          <span className="role-dot" />
          Faculty Portal
        </div>
        <nav className="sidebar-nav">
          {navSections.map(sec => (
            <div key={sec.label}>
              <div className="sidebar-section-label">{sec.label}</div>
              {sec.items.map(item => (
                <div
                  key={item.id}
                  className={`nav-item${activeNavId === item.id ? " active" : ""}`}
                  onClick={() => navigate(item.route)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                  {item.badge && (
                    <span className={`nav-badge${item.badgeRed ? " red" : ""}`}>{item.badge}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile" onClick={handleLogout} title="Sign out">
            <div className="profile-avatar">
              {user?.picture
                ? <img src={user.picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : getInitials(user?.name)}
            </div>
            <div className="profile-info">
              <div className="profile-name">{user?.name || "Lecturer"}</div>
              <div className="profile-email">{user?.email || "—"}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── TOPBAR ── */}
      <header className={`topbar${sidebarOpen ? "" : " sidebar-collapsed"}`}>
        <button className="topbar-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? "←" : "☰"}
        </button>
        <div className="topbar-breadcrumb">
          {crumb.title} <span>/ {crumb.sub}</span>
        </div>
        <div className="topbar-search">
          <span>🔍</span> Search rooms, schedules…<span className="search-kbd">⌘K</span>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn">🔔<span className="notif-dot" /></button>
          <button className="icon-btn">❓</button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <div className={`lecturer-page-content${sidebarOpen ? "" : " sidebar-collapsed"}`}>
        <Outlet />
      </div>
    </>
  );
}