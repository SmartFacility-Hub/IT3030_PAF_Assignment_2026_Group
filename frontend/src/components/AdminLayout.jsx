import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { ticketApi } from "../services/api";

const themes = {
  dark: {
    "--bg-base":          "#0a0f1e",
    "--bg-surface":       "#111827",
    "--bg-elevated":      "#1a2235",
    "--bg-overlay":       "rgba(10,15,30,0.85)",
    "--accent":           "#f5a623",
    "--accent-dim":       "#c4831a",
    "--accent-hover":     "#f0b94f",
    "--accent-glow":      "rgba(245,166,35,0.12)",
    "--accent-border":    "rgba(245,166,35,0.3)",
    "--accent-fg":        "#0a0f1e",
    "--text-primary":     "#f0f4ff",
    "--text-secondary":   "#c4cdd9",
    "--text-muted":       "#8892a4",
    "--border":           "rgba(255,255,255,0.07)",
    "--status-green":     "#4ade80",
    "--status-red":       "#f87171",
    "--status-blue":      "#60a5fa",
    "--status-amber":     "#fbbf24",
    "--status-green-bg":  "rgba(74,222,128,0.15)",
    "--status-red-bg":    "rgba(248,113,113,0.15)",
    "--status-blue-bg":   "rgba(96,165,250,0.15)",
    "--status-amber-bg":  "rgba(245,166,35,0.15)",
    "--shadow-card":      "0 4px 24px rgba(0,0,0,0.3)",
  },
  light: {
    "--bg-base":          "#f5f7fa",
    "--bg-surface":       "#ffffff",
    "--bg-elevated":      "#eef1f6",
    "--bg-overlay":       "rgba(245,247,250,0.88)",
    "--accent":           "#d4840a",
    "--accent-dim":       "#a86308",
    "--accent-hover":     "#b97110",
    "--accent-glow":      "rgba(212,132,10,0.10)",
    "--accent-border":    "rgba(212,132,10,0.35)",
    "--accent-fg":        "#ffffff",
    "--text-primary":     "#111827",
    "--text-secondary":   "#374151",
    "--text-muted":       "#6b7280",
    "--border":           "rgba(0,0,0,0.08)",
    "--status-green":     "#15803d",
    "--status-red":       "#dc2626",
    "--status-blue":      "#2563eb",
    "--status-amber":     "#d97706",
    "--status-green-bg":  "rgba(21,128,61,0.10)",
    "--status-red-bg":    "rgba(220,38,38,0.10)",
    "--status-blue-bg":   "rgba(37,99,235,0.10)",
    "--status-amber-bg":  "rgba(212,132,10,0.12)",
    "--shadow-card":      "0 2px 12px rgba(0,0,0,0.08)",
  },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --font-display: 'Bricolage Grotesque', Georgia, serif;
    --font-body:    'Instrument Sans', system-ui, sans-serif;
    --font-mono:    'JetBrains Mono', 'Courier New', monospace;
    --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px;
    --transition-theme: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    --sidebar-w: 260px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body, #root {
    background: var(--bg-base); color: var(--text-primary);
    font-family: var(--font-body); font-size: 15px; line-height: 1.6;
    min-height: 100vh; overflow-x: hidden; transition: var(--transition-theme);
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w); min-height: 100vh;
    background: var(--bg-surface); border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 50; overflow-y: auto;
    transition: var(--transition-theme), transform 0.3s ease;
    scrollbar-width: thin;
    scrollbar-color: var(--bg-elevated) transparent;
  }
  .sidebar::-webkit-scrollbar { width: 6px; }
  .sidebar::-webkit-scrollbar-track { background: transparent; }
  .sidebar::-webkit-scrollbar-thumb { background: var(--bg-elevated); border-radius: 100px; }
  .sidebar::-webkit-scrollbar-thumb:hover { background: var(--accent); }
  .sidebar.collapsed { transform: translateX(calc(-1 * var(--sidebar-w))); }

  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 20px 0; font-family: var(--font-display);
    font-size: 17px; font-weight: 700; color: var(--text-primary);
    letter-spacing: -0.02em; text-decoration: none; flex-shrink: 0;
  }
  .sidebar-logo-icon {
    width: 34px; height: 34px; background: var(--accent);
    border-radius: var(--radius-sm); display: flex; align-items: center;
    justify-content: center; font-size: 17px; flex-shrink: 0;
  }
  .sidebar-role-badge {
    margin: 14px 20px 20px; padding: 7px 12px;
    background: var(--accent-glow); border: 1px solid var(--accent-border);
    border-radius: var(--radius-sm); font-family: var(--font-mono);
    font-size: 10px; font-weight: 500; color: var(--accent);
    letter-spacing: 0.1em; text-transform: uppercase;
    display: flex; align-items: center; gap: 6px;
  }
  .role-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent); animation: pulse 2s infinite;
  }
  .sidebar-nav { flex: 1; padding: 0 12px; }
  .sidebar-section-label {
    font-family: var(--font-mono); font-size: 9px; font-weight: 500;
    color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase;
    padding: 0 8px; margin: 20px 0 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--radius-sm);
    font-size: 13.5px; font-weight: 400; color: var(--text-secondary);
    cursor: pointer; margin-bottom: 2px;
    transition: all 0.15s; border: 1px solid transparent; user-select: none;
  }
  .nav-item:hover { background: var(--bg-elevated); color: var(--text-primary); }
  .nav-item.active {
    background: var(--accent-glow); color: var(--accent);
    border-color: var(--accent-border); font-weight: 600;
  }
  .nav-item-icon { font-size: 15px; flex-shrink: 0; }
  .nav-item-label { flex: 1; }
  .nav-badge {
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-mono); font-size: 9px; font-weight: 700;
    padding: 2px 7px; border-radius: 100px; min-width: 20px; text-align: center;
  }
  .nav-badge.red { background: var(--status-red); color: #fff; }

  .sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border); flex-shrink: 0; }
  .admin-profile {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; border-radius: var(--radius-sm);
    cursor: pointer; transition: background 0.15s;
  }
  .admin-profile:hover { background: var(--bg-elevated); }
  .profile-avatar {
    width: 34px; height: 34px; border-radius: 50%; background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 12px; font-weight: 700;
    color: var(--accent-fg); flex-shrink: 0; overflow: hidden;
  }
  .profile-info { flex: 1; min-width: 0; }
  .profile-name  { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .profile-email { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* ── TOPBAR ── */
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
    font-size: 15px; flex-shrink: 0; transition: all 0.2s; color: var(--text-secondary);
  }
  .topbar-menu-btn:hover { border-color: var(--accent-border); color: var(--accent); }
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
    width: 220px; cursor: pointer; transition: all 0.2s;
  }
  .topbar-search:hover { border-color: var(--accent-border); }
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
  .icon-btn:hover { border-color: var(--accent-border); color: var(--accent); background: var(--accent-glow); }
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

  /* ── PAGE OUTLET ── */
  .admin-page-content {
    margin-left: var(--sidebar-w); margin-top: 60px;
    min-height: calc(100vh - 60px);
    transition: margin-left 0.3s ease;
  }
  .admin-page-content.sidebar-collapsed { margin-left: 0; }

  /* ── ANIMATIONS ── */
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.mobile-open { transform: translateX(0); }
    .topbar { left: 0 !important; }
    .admin-page-content { margin-left: 0 !important; }
  }
`;

// ── Route → breadcrumb label map ──
const breadcrumbs = {
  "/admin":             { title: "Dashboard",              sub: "Overview" },
  "/admin/facilities":  { title: "Facilities",             sub: "Catalogue" },
  "/admin/bookings":    { title: "Bookings",               sub: "Management" },
  "/admin/incidents":   { title: "Incidents",              sub: "Tickets" },
  "/admin/users":       { title: "Users & Roles",          sub: "Management" },
  "/admin/analytics":   { title: "Analytics",              sub: "Reports" },
  "/admin/settings":    { title: "Settings",               sub: "Configuration" },
};

// ── Route → nav id map ──
const routeToNavId = {
  "/admin":             "dashboard",
  "/admin/facilities":  "facilities",
  "/admin/bookings":    "bookings",
  "/admin/incidents":   "incidents",
  "/admin/technicians": "technicians",
  "/admin/users":       "users",
  "/admin/analytics":   "analytics",
  "/admin/settings":    "settings",
  "/admin/audit":       "audit",
};

const navSections = [
  {
    label: "Overview",
    items: [
      { icon: "📊", label: "Dashboard",    id: "dashboard",   route: "/admin" },
      { icon: "📋", label: "Audit Log",    id: "audit",       route: "/admin/audit" },
    ],
  },
  {
    label: "Resources",
    items: [
      { icon: "🏛️", label: "Facilities & Assets",  id: "facilities",  route: "/admin/facilities" },
    ],
  },
  {
    label: "Operations",
    items: [
      { icon: "📅", label: "Bookings",     id: "bookings",    route: "/admin/bookings",    badge: "4" },
      { icon: "🔧", label: "Incidents",    id: "incidents",   route: "/admin/incidents",   badgeRed: true },
      { icon: "👷", label: "Technicians",  id: "technicians", route: "/admin/technicians" },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: "👥", label: "Users & Roles", id: "users",      route: "/admin/users" },
      { icon: "📈", label: "Analytics",     id: "analytics",  route: "/admin/analytics" },
      { icon: "⚙️", label: "Settings",     id: "settings",   route: "/admin/settings" },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [incidentBadge, setIncidentBadge] = useState(null);
  const [theme, setTheme] = useState(
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await ticketApi.fetchAll();
        if (cancelled) return;
        const list = res.data || [];
        const n = list.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
        setIncidentBadge(String(n));
      } catch {
        if (!cancelled) setIncidentBadge("—");
      }
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  // Apply theme tokens
  const applyTheme = (t) => {
    const root = document.documentElement;
    Object.entries(themes[t]).forEach(([k, v]) => root.style.setProperty(k, v));
  };

  // Apply on mount + change
  if (typeof window !== "undefined") {
    applyTheme(theme);
  }

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const activeNavId = routeToNavId[location.pathname] || "dashboard";
  const crumb = breadcrumbs[location.pathname] || { title: "Dashboard", sub: "Overview" };

  const getInitials = (name) =>
    name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${sidebarOpen ? "" : " collapsed"}`}>
        <a className="sidebar-logo" href="/admin">
          <span className="sidebar-logo-icon">🏛</span>
          SmartCampus
        </a>
        <div className="sidebar-role-badge">
          <span className="role-dot" />
          Administrator
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
                  {(item.id === "incidents" ? incidentBadge != null : item.badge) && (
                    <span className={`nav-badge${item.badgeRed ? " red" : ""}`}>
                      {item.id === "incidents" ? incidentBadge : item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile" onClick={handleLogout} title="Sign out">
            <div className="profile-avatar">
              {user?.picture
                ? <img src={user.picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : getInitials(user?.name)}
            </div>
            <div className="profile-info">
              <div className="profile-name">{user?.name || "Admin"}</div>
              <div className="profile-email">{user?.email || "—"}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── TOPBAR ── */}
      <header className={`topbar${sidebarOpen ? "" : " sidebar-collapsed"}`}>
        <button className="topbar-menu-btn" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
          {sidebarOpen ? "←" : "☰"}
        </button>
        <div className="topbar-breadcrumb">
          {crumb.title} <span>/ {crumb.sub}</span>
        </div>
        <div className="topbar-search">
          <span>🔍</span>
          Search anything…
          <span className="search-kbd">⌘K</span>
        </div>
        <div className="topbar-actions">
          <NotificationBell />
          <button className="icon-btn" title="Help">❓</button>
        </div>
      </header>

      {/* ── PAGE CONTENT (child route renders here) ── */}
      <div className={`admin-page-content${sidebarOpen ? "" : " sidebar-collapsed"}`}>
        <Outlet />
      </div>
    </>
  );
}