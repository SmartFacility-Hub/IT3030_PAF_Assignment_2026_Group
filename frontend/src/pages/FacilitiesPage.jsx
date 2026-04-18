import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import facilityService from "../services/facilityService";

// ─── Same theme tokens as your other pages ────────────────────────────────────
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
    --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
    --transition-theme: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
    --sidebar-w: 260px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root {
    background: var(--bg-base); color: var(--text-primary);
    font-family: var(--font-body); font-size: 15px; line-height: 1.6;
    min-height: 100vh; overflow-x: hidden; transition: var(--transition-theme);
  }

  /* ── LAYOUT ── */
  .sidebar {
    width: var(--sidebar-w); min-height: 100vh;
    background: var(--bg-surface); border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 50; overflow-y: auto;
    transition: var(--transition-theme), transform 0.3s ease;
  }
  .sidebar.collapsed { transform: translateX(calc(-1 * var(--sidebar-w))); }
  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 20px 0; font-family: var(--font-display);
    font-size: 17px; font-weight: 700; color: var(--text-primary);
    letter-spacing: -0.02em; text-decoration: none;
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
  .role-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
  .sidebar-nav { flex: 1; padding: 0 12px; }
  .sidebar-section-label {
    font-family: var(--font-mono); font-size: 9px; font-weight: 500;
    color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase;
    padding: 0 8px; margin: 20px 0 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--radius-sm);
    font-size: 13.5px; color: var(--text-secondary);
    cursor: pointer; margin-bottom: 2px;
    border: 1px solid transparent; transition: all 0.15s; user-select: none;
  }
  .nav-item:hover { background: var(--bg-elevated); color: var(--text-primary); }
  .nav-item.active { background: var(--accent-glow); color: var(--accent); border-color: var(--accent-border); font-weight: 600; }
  .nav-item-icon { font-size: 15px; flex-shrink: 0; }
  .nav-item-label { flex: 1; }
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
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 16px;
    padding: 0 32px; z-index: 40;
    transition: var(--transition-theme), left 0.3s ease;
  }
  .topbar.collapsed { left: 0; }
  .topbar-menu-btn {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: var(--text-secondary); transition: all 0.2s; flex-shrink: 0;
  }
  .topbar-menu-btn:hover { border-color: var(--accent-border); color: var(--accent); }
  .topbar-breadcrumb {
    flex: 1; font-family: var(--font-display);
    font-size: 17px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;
  }
  .topbar-breadcrumb span { color: var(--text-muted); font-weight: 400; font-size: 14px; margin-left: 8px; }
  .topbar-actions { display: flex; gap: 8px; align-items: center; }
  .icon-btn {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: var(--text-secondary); transition: all 0.2s;
  }
  .icon-btn:hover { border-color: var(--accent-border); color: var(--accent); background: var(--accent-glow); }

  /* ── MAIN ── */
  .main-content {
    margin-left: var(--sidebar-w); margin-top: 60px;
    padding: 32px; min-height: calc(100vh - 60px);
    transition: margin-left 0.3s ease;
  }
  .main-content.collapsed { margin-left: 0; }

  /* ── PAGE HEADER ── */
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; gap: 16px; }
  .page-label {
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
  }
  .page-label::before { content: ''; display: block; width: 18px; height: 1px; background: var(--accent); }
  .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.025em; line-height: 1.1; }
  .page-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
  .page-header-right { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

  /* ── KPI STRIP ── */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .kpi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 18px 20px; position: relative; overflow: hidden;
    transition: all 0.2s;
  }
  .kpi-card:hover { border-color: var(--accent-border); transform: translateY(-2px); box-shadow: var(--shadow-card); }
  .kpi-icon { font-size: 22px; margin-bottom: 10px; }
  .kpi-value { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .kpi-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; }

  /* ── FILTER BAR ── */
  .filter-bar {
    display: flex; align-items: center; gap: 10px;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 14px 20px;
    margin-bottom: 20px; flex-wrap: wrap;
  }
  .filter-input {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 7px 12px;
    font-family: var(--font-body); font-size: 13px; color: var(--text-primary);
    outline: none; transition: border-color 0.2s; min-width: 160px;
  }
  .filter-input:focus { border-color: var(--accent-border); }
  .filter-select {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 7px 12px;
    font-family: var(--font-body); font-size: 13px; color: var(--text-primary);
    outline: none; cursor: pointer; transition: border-color 0.2s;
  }
  .filter-select:focus { border-color: var(--accent-border); }
  .filter-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .filter-spacer { flex: 1; }
  .btn-ghost {
    padding: 7px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { border-color: var(--accent-border); color: var(--text-primary); background: var(--accent-glow); }
  .btn-primary {
    padding: 7px 18px; border: none; border-radius: var(--radius-sm);
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
  .btn-danger {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-red-bg); color: var(--status-red);
    border: 1px solid var(--status-red-bg);
    font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.15s;
  }
  .btn-danger:hover { filter: brightness(1.2); }
  .btn-edit {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--accent-glow); color: var(--accent);
    border: 1px solid var(--accent-border);
    font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.15s;
  }
  .btn-edit:hover { filter: brightness(1.2); }

  /* ── TABLE ── */
  .card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: var(--transition-theme); }
  .card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); }
  .card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
  .card-subtitle { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th { font-family: var(--font-mono); font-size: 9.5px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; padding: 10px 16px; text-align: left; }
  th:first-child { padding-left: 22px; }
  th:last-child  { padding-right: 22px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--bg-elevated); }
  td { padding: 12px 16px; color: var(--text-secondary); vertical-align: middle; }
  td:first-child { padding-left: 22px; color: var(--text-primary); font-weight: 500; }
  td:last-child  { padding-right: 22px; }

  /* ── BADGES ── */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    padding: 3px 10px; border-radius: 100px; white-space: nowrap;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .badge.active      { background: var(--status-green-bg); color: var(--status-green); }
  .badge.out_of_service { background: var(--status-red-bg); color: var(--status-red); }
  .badge.under_maintenance { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.type { background: var(--status-blue-bg); color: var(--status-blue); }

  /* ── EMPTY STATE ── */
  .empty-state {
    padding: 60px 22px; text-align: center;
    color: var(--text-muted); font-family: var(--font-mono); font-size: 12px;
  }
  .empty-state-icon { font-size: 40px; margin-bottom: 12px; }

  /* ── LOADING ── */
  .loading-row td { text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; }

  /* ── MODAL OVERLAY ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .modal {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-xl); width: 100%; max-width: 540px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    animation: fadeInUp 0.25s ease both;
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--border);
  }
  .modal-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); }
  .modal-close {
    width: 32px; height: 32px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; font-size: 16px; color: var(--text-muted);
    display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  }
  .modal-close:hover { border-color: var(--status-red-bg); color: var(--status-red); }
  .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }

  /* ── FORM FIELDS ── */
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-field { display: flex; flex-direction: column; gap: 5px; }
  .form-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .form-input, .form-select, .form-textarea {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 9px 12px;
    font-family: var(--font-body); font-size: 13px; color: var(--text-primary);
    transition: border-color 0.2s; width: 100%; outline: none;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--accent-border); }
  .form-textarea { resize: vertical; min-height: 72px; }
  .form-select option { background: var(--bg-surface); }
  .form-error { font-size: 11px; color: var(--status-red); margin-top: 2px; }

  /* ── TOAST ── */
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 200;
    padding: 12px 18px; border-radius: var(--radius-md);
    font-family: var(--font-mono); font-size: 12px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    animation: fadeInUp 0.3s ease both;
  }
  .toast.success { background: var(--status-green-bg); color: var(--status-green); border: 1px solid var(--status-green); }
  .toast.error   { background: var(--status-red-bg);   color: var(--status-red);   border: 1px solid var(--status-red); }

  /* ── ANIMATIONS ── */
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in   { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .topbar  { left: 0 !important; }
    .main-content { margin-left: 0 !important; padding: 20px 16px; }
    .kpi-grid { grid-template-columns: 1fr 1fr; }
    .form-row { grid-template-columns: 1fr; }
  }
`;

// ─── Sidebar nav (same as AdminDashboard) ─────────────────────────────────────
const navSections = [
  { label: "Overview",   items: [{ icon: "📊", label: "Dashboard",   id: "dashboard" }, { icon: "📋", label: "Audit Log", id: "audit" }] },
  { label: "Resources",  items: [{ icon: "🏛️", label: "Facilities", id: "facilities" }, { icon: "🖥️", label: "Assets", id: "assets" }] },
  { label: "Operations", items: [{ icon: "📅", label: "Bookings", id: "bookings" }, { icon: "🔧", label: "Incidents", id: "incidents" }, { icon: "👷", label: "Technicians", id: "technicians" }] },
  { label: "Admin",      items: [{ icon: "👥", label: "Users & Roles", id: "users" }, { icon: "📈", label: "Analytics", id: "analytics" }, { icon: "⚙️", label: "Settings", id: "settings" }] },
];

// ─── Type / Status options ─────────────────────────────────────────────────────
const FACILITY_TYPES   = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const FACILITY_STATUSES = ["ACTIVE", "OUT_OF_SERVICE", "UNDER_MAINTENANCE"];
const typeIcons = { LECTURE_HALL: "🏛️", LAB: "🔬", MEETING_ROOM: "🎙️", EQUIPMENT: "🖥️" };
const EMPTY_FORM = { name: "", type: "LECTURE_HALL", capacity: "", location: "", description: "", status: "ACTIVE", availabilityStart: "08:00", availabilityEnd: "18:00" };

// ─── Theme hook ───────────────────────────────────────────────────────────────
function useTheme() {
  const getPref = () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const [theme, setTheme] = useState(getPref);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themes[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => setTheme(event.matches ? "dark" : "light");

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return { theme };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FacilitiesPage() {
  useTheme();
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [facilities,  setFacilities]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // ── Filters ──
  const [filterType,     setFilterType]     = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  // ── Modal ──
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);  // null = create, object = edit
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState("");

  // ── Delete confirm ──
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──
  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await facilityService.getAll({
        type:     filterType     || undefined,
        status:   filterStatus   || undefined,
        location: filterLocation || undefined,
      });
      setFacilities(res.data);
    } catch (err) {
      setError("Failed to load facilities. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterLocation]);

  useEffect(() => { fetchFacilities(); }, [fetchFacilities]);

  // ── KPI counts ──
  const total      = facilities.length;
  const active     = facilities.filter(f => f.status === "ACTIVE").length;
  const outOfSvc   = facilities.filter(f => f.status === "OUT_OF_SERVICE").length;
  const maintenance = facilities.filter(f => f.status === "UNDER_MAINTENANCE").length;

  // ── Open modal for create ──
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  // ── Open modal for edit ──
  const openEdit = (facility) => {
    setEditTarget(facility);
    setForm({
      name:              facility.name              || "",
      type:              facility.type              || "LECTURE_HALL",
      capacity:          facility.capacity          || "",
      location:          facility.location          || "",
      description:       facility.description       || "",
      status:            facility.status            || "ACTIVE",
      availabilityStart: facility.availabilityStart || "08:00",
      availabilityEnd:   facility.availabilityEnd   || "18:00",
    });
    setFormError("");
    setModalOpen(true);
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!form.name.trim())     return setFormError("Name is required.");
    if (!form.location.trim()) return setFormError("Location is required.");
    if (form.capacity && isNaN(Number(form.capacity))) return setFormError("Capacity must be a number.");

    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null };
      if (editTarget) {
        await facilityService.update(editTarget.id, payload);
        showToast("Facility updated successfully ✓");
      } else {
        await facilityService.create(payload);
        showToast("Facility created successfully ✓");
      }
      setModalOpen(false);
      fetchFacilities();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await facilityService.delete(deleteTarget.id);
      showToast("Facility deleted ✓");
      setDeleteTarget(null);
      fetchFacilities();
    } catch (err) {
      showToast("Failed to delete facility.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name) => name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const handleLogout = () => { logout(); navigate("/"); };

  const handleNavClick = (id) => {
    if (id === "dashboard") navigate("/admin");
    // add more routes as your project grows
  };

  const statusBadgeClass = (s) => {
    if (!s) return "";
    return s.toLowerCase().replace(/_/g, "_");
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${sidebarOpen ? "" : " collapsed"}`}>
        <a className="sidebar-logo" href="#">
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
                  className={`nav-item${item.id === "facilities" ? " active" : ""}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
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
      <header className={`topbar${sidebarOpen ? "" : " collapsed"}`}>
        <button className="topbar-menu-btn" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? "←" : "☰"}
        </button>
        <div className="topbar-breadcrumb">
          Facilities <span>/ Catalogue</span>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn" title="Notifications">🔔</button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className={`main-content${sidebarOpen ? "" : " collapsed"}`}>

        {/* Page Header */}
        <div className="page-header fade-in">
          <div>
            <div className="page-label">Module A</div>
            <div className="page-title">Facilities & Assets Catalogue</div>
            <div className="page-subtitle">Manage bookable resources — lecture halls, labs, meeting rooms, and equipment</div>
          </div>
          <div className="page-header-right">
            <button className="btn-ghost" onClick={fetchFacilities}>↻ Refresh</button>
            <button className="btn-primary" onClick={openCreate}>＋ Add Facility</button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="kpi-grid fade-in-1">
          {[
            { icon: "🏛️", label: "Total Resources",   value: total },
            { icon: "✅", label: "Active",             value: active },
            { icon: "🚫", label: "Out of Service",     value: outOfSvc },
            { icon: "🔧", label: "Under Maintenance",  value: maintenance },
          ].map(k => (
            <div className="kpi-card" key={k.label}>
              <div className="kpi-icon">{k.icon}</div>
              <div className="kpi-value">{loading ? "—" : k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="filter-bar fade-in-1">
          <span className="filter-label">Filter:</span>
          <input
            className="filter-input"
            placeholder="Search by location…"
            value={filterLocation}
            onChange={e => setFilterLocation(e.target.value)}
          />
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {FACILITY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {FACILITY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <div className="filter-spacer" />
          <button className="btn-ghost" onClick={() => { setFilterType(""); setFilterStatus(""); setFilterLocation(""); }}>
            Clear Filters
          </button>
        </div>

        {/* Facilities Table */}
        <div className="card fade-in-2">
          <div className="card-header">
            <div>
              <div className="card-title"><span>🏛️</span> All Facilities</div>
              <div className="card-subtitle">{loading ? "Loading…" : `${facilities.length} resource${facilities.length !== 1 ? "s" : ""} found`}</div>
            </div>
          </div>

          {error ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚠️</div>
              <div>{error}</div>
              <button className="btn-ghost" style={{ margin: "12px auto 0", display: "flex" }} onClick={fetchFacilities}>Try again</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Availability</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="loading-row">
                      <td colSpan={7}>Loading facilities…</td>
                    </tr>
                  ) : facilities.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        No facilities found. Click "＋ Add Facility" to create one.
                      </td>
                    </tr>
                  ) : (
                    facilities.map(f => (
                      <tr key={f.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{typeIcons[f.type] || "🏛️"}</span>
                            {f.name}
                          </div>
                        </td>
                        <td>
                          <span className="badge type">
                            {f.type?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                          {f.capacity ? `${f.capacity} seats` : "—"}
                        </td>
                        <td>{f.location}</td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                          {f.availabilityStart && f.availabilityEnd
                            ? `${f.availabilityStart} – ${f.availabilityEnd}`
                            : "—"}
                        </td>
                        <td>
                          <span className={`badge ${statusBadgeClass(f.status)}`}>
                            <span className="badge-dot" style={{
                              background: f.status === "ACTIVE" ? "var(--status-green)"
                                        : f.status === "OUT_OF_SERVICE" ? "var(--status-red)"
                                        : "var(--status-amber)"
                            }} />
                            {f.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn-edit" onClick={() => openEdit(f)}>✏ Edit</button>
                            <button className="btn-danger" onClick={() => setDeleteTarget(f)}>✕ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── ADD / EDIT MODAL ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editTarget ? "Edit Facility" : "Add New Facility"}</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {formError && <div style={{ background: "var(--status-red-bg)", color: "var(--status-red)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: 12 }}>⚠ {formError}</div>}
              <div className="form-row">
                <div className="form-field" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Facility Name *</label>
                  <input className="form-input" placeholder="e.g. Computer Lab 01" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Type *</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {FACILITY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Status *</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {FACILITY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Location *</label>
                  <input className="form-input" placeholder="e.g. Block A, Floor 2" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Capacity</label>
                  <input className="form-input" type="number" placeholder="e.g. 40" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Available From</label>
                  <input className="form-input" type="time" value={form.availabilityStart} onChange={e => setForm(f => ({ ...f, availabilityStart: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Available Until</label>
                  <input className="form-input" type="time" value={form.availabilityEnd} onChange={e => setForm(f => ({ ...f, availabilityEnd: e.target.value }))} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Optional description…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Create Facility"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Delete Facility</div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" style={{ padding: "8px 18px", fontSize: 13 }} onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
        </div>
      )}
    </>
  );
}