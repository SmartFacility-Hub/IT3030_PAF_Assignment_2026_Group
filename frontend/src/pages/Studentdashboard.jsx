import { useState, useEffect, useCallback } from "react";

// ─── Theme Definitions ────────────────────────────────────────────────────────
const themes = {
  dark: {
    "--bg-base":          "#0a0f1e",
    "--bg-surface":       "#111827",
    "--bg-elevated":      "#1a2235",
    "--bg-overlay":       "rgba(10,15,30,0.85)",
    "--bg-overlay-solid": "rgba(10,15,30,0.97)",
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
    "--kpi-bg":           "#1a2235",
    "--shadow-card":      "0 4px 24px rgba(0,0,0,0.3)",
    "--toggle-icon":      "☀️",
  },
  light: {
    "--bg-base":          "#f5f7fa",
    "--bg-surface":       "#ffffff",
    "--bg-elevated":      "#eef1f6",
    "--bg-overlay":       "rgba(245,247,250,0.88)",
    "--bg-overlay-solid": "rgba(245,247,250,0.98)",
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
    "--kpi-bg":           "#f0f3f8",
    "--shadow-card":      "0 2px 12px rgba(0,0,0,0.08)",
    "--toggle-icon":      "🌙",
  },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --font-display: 'Bricolage Grotesque', Georgia, serif;
    --font-body:    'Instrument Sans', system-ui, sans-serif;
    --font-mono:    'JetBrains Mono', 'Courier New', monospace;
    --radius-sm:    8px;
    --radius-md:    12px;
    --radius-lg:    16px;
    --radius-xl:    20px;
    --transition-theme: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    --sidebar-w:    250px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body, #root {
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    min-height: 100vh;
    overflow-x: hidden;
    transition: var(--transition-theme);
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w);
    min-height: 100vh;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 50; overflow-y: auto;
    transition: var(--transition-theme), transform 0.3s ease;
  }
  .sidebar.collapsed { transform: translateX(calc(-1 * var(--sidebar-w))); }

  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 20px 20px 0;
    font-family: var(--font-display);
    font-size: 17px; font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    text-decoration: none;
  }
  .sidebar-logo-icon {
    width: 34px; height: 34px;
    background: var(--accent);
    border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; flex-shrink: 0;
  }

  /* Student role badge — blue tint to differentiate from Admin amber */
  .sidebar-role-badge {
    margin: 14px 20px 20px;
    padding: 7px 12px;
    background: var(--status-blue-bg);
    border: 1px solid rgba(96,165,250,0.3);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 10px; font-weight: 500;
    color: var(--status-blue);
    letter-spacing: 0.1em; text-transform: uppercase;
    display: flex; align-items: center; gap: 6px;
  }
  .role-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--status-blue);
    animation: pulse 2s infinite;
  }

  .sidebar-nav { flex: 1; padding: 0 12px; }
  .sidebar-section-label {
    font-family: var(--font-mono);
    font-size: 9px; font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.14em; text-transform: uppercase;
    padding: 0 8px; margin: 20px 0 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--radius-sm);
    font-size: 13.5px; color: var(--text-secondary);
    cursor: pointer; margin-bottom: 2px;
    border: 1px solid transparent;
    transition: all 0.15s; user-select: none;
  }
  .nav-item:hover { background: var(--bg-elevated); color: var(--text-primary); }
  .nav-item.active {
    background: var(--status-blue-bg);
    color: var(--status-blue);
    border-color: rgba(96,165,250,0.3);
    font-weight: 600;
  }
  .nav-item-icon  { font-size: 15px; flex-shrink: 0; }
  .nav-item-label { flex: 1; }
  .nav-badge {
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-mono); font-size: 9px; font-weight: 700;
    padding: 2px 7px; border-radius: 100px;
  }
  .nav-badge.amber { background: var(--status-amber); color: #000; }

  .sidebar-footer {
    padding: 16px 12px; border-top: 1px solid var(--border); flex-shrink: 0;
  }
  .student-profile {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; border-radius: var(--radius-sm);
    cursor: pointer; transition: background 0.15s;
  }
  .student-profile:hover { background: var(--bg-elevated); }
  .profile-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--status-blue);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 12px; font-weight: 700;
    color: #fff; flex-shrink: 0;
  }
  .profile-info { flex: 1; min-width: 0; }
  .profile-name  { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .profile-email { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* ── TOPBAR ── */
  .topbar {
    position: fixed; top: 0; left: var(--sidebar-w); right: 0; height: 60px;
    background: var(--bg-overlay); backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
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
  .topbar-menu-btn:hover { border-color: rgba(96,165,250,0.4); color: var(--status-blue); }

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
  .topbar-search:hover { border-color: rgba(96,165,250,0.4); }
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
  .icon-btn:hover { border-color: rgba(96,165,250,0.4); color: var(--status-blue); background: var(--status-blue-bg); }
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

  /* ── MAIN ── */
  .main-content {
    margin-left: var(--sidebar-w); margin-top: 60px;
    padding: 32px; min-height: calc(100vh - 60px);
    transition: margin-left 0.3s ease;
  }
  .main-content.collapsed { margin-left: 0; }

  /* ── PAGE HEADER ── */
  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; gap: 16px;
  }
  .page-label {
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    color: var(--status-blue); letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
  }
  .page-label::before {
    content: ''; display: block; width: 18px; height: 1px; background: var(--status-blue);
  }
  .page-title {
    font-family: var(--font-display); font-size: 28px; font-weight: 800;
    color: var(--text-primary); letter-spacing: -0.025em; line-height: 1.1;
  }
  .page-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
  .page-header-right { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

  /* ── WELCOME BANNER ── */
  .welcome-banner {
    background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%);
    border: 1px solid var(--border);
    border-left: 4px solid var(--status-blue);
    border-radius: var(--radius-lg);
    padding: 24px 28px;
    display: flex; align-items: center; gap: 20px;
    margin-bottom: 28px;
    position: relative; overflow: hidden;
  }
  .welcome-banner::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 180px; height: 180px; border-radius: 50%;
    background: var(--status-blue-bg);
    pointer-events: none;
  }
  .welcome-avatar {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--status-blue);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 20px; font-weight: 800;
    color: #fff; flex-shrink: 0; position: relative; z-index: 1;
  }
  .welcome-text { flex: 1; position: relative; z-index: 1; }
  .welcome-greeting {
    font-family: var(--font-display); font-size: 22px; font-weight: 800;
    color: var(--text-primary); letter-spacing: -0.02em;
  }
  .welcome-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
  .welcome-actions { display: flex; gap: 10px; flex-shrink: 0; position: relative; z-index: 1; }

  /* ── BUTTONS ── */
  .btn-ghost {
    padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { border-color: rgba(96,165,250,0.4); color: var(--text-primary); background: var(--status-blue-bg); }

  .btn-primary {
    padding: 8px 18px; border: none; border-radius: var(--radius-sm);
    background: var(--status-blue); color: #fff;
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); box-shadow: 0 4px 14px var(--status-blue-bg); }

  /* ── KPI GRID ── */
  .kpi-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .kpi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px 22px;
    cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
  }
  .kpi-card::before {
    content: ''; position: absolute; inset: 0;
    background: var(--status-blue-bg); opacity: 0; transition: opacity 0.3s;
  }
  .kpi-card:hover { border-color: rgba(96,165,250,0.35); transform: translateY(-2px); box-shadow: var(--shadow-card); }
  .kpi-card:hover::before { opacity: 1; }
  .kpi-card-top {
    display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px;
  }
  .kpi-icon {
    width: 40px; height: 40px; border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; border: 1px solid var(--border);
    background: var(--bg-elevated); position: relative; z-index: 1;
  }
  .kpi-change {
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    padding: 3px 8px; border-radius: 100px; position: relative; z-index: 1;
  }
  .kpi-change.up      { background: var(--status-green-bg); color: var(--status-green); }
  .kpi-change.down    { background: var(--status-red-bg);   color: var(--status-red); }
  .kpi-change.neutral { background: var(--bg-elevated);     color: var(--text-muted); }
  .kpi-value {
    font-family: var(--font-display); font-size: 32px; font-weight: 800;
    color: var(--text-primary); letter-spacing: -0.035em; line-height: 1;
    position: relative; z-index: 1;
  }
  .kpi-label {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
    margin-top: 6px; letter-spacing: 0.06em; text-transform: uppercase;
    position: relative; z-index: 1;
  }
  .kpi-sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; position: relative; z-index: 1; }

  /* ── CONTENT GRID ── */
  .content-grid   { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; margin-bottom: 20px; }
  .content-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .content-grid-equal { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

  /* ── CARD ── */
  .card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden; transition: var(--transition-theme);
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid var(--border);
  }
  .card-title {
    font-family: var(--font-display); font-size: 15px; font-weight: 700;
    color: var(--text-primary); display: flex; align-items: center; gap: 8px;
  }
  .card-subtitle {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px;
  }
  .card-body { padding: 20px 22px; }
  .card-action {
    font-family: var(--font-mono); font-size: 11px; color: var(--status-blue);
    cursor: pointer; transition: color 0.2s;
    display: flex; align-items: center; gap: 4px;
    border: none; background: none; padding: 0;
  }
  .card-action:hover { color: var(--accent); }

  /* ── BADGES ── */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    padding: 3px 10px; border-radius: 100px; white-space: nowrap;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .badge.pending  { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.approved { background: var(--status-green-bg); color: var(--status-green); }
  .badge.rejected { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.cancelled{ background: var(--bg-elevated);     color: var(--text-muted); }
  .badge.open     { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.progress { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.resolved { background: var(--status-green-bg); color: var(--status-green); }

  /* ── TABLE ── */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th {
    font-family: var(--font-mono); font-size: 9.5px; font-weight: 500;
    color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;
    padding: 10px 16px; text-align: left;
  }
  th:first-child { padding-left: 22px; }
  th:last-child  { padding-right: 22px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; cursor: pointer; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--bg-elevated); }
  td { padding: 12px 16px; color: var(--text-secondary); vertical-align: middle; }
  td:first-child { padding-left: 22px; color: var(--text-primary); font-weight: 500; }
  td:last-child  { padding-right: 22px; }

  /* ── BOOKING CALENDAR STRIP ── */
  .calendar-strip {
    display: grid; grid-template-columns: repeat(7, 1fr);
    gap: 8px; padding: 0 22px 22px;
  }
  .cal-day {
    display: flex; flex-direction: column; align-items: center;
    padding: 10px 4px; border-radius: var(--radius-md);
    background: var(--bg-elevated); border: 1px solid var(--border);
    cursor: pointer; transition: all 0.2s; gap: 4px;
  }
  .cal-day:hover { border-color: rgba(96,165,250,0.4); background: var(--status-blue-bg); }
  .cal-day.has-booking { border-color: rgba(96,165,250,0.5); background: var(--status-blue-bg); }
  .cal-day.today { border-color: var(--status-blue); }
  .cal-day-name  { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
  .cal-day-num   { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-primary); line-height: 1; }
  .cal-day-dot   { width: 5px; height: 5px; border-radius: 50%; background: var(--status-blue); }

  /* ── UPCOMING BOOKINGS LIST ── */
  .booking-list { display: flex; flex-direction: column; }
  .booking-item {
    display: flex; align-items: center; gap: 14px;
    padding: 13px 22px; border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background 0.15s;
  }
  .booking-item:last-child { border-bottom: none; }
  .booking-item:hover { background: var(--bg-elevated); }
  .booking-time-col {
    display: flex; flex-direction: column; align-items: center;
    min-width: 52px; gap: 1px;
  }
  .booking-time  { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--text-primary); }
  .booking-date  { font-family: var(--font-mono); font-size: 9px;  color: var(--text-muted); }
  .booking-bar   { width: 3px; align-self: stretch; border-radius: 4px; flex-shrink: 0; }
  .booking-body  { flex: 1; min-width: 0; }
  .booking-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .booking-meta  { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .booking-status-col { flex-shrink: 0; }

  /* ── AVAILABLE ROOMS ── */
  .room-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; padding: 0 22px 22px;
  }
  .room-card {
    padding: 14px; background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;
  }
  .room-card:hover { border-color: rgba(96,165,250,0.5); transform: translateY(-1px); }
  .room-card.unavailable { opacity: 0.5; cursor: not-allowed; }
  .room-card.unavailable:hover { transform: none; }
  .room-icon { font-size: 20px; margin-bottom: 8px; }
  .room-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .room-cap  { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .room-avail {
    margin-top: 8px; font-family: var(--font-mono); font-size: 10px;
    padding: 2px 8px; border-radius: 100px; display: inline-block;
  }
  .room-avail.free { background: var(--status-green-bg); color: var(--status-green); }
  .room-avail.busy { background: var(--status-red-bg);   color: var(--status-red); }

  /* ── NOTIFICATION PANEL ── */
  .notif-list { display: flex; flex-direction: column; }
  .notif-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 22px; border-bottom: 1px solid var(--border);
    transition: background 0.15s; cursor: pointer;
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: var(--bg-elevated); }
  .notif-item.unread { background: var(--status-blue-bg); }
  .notif-item.unread:hover { filter: brightness(0.95); }
  .notif-icon-wrap {
    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 15px;
  }
  .notif-body { flex: 1; }
  .notif-text { font-size: 13px; color: var(--text-secondary); line-height: 1.4; }
  .notif-text strong { color: var(--text-primary); }
  .notif-time { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 3px; }
  .unread-pip { width: 7px; height: 7px; border-radius: 50%; background: var(--status-blue); flex-shrink: 0; margin-top: 6px; }

  /* ── INCIDENT FORM CARD ── */
  .report-form { display: flex; flex-direction: column; gap: 12px; padding: 0 22px 22px; }
  .form-field { display: flex; flex-direction: column; gap: 5px; }
  .form-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .form-input, .form-select, .form-textarea {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 9px 12px;
    font-family: var(--font-body); font-size: 13px; color: var(--text-primary);
    transition: border-color 0.2s; width: 100%;
    outline: none;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: rgba(96,165,250,0.5);
  }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-select option { background: var(--bg-surface); }

  /* ── ANIMATIONS ── */
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in   { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }
  .fade-in-3 { animation: fadeInUp 0.5s 0.15s ease both; }
  .fade-in-4 { animation: fadeInUp 0.5s 0.20s ease both; }

  @media (max-width: 1100px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .content-grid { grid-template-columns: 1fr; }
    .content-grid-3, .content-grid-equal { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .topbar  { left: 0 !important; }
    .main-content { margin-left: 0 !important; padding: 20px 16px; }
    .kpi-grid { grid-template-columns: 1fr 1fr; }
    .content-grid-3, .content-grid-equal { grid-template-columns: 1fr; }
    .calendar-strip { grid-template-columns: repeat(4, 1fr); }
    .room-grid { grid-template-columns: 1fr; }
  }
`;

// ─── Mock Data ────────────────────────────────────────────────────────────────
const calDays = [
  { name: "Mon", num: 7,  hasBooking: false, today: false },
  { name: "Tue", num: 8,  hasBooking: true,  today: false },
  { name: "Wed", num: 9,  hasBooking: false, today: false },
  { name: "Thu", num: 10, hasBooking: true,  today: false },
  { name: "Fri", num: 11, hasBooking: false, today: false },
  { name: "Sat", num: 12, hasBooking: false, today: false },
  { name: "Sun", num: 13, hasBooking: false, today: true  },
];

const upcomingBookings = [
  { time: "09:00", endTime: "11:00", date: "Tue 8 Apr", title: "Computer Lab 2 — Group Study",    meta: "Capacity 40 · Block C",         status: "approved", color: "#4ade80" },
  { time: "14:00", endTime: "15:30", date: "Thu 10 Apr",title: "Study Room 4 — Project Meeting",  meta: "Capacity 8 · Library Block",    status: "pending",  color: "#fbbf24" },
  { time: "10:00", endTime: "12:00", date: "Mon 14 Apr",title: "Seminar Room A — Presentation",   meta: "Capacity 25 · Block A",         status: "approved", color: "#4ade80" },
  { time: "15:00", endTime: "16:00", date: "Wed 16 Apr",title: "Computer Lab 1 — Assignment Work",meta: "Capacity 40 · Block C",         status: "pending",  color: "#fbbf24" },
];

const availableRooms = [
  { icon: "💻", name: "Computer Lab 1",  cap: "40 seats",  avail: true  },
  { icon: "📚", name: "Study Room 3",    cap: "8 seats",   avail: true  },
  { icon: "🔬", name: "Bio Lab 2",       cap: "24 seats",  avail: false },
  { icon: "🎙️", name: "Seminar Room B", cap: "30 seats",  avail: true  },
  { icon: "🖥️", name: "Computer Lab 3", cap: "40 seats",  avail: false },
  { icon: "📖", name: "Study Room 6",   cap: "6 seats",   avail: true  },
];

const myIncidents = [
  { id: "INC-091", title: "Projector not working — Lab 2", date: "8 Apr",  priority: "High",   status: "progress" },
  { id: "INC-085", title: "Broken chair — Study Room 4",   date: "3 Apr",  priority: "Low",    status: "resolved" },
  { id: "INC-079", title: "AC fault — Seminar Room A",     date: "28 Mar", priority: "Medium", status: "resolved" },
];

const notifications = [
  { icon: "✅", bg: "var(--status-green-bg)", text: <><strong>Booking Approved</strong> — Computer Lab 2 on Tue 8 Apr has been approved by Admin</>,       time: "5 min ago",  unread: true  },
  { icon: "💬", bg: "var(--status-blue-bg)",  text: <><strong>New Comment</strong> — Technician T. Kumara added an update to your ticket <strong>#INC-091</strong></>, time: "1 hr ago",   unread: true  },
  { icon: "⏳", bg: "var(--status-amber-bg)", text: <><strong>Booking Reminder</strong> — Your booking for Study Room 4 starts in <strong>2 hours</strong></>, time: "2 hr ago",   unread: false },
  { icon: "❌", bg: "var(--status-red-bg)",   text: <><strong>Booking Rejected</strong> — Auditorium booking for 5 Apr was rejected: already reserved</>,   time: "Yesterday",  unread: false },
  { icon: "🔧", bg: "var(--status-green-bg)", text: <><strong>Ticket Resolved</strong> — Incident <strong>#INC-085</strong> has been marked as resolved</>,  time: "3 days ago", unread: false },
];

const navSections = [
  {
    label: "My Space",
    items: [
      { icon: "📊", label: "Dashboard",      id: "dashboard", badge: null },
      { icon: "🔔", label: "Notifications",  id: "notifs",    badge: "2", badgeAmber: false },
    ],
  },
  {
    label: "Bookings",
    items: [
      { icon: "📅", label: "My Bookings",     id: "bookings",  badge: null },
      { icon: "🔍", label: "Browse Rooms",    id: "browse",    badge: null },
      { icon: "➕", label: "New Booking",     id: "new",       badge: null },
    ],
  },
  {
    label: "Support",
    items: [
      { icon: "🔧", label: "My Incidents",    id: "incidents", badge: null },
      { icon: "📝", label: "Report Issue",    id: "report",    badge: null },
    ],
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useTheme() {
  const getPref = () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const [theme, setTheme] = useState(getPref);
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themes[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = (e) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);
  const toggle = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);
  return { theme, toggle };
}

function useCounter(targets, duration = 1400) {
  const [vals, setVals] = useState(() => Object.fromEntries(Object.keys(targets).map(k => [k, 0])));
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVals(Object.fromEntries(Object.entries(targets).map(([k, v]) => [k, Math.round(v * ease)])));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);
  return vals;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [reportForm, setReportForm] = useState({ title: "", location: "", priority: "Medium", desc: "" });

  const kpi = useCounter({ bookings: 12, upcoming: 4, incidents: 3, hours: 28 });

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
          Student Portal
        </div>
        <nav className="sidebar-nav">
          {navSections.map(sec => (
            <div key={sec.label}>
              <div className="sidebar-section-label">{sec.label}</div>
              {sec.items.map(item => (
                <div
                  key={item.id}
                  className={`nav-item${activeNav === item.id ? " active" : ""}`}
                  onClick={() => setActiveNav(item.id)}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                  {item.badge && <span className={`nav-badge${item.badgeAmber ? " amber" : ""}`}>{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="student-profile">
            <div className="profile-avatar">AS</div>
            <div className="profile-info">
              <div className="profile-name">A. Silva</div>
              <div className="profile-email">it21234567@my.sliit.lk</div>
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
          My Dashboard <span>/ Student</span>
        </div>
        <div className="topbar-search">
          <span>🔍</span> Search rooms, assets…<span className="search-kbd">⌘K</span>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn">🔔<span className="notif-dot" /></button>
          <button className="icon-btn">❓</button>
          <button className="theme-toggle" onClick={toggle}>{themes[theme]["--toggle-icon"]}</button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className={`main-content${sidebarOpen ? "" : " collapsed"}`}>

        {/* Welcome Banner */}
        <div className="welcome-banner fade-in">
          <div className="welcome-avatar">AS</div>
          <div className="welcome-text">
            <div className="welcome-greeting">Good morning, Ashan! 👋</div>
            <div className="welcome-sub">You have <strong>2 upcoming bookings</strong> this week and <strong>1 open incident</strong>. Have a productive day!</div>
          </div>
          <div className="welcome-actions">
            <button className="btn-ghost">📅 View Schedule</button>
            <button className="btn-primary">＋ Book a Room</button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="kpi-grid">
          {[
            { icon: "📅", label: "Total Bookings",   value: kpi.bookings,  change: "This semester", up: null, sub: "All time" },
            { icon: "⏰", label: "Upcoming",          value: kpi.upcoming,  change: "Next 7 days",   up: null, sub: "Confirmed + pending" },
            { icon: "🔧", label: "My Incidents",     value: kpi.incidents, change: "1 open",        up: false,sub: "Submitted reports" },
            { icon: "🏛️", label: "Hours Booked",    value: kpi.hours,     change: "+4 this week",  up: true, sub: "Facility hours used" },
          ].map((k, i) => (
            <div className={`kpi-card fade-in-${i + 1}`} key={k.label}>
              <div className="kpi-card-top">
                <div className="kpi-icon">{k.icon}</div>
                <div className={`kpi-change ${k.up === null ? "neutral" : k.up ? "up" : "down"}`}>
                  {k.change}
                </div>
              </div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Row 1: Calendar + Upcoming Bookings */}
        <div className="content-grid fade-in-2">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title"><span>📅</span> Upcoming Bookings</div>
                <div className="card-subtitle">Your confirmed & pending reservations</div>
              </div>
              <button className="card-action">All bookings →</button>
            </div>
            {/* Week strip */}
            <div style={{ padding: "16px 22px 12px" }}>
              <div className="calendar-strip">
                {calDays.map(d => (
                  <div key={d.num} className={`cal-day${d.hasBooking ? " has-booking" : ""}${d.today ? " today" : ""}`}>
                    <div className="cal-day-name">{d.name}</div>
                    <div className="cal-day-num">{d.num}</div>
                    {d.hasBooking && <div className="cal-day-dot" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="booking-list">
              {upcomingBookings.map((b, i) => (
                <div className="booking-item" key={i}>
                  <div className="booking-time-col">
                    <div className="booking-time">{b.time}</div>
                    <div className="booking-date">{b.date}</div>
                  </div>
                  <div className="booking-bar" style={{ background: b.color }} />
                  <div className="booking-body">
                    <div className="booking-title">{b.title}</div>
                    <div className="booking-meta">{b.meta}</div>
                  </div>
                  <div className="booking-status-col">
                    <span className={`badge ${b.status}`}>
                      <span className="badge-dot" style={{ background: b.color }} />
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title"><span>🔔</span> Notifications</div>
                <div className="card-subtitle">2 unread messages</div>
              </div>
              <button className="card-action">Mark all read</button>
            </div>
            <div className="notif-list">
              {notifications.map((n, i) => (
                <div className={`notif-item${n.unread ? " unread" : ""}`} key={i}>
                  <div className="notif-icon-wrap" style={{ background: n.bg }}>{n.icon}</div>
                  <div className="notif-body">
                    <div className="notif-text">{n.text}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                  {n.unread && <div className="unread-pip" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Available Rooms + My Incidents + Report Form */}
        <div className="content-grid fade-in-3">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title"><span>🏛️</span> Available Right Now</div>
                <div className="card-subtitle">Open for booking today</div>
              </div>
              <button className="card-action">Browse all →</button>
            </div>
            <div className="room-grid">
              {availableRooms.map(r => (
                <div className={`room-card${r.avail ? "" : " unavailable"}`} key={r.name}>
                  <div className="room-icon">{r.icon}</div>
                  <div className="room-name">{r.name}</div>
                  <div className="room-cap">👥 {r.cap}</div>
                  <div className={`room-avail ${r.avail ? "free" : "busy"}`}>
                    {r.avail ? "Available" : "Occupied"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* My Incidents */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title"><span>🔧</span> My Incident Reports</div>
                  <div className="card-subtitle">Submitted tickets</div>
                </div>
                <button className="card-action">View all →</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Issue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myIncidents.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{t.id}</td>
                        <td style={{ fontSize: 12 }}>{t.title}</td>
                        <td>
                          <span className={`badge ${t.status}`}>
                            {t.status === "progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Report Form */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><span>📝</span> Report an Issue</div>
              </div>
              <div className="report-form">
                <div className="form-field">
                  <label className="form-label">Issue Title</label>
                  <input className="form-input" placeholder="e.g. Projector not working" value={reportForm.title} onChange={e => setReportForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder="e.g. Lab A-102, Block C" value={reportForm.location} onChange={e => setReportForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={reportForm.priority} onChange={e => setReportForm(f => ({ ...f, priority: e.target.value }))}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Describe the issue in detail…" value={reportForm.desc} onChange={e => setReportForm(f => ({ ...f, desc: e.target.value }))} />
                </div>
                <button className="btn-primary" style={{ alignSelf: "flex-start" }}>Submit Report →</button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Booking History Table */}
        <div className="card fade-in-4" style={{ marginBottom: "40px" }}>
          <div className="card-header">
            <div>
              <div className="card-title"><span>🗂️</span> Booking History</div>
              <div className="card-subtitle">All your past and current reservations</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost">Filter</button>
              <button className="btn-primary">＋ New Booking</button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "BK-1043", resource: "Computer Lab 2",  date: "8 Apr",  time: "09:00–11:00", purpose: "Group Study",       status: "approved" },
                  { id: "BK-1044", resource: "Study Room 4",    date: "10 Apr", time: "14:00–15:30", purpose: "Project Meeting",   status: "pending"  },
                  { id: "BK-1045", resource: "Seminar Room A",  date: "14 Apr", time: "10:00–12:00", purpose: "Presentation Prep", status: "approved" },
                  { id: "BK-1046", resource: "Computer Lab 1",  date: "16 Apr", time: "15:00–16:00", purpose: "Assignment",        status: "pending"  },
                  { id: "BK-1037", resource: "Auditorium",      date: "5 Apr",  time: "09:00–13:00", purpose: "Club Event",        status: "rejected" },
                  { id: "BK-1029", resource: "Study Room 2",    date: "1 Apr",  time: "13:00–14:00", purpose: "Group Study",       status: "approved" },
                ].map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{b.id}</td>
                    <td>{b.resource}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{b.date}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{b.time}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{b.purpose}</td>
                    <td>
                      <span className={`badge ${b.status}`}>
                        <span className="badge-dot" style={{
                          background: b.status === "approved" ? "var(--status-green)" : b.status === "pending" ? "var(--status-amber)" : "var(--status-red)"
                        }} />
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {b.status === "pending" || b.status === "approved"
                        ? <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }}>Cancel</button>
                        : <button className="card-action" style={{ fontSize: 11 }}>View →</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </>
  );
}