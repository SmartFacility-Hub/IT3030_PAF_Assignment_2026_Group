import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Theme Definitions ────────────────────────────────────────────────────────
// All color/token values live here. No hardcoded colors elsewhere in components.
const themes = {
  dark: {
    // Backgrounds
    "--bg-base":       "#0a0f1e",
    "--bg-surface":    "#111827",
    "--bg-elevated":   "#1a2235",
    "--bg-overlay":    "rgba(10,15,30,0.85)",
    "--bg-overlay-solid": "rgba(10,15,30,0.97)",

    // Brand accent
    "--accent":        "#f5a623",
    "--accent-dim":    "#c4831a",
    "--accent-hover":  "#f0b94f",
    "--accent-glow":   "rgba(245,166,35,0.12)",
    "--accent-border": "rgba(245,166,35,0.3)",
    "--accent-fg":     "#0a0f1e",  // text on accent bg

    // Text
    "--text-primary":  "#f0f4ff",
    "--text-secondary":"#c4cdd9",
    "--text-muted":    "#8892a4",

    // Borders
    "--border":        "rgba(255,255,255,0.07)",

    // Status
    "--status-green":  "#4ade80",
    "--status-red":    "#f87171",
    "--status-green-bg":"rgba(74,222,128,0.15)",
    "--status-red-bg": "rgba(248,113,113,0.15)",
    "--status-amber-bg":"rgba(245,166,35,0.15)",

    // KPI card
    "--kpi-bg":        "#1a2235",

    // Toggle icon
    "--toggle-icon":   "☀️",
    "--toggle-label":  "Light mode",

    // Shadow
    "--shadow-frame":  "0 60px 120px -20px rgba(0,0,0,0.6)",
  },
  light: {
    "--bg-base":       "#f5f7fa",
    "--bg-surface":    "#ffffff",
    "--bg-elevated":   "#eef1f6",
    "--bg-overlay":    "rgba(245,247,250,0.88)",
    "--bg-overlay-solid": "rgba(245,247,250,0.98)",

    "--accent":        "#d4840a",
    "--accent-dim":    "#a86308",
    "--accent-hover":  "#b97110",
    "--accent-glow":   "rgba(212,132,10,0.10)",
    "--accent-border": "rgba(212,132,10,0.35)",
    "--accent-fg":     "#ffffff",

    "--text-primary":  "#111827",
    "--text-secondary":"#374151",
    "--text-muted":    "#6b7280",

    "--border":        "rgba(0,0,0,0.08)",

    "--status-green":  "#15803d",
    "--status-red":    "#dc2626",
    "--status-green-bg":"rgba(21,128,61,0.10)",
    "--status-red-bg": "rgba(220,38,38,0.10)",
    "--status-amber-bg":"rgba(212,132,10,0.12)",

    "--kpi-bg":        "#f0f3f8",

    "--toggle-icon":   "🌙",
    "--toggle-label":  "Dark mode",

    "--shadow-frame":  "0 40px 80px -20px rgba(0,0,0,0.15)",
  }
};

// ─── Inline CSS ───────────────────────────────────────────────────────────────
const styles = `
  /* ── Google Fonts ──
     Display:  Bricolage Grotesque — bold, editorial, characterful
     Body:     Instrument Sans — clean, readable, slightly humanist
     Mono:     JetBrains Mono — dashboard data labels
  */
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    /* Typography scale */
    --font-display: 'Bricolage Grotesque', Georgia, serif;
    --font-body:    'Instrument Sans', system-ui, sans-serif;
    --font-mono:    'JetBrains Mono', 'Courier New', monospace;

    /* Spacing & radius */
    --radius-sm:   8px;
    --radius-md:   12px;
    --radius-lg:   16px;
    --radius-xl:   20px;

    /* Transitions */
    --transition-theme: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body, #root {
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.6;
    min-height: 100vh;
    overflow-x: hidden;
    transition: var(--transition-theme);
  }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px;
    height: 64px;
    background: var(--bg-overlay);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: var(--transition-theme);
  }
  .nav.scrolled { background: var(--bg-overlay-solid); }

  .nav-logo {
    font-family: var(--font-display);
    font-size: 18px; font-weight: 700;
    letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.2s;
  }
  .nav-logo-icon {
    width: 32px; height: 32px;
    background: var(--accent);
    border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    transition: background 0.25s;
  }
  .nav-links {
    display: flex; gap: 36px; list-style: none;
  }
  .nav-links a {
    font-size: 14px; font-weight: 400;
    color: var(--text-muted); text-decoration: none;
    letter-spacing: 0.01em;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text-primary); }

  .nav-right { display: flex; gap: 10px; align-items: center; }

  /* Theme Toggle Button */
  .theme-toggle {
    width: 38px; height: 38px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--bg-elevated);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    transition: var(--transition-theme), transform 0.2s;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }
  .theme-toggle:hover { transform: rotate(12deg) scale(1.1); border-color: var(--accent-border); }
  .theme-toggle:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .toggle-icon { line-height: 1; }

  /* Buttons */
  .btn-ghost {
    padding: 8px 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-secondary);
    font-family: var(--font-body);
    font-size: 14px; cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .btn-ghost:hover { border-color: var(--accent-border); color: var(--text-primary); background: var(--accent-glow); }
  .btn-ghost:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .btn-primary {
    padding: 8px 18px;
    border: none; border-radius: var(--radius-sm);
    background: var(--accent);
    color: var(--accent-fg);
    font-family: var(--font-body);
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 14px var(--accent-glow); }
  .btn-primary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  /* ── HERO ── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 120px 48px 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero-grid-bg {
    position: absolute; inset: 0; z-index: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%);
    transition: var(--transition-theme);
  }
  .hero-orb {
    position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0;
    pointer-events: none;
  }
  .hero-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
    top: -100px; left: 50%; transform: translateX(-50%);
    transition: var(--transition-theme);
  }
  .hero-orb-2 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(56,100,200,0.08) 0%, transparent 70%);
    bottom: 50px; right: 10%;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px;
    border: 1px solid var(--accent-border);
    border-radius: 100px;
    background: var(--accent-glow);
    font-family: var(--font-mono);
    font-size: 11px; font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.10em; text-transform: uppercase;
    margin-bottom: 32px;
    position: relative; z-index: 1;
    animation: fadeInDown 0.6s ease both;
    transition: var(--transition-theme);
  }
  .hero-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }

  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(44px, 7vw, 88px);
    font-weight: 800;
    line-height: 1.02;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    position: relative; z-index: 1;
    animation: fadeInUp 0.7s 0.1s ease both;
    transition: color 0.25s;
  }
  .hero-title-accent { color: var(--accent); transition: color 0.25s; }

  .hero-sub {
    font-size: 18px; font-weight: 400;
    color: var(--text-muted);
    max-width: 560px;
    line-height: 1.75;
    margin: 24px auto 48px;
    position: relative; z-index: 1;
    animation: fadeInUp 0.7s 0.2s ease both;
    transition: color 0.25s;
  }

  .hero-actions {
    display: flex; gap: 16px; justify-content: center;
    position: relative; z-index: 1;
    animation: fadeInUp 0.7s 0.3s ease both;
  }
  .btn-lg { padding: 13px 30px; font-size: 15px; border-radius: 10px; font-weight: 600; }

  .hero-stats {
    display: flex; gap: 48px; justify-content: center;
    margin-top: 80px;
    padding-top: 48px;
    border-top: 1px solid var(--border);
    position: relative; z-index: 1;
    animation: fadeInUp 0.7s 0.4s ease both;
    width: 100%; max-width: 700px;
    transition: border-color 0.25s;
  }
  .stat-item { text-align: center; }
  .stat-num {
    font-family: var(--font-display);
    font-size: 36px; font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.03em;
    transition: color 0.25s;
  }
  .stat-num span { color: var(--accent); transition: color 0.25s; }
  .stat-label {
    font-family: var(--font-mono);
    font-size: 11px; color: var(--text-muted);
    margin-top: 6px; letter-spacing: 0.06em; text-transform: uppercase;
    transition: color 0.25s;
  }

  /* ── DASHBOARD PREVIEW ── */
  .dashboard-preview {
    padding: 0 48px 120px;
    position: relative;
    animation: fadeInUp 0.8s 0.5s ease both;
  }
  .dashboard-frame {
    max-width: 1100px; margin: 0 auto;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-frame);
    transition: var(--transition-theme);
  }
  .frame-header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 12px;
    background: var(--bg-elevated);
    transition: var(--transition-theme);
  }
  .frame-dots { display: flex; gap: 6px; }
  .frame-dot { width: 10px; height: 10px; border-radius: 50%; }
  .frame-dot-red    { background: #ff5f57; }
  .frame-dot-yellow { background: #febc2e; }
  .frame-dot-green  { background: #28c840; }
  .frame-title {
    font-family: var(--font-mono);
    font-size: 11px; color: var(--text-muted);
    flex: 1; text-align: center; letter-spacing: 0.05em;
    transition: color 0.25s;
  }
  .frame-body {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: 460px;
  }
  .sidebar {
    border-right: 1px solid var(--border);
    padding: 20px 0;
    background: var(--bg-elevated);
    transition: var(--transition-theme);
  }
  .sidebar-section { padding: 0 14px; margin-bottom: 24px; }
  .sidebar-label {
    font-family: var(--font-mono);
    font-size: 10px; font-weight: 500;
    color: var(--text-muted);
    letter-spacing: 0.12em; text-transform: uppercase;
    margin-bottom: 8px;
    transition: color 0.25s;
  }
  .sidebar-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: var(--radius-sm);
    font-size: 13px; color: var(--text-secondary);
    margin-bottom: 2px; cursor: pointer;
    transition: all 0.15s;
  }
  .sidebar-item:hover, .sidebar-item.active {
    background: var(--accent-glow);
    color: var(--accent);
  }
  .sidebar-item-icon { font-size: 14px; }
  .sidebar-badge {
    margin-left: auto;
    background: var(--accent);
    color: var(--accent-fg);
    font-family: var(--font-mono);
    font-size: 10px; font-weight: 700;
    padding: 2px 6px; border-radius: 100px;
  }

  .main-panel { padding: 24px; overflow: hidden; background: var(--bg-surface); transition: var(--transition-theme); }
  .panel-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .panel-title {
    font-family: var(--font-display);
    font-size: 18px; font-weight: 700;
    color: var(--text-primary);
    transition: color 0.25s;
  }
  .panel-date {
    font-family: var(--font-mono);
    font-size: 11px; color: var(--text-muted);
    transition: color 0.25s;
  }

  .kpi-row {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 12px;
    margin-bottom: 20px;
  }
  .kpi-card {
    background: var(--kpi-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-md); padding: 14px;
    transition: var(--transition-theme);
  }
  .kpi-label {
    font-family: var(--font-mono);
    font-size: 10px; color: var(--text-muted);
    margin-bottom: 8px; letter-spacing: 0.05em; text-transform: uppercase;
    transition: color 0.25s;
  }
  .kpi-value {
    font-family: var(--font-display);
    font-size: 26px; font-weight: 800;
    color: var(--text-primary);
    transition: color 0.25s;
  }
  .kpi-trend {
    font-size: 11px; margin-top: 4px;
    display: flex; align-items: center; gap: 4px;
    font-family: var(--font-mono);
  }
  .trend-up   { color: var(--status-green); }
  .trend-down { color: var(--status-red); }

  .chart-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; }
  .chart-card {
    background: var(--kpi-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-md); padding: 16px;
    transition: var(--transition-theme);
  }
  .chart-card-label {
    font-family: var(--font-mono);
    font-size: 11px; color: var(--text-muted);
    margin-bottom: 12px; letter-spacing: 0.05em; text-transform: uppercase;
    transition: color 0.25s;
  }
  .bar-chart {
    display: flex; align-items: flex-end;
    gap: 6px; height: 80px;
  }
  .bar {
    flex: 1; border-radius: 4px 4px 0 0;
    background: var(--accent);
    opacity: 0.65;
    transition: opacity 0.2s, background 0.25s;
    cursor: pointer;
  }
  .bar:hover { opacity: 1; }
  .bar.inactive { background: var(--border); opacity: 1; }

  .incident-list { display: flex; flex-direction: column; gap: 8px; }
  .incident-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: var(--radius-sm);
    background: var(--bg-surface);
    font-size: 12px;
    transition: var(--transition-theme);
  }
  .incident-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .dot-open     { background: var(--status-red); }
  .dot-progress { background: var(--accent); transition: background 0.25s; }
  .dot-resolved { background: var(--status-green); transition: background 0.25s; }
  .incident-name { color: var(--text-secondary); flex: 1; transition: color 0.25s; }
  .incident-tag {
    font-family: var(--font-mono);
    font-size: 10px; padding: 2px 8px; border-radius: 100px;
    font-weight: 500;
  }
  .tag-open     { background: var(--status-red-bg);   color: var(--status-red);   }
  .tag-progress { background: var(--status-amber-bg); color: var(--accent);       }
  .tag-resolved { background: var(--status-green-bg); color: var(--status-green); }

  /* ── FEATURES ── */
  .section {
    padding: 100px 48px;
    max-width: 1200px; margin: 0 auto;
  }
  .section-label {
    font-family: var(--font-mono);
    font-size: 11px; font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 10px;
    transition: color 0.25s;
  }
  .section-label::before {
    content: '';
    display: block; width: 24px; height: 1px;
    background: var(--accent);
    transition: background 0.25s;
  }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(30px, 4vw, 48px);
    font-weight: 800; letter-spacing: -0.025em;
    color: var(--text-primary);
    max-width: 600px; line-height: 1.1;
    margin-bottom: 16px;
    transition: color 0.25s;
  }
  .section-desc {
    font-size: 16px; color: var(--text-muted);
    max-width: 520px; line-height: 1.75;
    margin-bottom: 60px;
    transition: color 0.25s;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    background: var(--border);
    transition: var(--transition-theme);
  }
  .feature-card {
    background: var(--bg-surface);
    padding: 36px;
    cursor: pointer;
    transition: background 0.2s, var(--transition-theme);
    position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: '';
    position: absolute; inset: 0;
    background: var(--accent-glow);
    opacity: 0; transition: opacity 0.3s;
  }
  .feature-card:hover::before { opacity: 1; }
  .feature-card:hover .feature-icon-wrap { border-color: var(--accent-border); }
  .feature-icon-wrap {
    width: 48px; height: 48px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    margin-bottom: 20px;
    transition: border-color 0.3s, var(--transition-theme);
    position: relative; z-index: 1;
  }
  .feature-name {
    font-family: var(--font-display);
    font-size: 18px; font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 10px;
    position: relative; z-index: 1;
    transition: color 0.25s;
  }
  .feature-desc {
    font-size: 14px; color: var(--text-muted);
    line-height: 1.65;
    position: relative; z-index: 1;
    transition: color 0.25s;
  }
  .feature-link {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 20px;
    font-size: 13px; font-weight: 600;
    color: var(--accent);
    cursor: pointer;
    position: relative; z-index: 1;
    transition: gap 0.2s, color 0.25s;
  }
  .feature-card:hover .feature-link { gap: 10px; }

  /* ── ROLES ── */
  .roles-section {
    padding: 100px 48px;
    background: var(--bg-surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    transition: var(--transition-theme);
  }
  .roles-inner { max-width: 1200px; margin: 0 auto; }

  .roles-tabs {
    display: flex; gap: 4px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md); padding: 4px;
    margin-bottom: 48px;
    width: fit-content;
    transition: var(--transition-theme);
  }
  .role-tab {
    padding: 10px 22px; border-radius: 9px;
    border: 1px solid transparent;
    background: transparent;
    font-family: var(--font-body);
    font-size: 14px; font-weight: 400;
    color: var(--text-muted); cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .role-tab.active {
    background: var(--bg-base);
    color: var(--text-primary);
    border-color: var(--border);
  }
  .role-tab:hover:not(.active) { color: var(--text-secondary); }

  .role-content {
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
    align-items: start;
  }
  .role-title {
    font-family: var(--font-display);
    font-size: 36px; font-weight: 800;
    color: var(--text-primary); margin-bottom: 16px;
    letter-spacing: -0.025em;
    transition: color 0.25s;
  }
  .role-desc { font-size: 16px; color: var(--text-muted); line-height: 1.75; margin-bottom: 32px; transition: color 0.25s; }
  .role-perms { display: flex; flex-direction: column; gap: 10px; }
  .perm-item {
    display: flex; align-items: center; gap: 12px;
    font-size: 14px; color: var(--text-secondary);
    transition: color 0.25s;
  }
  .perm-check {
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--status-green-bg);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 10px; color: var(--status-green);
    transition: var(--transition-theme);
  }

  .role-visual {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 24px;
    transition: var(--transition-theme);
  }
  .mini-ui-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
    transition: border-color 0.25s;
  }
  .mini-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-size: 13px; font-weight: 700; color: var(--accent-fg);
    flex-shrink: 0;
    transition: background 0.25s, color 0.25s;
  }
  .mini-user-info { flex: 1; }
  .mini-user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); transition: color 0.25s; }
  .mini-user-role { font-size: 11px; color: var(--text-muted); transition: color 0.25s; }
  .mini-badge {
    font-family: var(--font-mono);
    font-size: 10px; padding: 3px 10px; border-radius: 100px;
    background: var(--accent-glow); color: var(--accent);
    border: 1px solid var(--accent-border);
    font-weight: 500;
    transition: var(--transition-theme);
  }
  .mini-actions { display: flex; flex-direction: column; gap: 8px; }
  .mini-action {
    padding: 10px 14px; border-radius: var(--radius-sm);
    background: var(--bg-surface); border: 1px solid var(--border);
    font-size: 12px; color: var(--text-secondary);
    display: flex; align-items: center; justify-content: space-between;
    transition: var(--transition-theme);
  }
  .mini-action-arrow { color: var(--text-muted); font-size: 12px; }

  /* ── WORKFLOW ── */
  .workflow-section { padding: 100px 48px; max-width: 1200px; margin: 0 auto; }
  .workflow-steps {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 0; position: relative;
    border: 1px solid var(--border);
    border-radius: var(--radius-xl); overflow: hidden;
    transition: var(--transition-theme);
  }
  .workflow-step {
    padding: 36px 28px;
    position: relative;
    border-right: 1px solid var(--border);
    background: var(--bg-surface);
    transition: var(--transition-theme);
  }
  .workflow-step:last-child { border-right: none; }
  .step-number {
    font-family: var(--font-display);
    font-size: 48px; font-weight: 800;
    color: var(--border);
    line-height: 1; margin-bottom: 16px;
    transition: color 0.25s;
  }
  .step-title {
    font-family: var(--font-display);
    font-size: 18px; font-weight: 700;
    color: var(--text-primary); margin-bottom: 10px;
    transition: color 0.25s;
  }
  .step-desc { font-size: 13px; color: var(--text-muted); line-height: 1.65; transition: color 0.25s; }
  .step-arrow {
    position: absolute; top: 38px; right: -10px;
    z-index: 2;
    color: var(--accent); font-size: 18px;
    transition: color 0.25s;
  }

  /* ── CTA ── */
  .cta-section {
    padding: 100px 48px;
    text-align: center;
    position: relative; overflow: hidden;
  }
  .cta-inner {
    max-width: 680px; margin: 0 auto; position: relative; z-index: 1;
  }
  .cta-orb {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 60% at 50% 50%, var(--accent-glow) 0%, transparent 70%);
    z-index: 0;
    transition: var(--transition-theme);
  }
  .cta-title {
    font-family: var(--font-display);
    font-size: clamp(32px, 5vw, 56px); font-weight: 800;
    color: var(--text-primary); line-height: 1.08;
    letter-spacing: -0.03em; margin-bottom: 20px;
    transition: color 0.25s;
  }
  .cta-desc { font-size: 16px; color: var(--text-muted); margin-bottom: 40px; line-height: 1.7; transition: color 0.25s; }
  .cta-buttons { display: flex; gap: 16px; justify-content: center; }

  /* ── FOOTER ── */
  .footer {
    border-top: 1px solid var(--border);
    padding: 36px 48px;
    display: flex; align-items: center; justify-content: space-between;
    background: var(--bg-surface);
    transition: var(--transition-theme);
  }
  .footer-copy {
    font-family: var(--font-mono);
    font-size: 12px; color: var(--text-muted);
    transition: color 0.25s;
  }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a {
    font-size: 13px; color: var(--text-muted); text-decoration: none;
    transition: color 0.2s;
  }
  .footer-links a:hover { color: var(--accent); }

  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 900px) {
    .nav { padding: 0 20px; }
    .nav-links { display: none; }
    .hero { padding: 100px 20px 60px; }
    .hero-stats { gap: 24px; flex-wrap: wrap; }
    .dashboard-preview { padding: 0 20px 80px; }
    .frame-body { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .kpi-row { grid-template-columns: repeat(2,1fr); }
    .chart-row { grid-template-columns: 1fr; }
    .section { padding: 60px 20px; }
    .features-grid { grid-template-columns: 1fr; }
    .roles-section { padding: 60px 20px; }
    .role-content { grid-template-columns: 1fr; }
    .roles-tabs { flex-wrap: wrap; }
    .workflow-steps { grid-template-columns: 1fr 1fr; }
    .footer { flex-direction: column; gap: 16px; text-align: center; }
  }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: "🏛️", name: "Facility Booking",   desc: "Reserve lecture halls, labs, and meeting rooms in real time with live availability. Conflict detection and smart scheduling built in.", link: "Explore bookings" },
  { icon: "🔧", name: "Maintenance Hub",     desc: "Submit fault reports, track technician assignments, and monitor resolution status across all campus infrastructure.", link: "View incidents" },
  { icon: "🖥️", name: "Asset Management",   desc: "Track equipment, projectors, and lab instruments. Book assets, record usage, and get alerted when maintenance is due.", link: "Manage assets" },
  { icon: "👥", name: "Role-Based Access",   desc: "Fine-grained permissions for students, faculty, technicians, and administrators. Everyone sees exactly what they need.", link: "Configure roles" },
  { icon: "📊", name: "Analytics & Audit",  desc: "Full audit trail on every action. Utilization reports, peak-time heatmaps, and exportable logs for compliance.", link: "See reports" },
  { icon: "🔔", name: "Real-Time Alerts",   desc: "Instant notifications for booking confirmations, fault escalations, and technician updates via email and in-app.", link: "Configure alerts" },
];

const roles = [
  { id: "admin",     label: "🛡️ Admin",      title: "Full Operational Control",   desc: "Oversee the entire platform — manage users, configure resources, review audit logs, and generate compliance reports.", perms: ["Manage all users and roles","Configure facilities and assets","View full audit trail","Generate utilization reports","Override any booking or incident"], avatarInitials: "SA", avatarLabel: "System Admin",  badgeLabel: "Administrator" },
  { id: "faculty",   label: "🎓 Faculty",    title: "Book & Report with Ease",    desc: "Reserve classrooms and equipment for lectures, submit maintenance requests, and track the status of your reports.", perms: ["Book rooms and equipment","Submit fault reports","View personal booking history","Receive booking confirmations","Track incident resolutions"], avatarInitials: "DR", avatarLabel: "Dr. Perera",   badgeLabel: "Faculty" },
  { id: "technician",label: "⚙️ Technician", title: "Resolve & Update Efficiently",desc: "View assigned maintenance tasks, update resolution status, and log time spent. Keep the campus running smoothly.", perms: ["View assigned incidents","Update incident status","Log work notes and time","Access asset service history","Escalate critical faults"], avatarInitials: "TK", avatarLabel: "T. Kumara",    badgeLabel: "Technician" },
  { id: "student",   label: "🧑‍💻 Student",   title: "Access Resources Smoothly",  desc: "Book available study rooms and lab equipment for personal or group use. Check availability and manage your reservations.", perms: ["Book study rooms and labs","Reserve equipment","View own bookings","Cancel upcoming reservations","Report basic facility issues"], avatarInitials: "AS", avatarLabel: "A. Silva",     badgeLabel: "Student" },
];

const incidents = [
  { name: "Lab A-102 projector fault",    dotClass: "dot-open",     tag: "tag-open",     statusLabel: "Open" },
  { name: "HVAC in Lecture Hall 3",       dotClass: "dot-progress", tag: "tag-progress", statusLabel: "In Progress" },
  { name: "Network switch B-201",         dotClass: "dot-resolved", tag: "tag-resolved", statusLabel: "Resolved" },
];

const barHeights  = [40, 65, 55, 80, 70, 45, 60];
const barLabels   = ["M","T","W","T","F","S","S"];

const workflowSteps = [
  { num: "01", title: "Submit Request",    desc: "Faculty or students submit a booking or incident report via the portal with all required details." },
  { num: "02", title: "Auto Assignment",   desc: "The system validates the request and routes it — booking is confirmed or assigned to a technician." },
  { num: "03", title: "Real-Time Updates", desc: "Stakeholders receive live status updates as technicians work or booking reminders approach." },
  { num: "04", title: "Resolve & Audit",   desc: "Resolutions are logged. Admins can audit every action with timestamps for full accountability." },
];

// ─── Theme hook ───────────────────────────────────────────────────────────────
function useTheme() {
  const getPreferredTheme = () =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const [theme, setTheme] = useState(getPreferredTheme);

  // Apply CSS variables to :root whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    const vars = themes[theme];
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [theme]);

  // Listen to OS preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setTheme(e.matches ? "dark" : "light");

    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handler);
      } else if (mq.removeListener) {
        mq.removeListener(handler);
      }
    };
  }, []);

  return { theme };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { theme } = useTheme();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeRole, setActiveRole] = useState("admin");
  const [counter, setCounter] = useState({ bookings: 0, assets: 0, incidents: 0, uptime: 0 });

  // Navigate to the appropriate dashboard based on user role
  const goToDashboard = () => {
    if (hasRole('ROLE_ADMIN')) navigate('/admin');
    else if (hasRole('ROLE_TECHNICIAN')) navigate('/technician');
    else navigate('/dashboard');
  };

  // Initiate Google OAuth sign-in (redirect to backend)
  const handleSignIn = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animated counters
  useEffect(() => {
    const targets = { bookings: 1240, assets: 380, incidents: 47, uptime: 99 };
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCounter({
        bookings:  Math.round(targets.bookings  * ease),
        assets:    Math.round(targets.assets    * ease),
        incidents: Math.round(targets.incidents * ease),
        uptime:    Math.round(targets.uptime    * ease),
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const currentRole = roles.find(r => r.id === activeRole);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* ── NAV ── */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <a className="nav-logo" href="#">
          <span className="nav-logo-icon">🏛</span>
          SmartCampus
        </a>
        <ul className="nav-links">
          <li><a href="#">Facilities</a></li>
          <li><a href="#">Maintenance</a></li>
          <li><a href="#">Assets</a></li>
          <li><a href="#">Reports</a></li>
        </ul>
        <div className="nav-right">
          {isAuthenticated ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '5px 14px 5px 5px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: '100px', cursor: 'pointer',
              }} onClick={goToDashboard}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-fg)',
                  overflow: 'hidden',
                }}>
                  {user?.picture
                    ? <img src={user.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (user?.name?.charAt(0) || 'U')}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {user?.name?.split(' ')[0] || 'Dashboard'}
                </span>
              </div>
              <button className="btn-ghost" onClick={() => { logout(); }}>Sign Out</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={handleSignIn}>
                <span style={{ marginRight: '6px' }}>🔑</span> Sign In with Google
              </button>
              <button className="btn-primary" onClick={handleSignIn}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="hero-badge">
          <span className="hero-badge-dot" />
          University Operations Platform
        </div>

        <h1 className="hero-title">
          Campus Operations,<br />
          <span className="hero-title-accent">Reimagined.</span>
        </h1>

        <p className="hero-sub">
          One intelligent platform to book facilities, manage assets, and resolve
          maintenance incidents — with full audit trails and role-based access.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <button className="btn-primary btn-lg" onClick={goToDashboard}>Go to Dashboard →</button>
          ) : (
            <>
              <button className="btn-primary btn-lg" onClick={handleSignIn}>
                <span style={{ marginRight: '8px' }}>🔑</span> Sign In with Google
              </button>
              <button className="btn-ghost btn-lg" onClick={handleSignIn}>Request Access</button>
            </>
          )}
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-num">{counter.bookings.toLocaleString()}<span>+</span></div>
            <div className="stat-label">Bookings this semester</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{counter.assets}<span>+</span></div>
            <div className="stat-label">Assets tracked</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{counter.incidents}</div>
            <div className="stat-label">Open incidents</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{counter.uptime}<span>%</span></div>
            <div className="stat-label">Platform uptime</div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <div className="dashboard-preview">
        <div className="dashboard-frame">
          <div className="frame-header">
            <div className="frame-dots">
              <div className="frame-dot frame-dot-red" />
              <div className="frame-dot frame-dot-yellow" />
              <div className="frame-dot frame-dot-green" />
            </div>
            <span className="frame-title">SmartCampus Operations Hub — Dashboard</span>
          </div>
          <div className="frame-body">
            {/* Sidebar */}
            <div className="sidebar">
              <div className="sidebar-section">
                <div className="sidebar-label">Overview</div>
                <div className="sidebar-item active"><span className="sidebar-item-icon">📊</span> Dashboard</div>
                <div className="sidebar-item"><span className="sidebar-item-icon">📅</span> Bookings <span className="sidebar-badge">3</span></div>
                <div className="sidebar-item"><span className="sidebar-item-icon">🏛️</span> Facilities</div>
                <div className="sidebar-item"><span className="sidebar-item-icon">🖥️</span> Assets</div>
              </div>
              <div className="sidebar-section">
                <div className="sidebar-label">Maintenance</div>
                <div className="sidebar-item"><span className="sidebar-item-icon">🔧</span> Incidents <span className="sidebar-badge">7</span></div>
                <div className="sidebar-item"><span className="sidebar-item-icon">👷</span> Technicians</div>
              </div>
              <div className="sidebar-section">
                <div className="sidebar-label">System</div>
                <div className="sidebar-item"><span className="sidebar-item-icon">👥</span> Users</div>
                <div className="sidebar-item"><span className="sidebar-item-icon">📋</span> Audit Log</div>
              </div>
            </div>

            {/* Main panel */}
            <div className="main-panel">
              <div className="panel-header">
                <div className="panel-title">Operations Dashboard</div>
                <div className="panel-date">Wednesday, 2 April 2026</div>
              </div>
              <div className="kpi-row">
                {[
                  { label: "Active Bookings", val: "24", trend: "+12%",    up: true  },
                  { label: "Open Incidents",  val: "7",  trend: "−3 today", up: false },
                  { label: "Available Rooms", val: "18", trend: "of 34",   up: true  },
                  { label: "Assets In Use",   val: "142",trend: "+8 today", up: true  },
                ].map((k) => (
                  <div className="kpi-card" key={k.label}>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value">{k.val}</div>
                    <div className={`kpi-trend ${k.up ? "trend-up" : "trend-down"}`}>
                      {k.up ? "↑" : "↓"} {k.trend}
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-row">
                <div className="chart-card">
                  <div className="chart-card-label">Bookings this week</div>
                  <div className="bar-chart">
                    {barHeights.map((h, i) => (
                      <div
                        key={i}
                        className={`bar ${i === 5 || i === 6 ? "inactive" : ""}`}
                        style={{ height: `${h}%` }}
                        title={`${barLabels[i]}: ${h} bookings`}
                      />
                    ))}
                  </div>
                </div>
                <div className="chart-card">
                  <div className="chart-card-label">Recent incidents</div>
                  <div className="incident-list">
                    {incidents.map((inc) => (
                      <div className="incident-row" key={inc.name}>
                        <div className={`incident-dot ${inc.dotClass}`} />
                        <div className="incident-name">{inc.name}</div>
                        <div className={`incident-tag ${inc.tag}`}>{inc.statusLabel}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="section">
        <div className="section-label">Platform Capabilities</div>
        <h2 className="section-title">Everything your campus needs, unified.</h2>
        <p className="section-desc">
          Built for universities with real operational complexity — not a generic
          booking tool retrofitted for education.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.name}>
              <div className="feature-icon-wrap">{f.icon}</div>
              <div className="feature-name">{f.name}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-link">{f.link} →</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="roles-section">
        <div className="roles-inner">
          <div className="section-label">Role-Based Access</div>
          <h2 className="section-title">Designed for every stakeholder.</h2>
          <p className="section-desc">
            Each role gets a tailored experience — right information, right permissions, zero noise.
          </p>
          <div className="roles-tabs">
            {roles.map((r) => (
              <button
                key={r.id}
                className={`role-tab ${activeRole === r.id ? "active" : ""}`}
                onClick={() => setActiveRole(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="role-content">
            <div>
              <div className="role-title">{currentRole.title}</div>
              <p className="role-desc">{currentRole.desc}</p>
              <div className="role-perms">
                {currentRole.perms.map((p) => (
                  <div className="perm-item" key={p}>
                    <div className="perm-check">✓</div>
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="role-visual">
              <div className="mini-ui-header">
                <div className="mini-avatar">{currentRole.avatarInitials}</div>
                <div className="mini-user-info">
                  <div className="mini-user-name">{currentRole.avatarLabel}</div>
                  <div className="mini-user-role">{currentRole.badgeLabel} — SmartCampus</div>
                </div>
                <div className="mini-badge">{currentRole.badgeLabel}</div>
              </div>
              <div className="mini-actions">
                {currentRole.perms.map((p) => (
                  <div className="mini-action" key={p}>
                    <span style={{ fontSize: "12px" }}>{p}</span>
                    <span className="mini-action-arrow">→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ── */}
      <section className="workflow-section">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">From request to resolution.</h2>
        <p className="section-desc" style={{ marginBottom: "48px" }}>
          A clear, auditable workflow for every booking and every incident.
        </p>
        <div className="workflow-steps">
          {workflowSteps.map((s, i) => (
            <div className="workflow-step" key={s.num}>
              <div className="step-number">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
              {i < workflowSteps.length - 1 && (
                <div className="step-arrow">›</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-orb" />
        <div className="cta-inner">
          <h2 className="cta-title">Ready to modernize your campus?</h2>
          <p className="cta-desc">
            Request administrator access or explore the platform with a demo account.
            Set up takes under 10 minutes.
          </p>
          <div className="cta-buttons">
            {isAuthenticated ? (
              <button className="btn-primary btn-lg" onClick={goToDashboard}>Open Dashboard</button>
            ) : (
              <button className="btn-primary btn-lg" onClick={handleSignIn}>
                <span style={{ marginRight: '8px' }}>🔑</span> Sign In with Google
              </button>
            )}
            <button className="btn-ghost btn-lg">View Documentation</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-copy">© 2026 SmartCampus Operations Hub. University Technology Division.</div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">API Docs</a>
          <a href="#">Support</a>
        </div>
      </footer>
    </>
  );
}