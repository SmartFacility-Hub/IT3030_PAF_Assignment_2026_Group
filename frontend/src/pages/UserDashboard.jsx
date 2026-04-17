import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketApi, API_BASE_URL } from "../services/api";

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
    "--status-red": "#f87171", "--status-red-bg": "rgba(248,113,113,0.15)",
    "--status-amber": "#fbbf24", "--status-amber-bg": "rgba(245,166,35,0.15)",
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
    "--status-red": "#dc2626", "--status-red-bg": "rgba(220,38,38,0.10)",
    "--status-amber": "#d97706", "--status-amber-bg": "rgba(212,132,10,0.12)",
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
  .ud-btn-primary {
    padding: 8px 16px; border: none; border-radius: var(--radius-sm);
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-body); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .ud-btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
  .ud-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .ud-theme-toggle {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: all 0.2s;
  }
  .ud-theme-toggle:hover { transform: rotate(12deg) scale(1.1); border-color: var(--accent-border); }

  .ud-main {
    max-width: 1000px; margin: 0 auto;
    padding: 100px 40px 60px;
  }
  .ud-greeting {
    font-family: var(--font-display); font-size: 32px; font-weight: 800;
    color: var(--text-primary); margin-bottom: 6px;
  }
  .ud-subtitle { font-size: 15px; color: var(--text-muted); margin-bottom: 40px; }

  .ud-profile-section {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 28px; margin-bottom: 32px;
  }
  .ud-profile-header { display: flex; align-items: center; gap: 16px; }
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

  /* ── Tickets Section ── */
  .ud-tickets-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 32px;
  }
  .ud-tickets-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid var(--border);
  }
  .ud-tickets-title {
    font-family: var(--font-display); font-size: 15px; font-weight: 700;
    color: var(--text-primary); display: flex; align-items: center; gap: 8px;
  }
  .ud-filter-row {
    display: flex; gap: 8px; align-items: center;
    padding: 12px 22px; border-bottom: 1px solid var(--border);
  }
  .ud-filter-btn {
    padding: 5px 14px; border-radius: 100px; font-family: var(--font-mono);
    font-size: 10px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
    border: 1px solid var(--border); background: transparent; cursor: pointer;
    color: var(--text-muted); transition: all 0.15s;
  }
  .ud-filter-btn:hover, .ud-filter-btn.active {
    border-color: var(--accent-border); color: var(--accent); background: var(--accent-glow);
  }

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

  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    padding: 3px 10px; border-radius: 100px; white-space: nowrap;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .badge.OPEN     { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.IN_PROGRESS { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.RESOLVED { background: var(--status-green-bg); color: var(--status-green); }
  .badge.CLOSED   { background: var(--bg-elevated);     color: var(--text-muted); }
  .badge.REJECTED { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.HIGH     { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.CRITICAL { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.MEDIUM   { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.LOW      { background: var(--bg-elevated);     color: var(--text-muted); }

  /* ── Modal overlay ── */
  .ud-modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }
  .ud-modal {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-xl); padding: 32px;
    width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
    box-shadow: var(--shadow-card);
  }
  .ud-modal-title {
    font-family: var(--font-display); font-size: 20px; font-weight: 700;
    color: var(--text-primary); margin-bottom: 24px;
    display: flex; align-items: center; gap: 10px;
  }
  .ud-form-group { margin-bottom: 18px; }
  .ud-label {
    display: block; font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 6px;
  }
  .ud-input, .ud-select, .ud-textarea {
    width: 100%; padding: 10px 14px;
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text-primary);
    font-family: var(--font-body); font-size: 13px;
    transition: border-color 0.2s; outline: none;
  }
  .ud-input:focus, .ud-select:focus, .ud-textarea:focus {
    border-color: var(--accent-border);
  }
  .ud-textarea { resize: vertical; min-height: 80px; }
  .ud-select { cursor: pointer; }
  .ud-select option { background: var(--bg-surface); }
  .ud-file-input {
    display: none;
  }
  .ud-file-label {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; background: var(--bg-elevated);
    border: 1px dashed var(--border); border-radius: var(--radius-sm);
    cursor: pointer; font-size: 13px; color: var(--text-muted); transition: all 0.2s;
  }
  .ud-file-label:hover { border-color: var(--accent-border); color: var(--text-primary); }
  .ud-file-preview { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
  .ud-file-chip {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 10px; background: var(--bg-elevated);
    border: 1px solid var(--border); border-radius: 100px;
    font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono);
  }
  .ud-file-chip button {
    background: none; border: none; cursor: pointer; color: var(--status-red); font-size: 12px; padding: 0;
  }
  .ud-modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
  .ud-error {
    padding: 10px 14px; background: var(--status-red-bg);
    border: 1px solid var(--status-red); border-radius: var(--radius-sm);
    color: var(--status-red); font-size: 13px; margin-bottom: 16px;
  }

  /* ── Detail Panel ── */
  .ud-panel-overlay {
    position: fixed; inset: 0; z-index: 150;
    background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);
  }
  .ud-panel {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 160;
    width: 480px; max-width: 95vw;
    background: var(--bg-surface); border-left: 1px solid var(--border);
    display: flex; flex-direction: column;
    box-shadow: -8px 0 40px rgba(0,0,0,0.3);
    animation: slideIn 0.25s ease;
  }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .ud-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .ud-panel-title {
    font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary);
  }
  .ud-panel-close {
    width: 32px; height: 32px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: var(--text-muted); transition: all 0.2s;
  }
  .ud-panel-close:hover { border-color: var(--accent-border); color: var(--text-primary); }
  .ud-panel-body { flex: 1; overflow-y: auto; padding: 22px; }
  .ud-detail-field { margin-bottom: 16px; }
  .ud-detail-label {
    font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;
  }
  .ud-detail-value { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
  .ud-detail-value strong { color: var(--text-primary); }
  .ud-section-divider {
    border: none; border-top: 1px solid var(--border); margin: 20px 0;
  }
  .ud-attachments { display: flex; gap: 10px; flex-wrap: wrap; }
  .ud-attachment-img {
    width: 90px; height: 90px; object-fit: cover; border-radius: var(--radius-sm);
    border: 1px solid var(--border); cursor: pointer; transition: opacity 0.2s;
  }
  .ud-attachment-img:hover { opacity: 0.8; }

  /* ── Comments ── */
  .ud-comment-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
  .ud-comment-item {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 12px 14px;
  }
  .ud-comment-meta {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;
  }
  .ud-comment-author { font-size: 11px; font-weight: 600; color: var(--text-primary); }
  .ud-comment-time { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .ud-comment-text { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
  .ud-comment-actions { display: flex; gap: 6px; margin-top: 8px; }
  .ud-comment-action-btn {
    padding: 3px 10px; border-radius: var(--radius-sm);
    font-size: 11px; font-family: var(--font-mono); cursor: pointer; transition: all 0.15s;
    border: 1px solid var(--border); background: transparent; color: var(--text-muted);
  }
  .ud-comment-action-btn:hover { border-color: var(--accent-border); color: var(--accent); }
  .ud-comment-action-btn.delete:hover { border-color: var(--status-red); color: var(--status-red); }
  .ud-comment-input-row { display: flex; gap: 8px; align-items: flex-end; }
  .ud-comment-input-row .ud-textarea { margin: 0; flex: 1; min-height: 60px; }
  .ud-empty-state {
    text-align: center; padding: 32px 0;
    font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);
  }

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

// ─── Status badge helper ───────────────────────────────────────────────────────
const STATUS_DOT = {
  OPEN: "var(--status-red)", IN_PROGRESS: "var(--status-amber)",
  RESOLVED: "var(--status-green)", CLOSED: "var(--text-muted)", REJECTED: "var(--status-red)",
};
const STATUS_LABEL = {
  OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved",
  CLOSED: "Closed", REJECTED: "Rejected",
};

function StatusBadge({ status }) {
  return (
    <span className={`badge ${status}`}>
      <span className="badge-dot" style={{ background: STATUS_DOT[status] }} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return <span className={`badge ${priority}`}>{priority}</span>;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Create Ticket Modal ───────────────────────────────────────────────────────
function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    resourceLocation: "", category: "IT_EQUIPMENT", description: "",
    priority: "MEDIUM", contactDetails: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleField = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFiles = e => {
    const picked = Array.from(e.target.files).slice(0, 3 - files.length);
    setFiles(f => [...f, ...picked].slice(0, 3));
    e.target.value = "";
  };

  const removeFile = idx => setFiles(f => f.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (form.description.length < 10) { setError("Description must be at least 10 characters."); return; }
    setLoading(true);
    try {
      const res = await ticketApi.create(form);
      const ticketId = res.data.id;
      // Upload attachments sequentially
      for (const file of files) {
        try { await ticketApi.uploadAttachment(ticketId, file); } catch (_) {}
      }
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ud-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ud-modal">
        <div className="ud-modal-title">🔧 Report an Issue</div>
        {error && <div className="ud-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="ud-form-group">
            <label className="ud-label">Resource / Location *</label>
            <input className="ud-input" name="resourceLocation" required
              placeholder="e.g. Lab 3, Building A"
              value={form.resourceLocation} onChange={handleField} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="ud-form-group">
              <label className="ud-label">Category *</label>
              <select className="ud-select" name="category" value={form.category} onChange={handleField}>
                {["IT_EQUIPMENT","HVAC","ELECTRICAL","PLUMBING","FURNITURE","OTHER"].map(c => (
                  <option key={c} value={c}>{c.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="ud-form-group">
              <label className="ud-label">Priority *</label>
              <select className="ud-select" name="priority" value={form.priority} onChange={handleField}>
                {["LOW","MEDIUM","HIGH","CRITICAL"].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="ud-form-group">
            <label className="ud-label">Description * (10–1000 chars)</label>
            <textarea className="ud-textarea" name="description" required
              placeholder="Describe the issue clearly…"
              value={form.description} onChange={handleField} />
          </div>
          <div className="ud-form-group">
            <label className="ud-label">Contact Details *</label>
            <input className="ud-input" name="contactDetails" required
              placeholder="e.g. your@email.lk or ext. 1234"
              value={form.contactDetails} onChange={handleField} />
          </div>
          <div className="ud-form-group">
            <label className="ud-label">Image Attachments (up to 3)</label>
            {files.length < 3 && (
              <>
                <label className="ud-file-label" htmlFor="ud-file-input">
                  📎 Choose image file
                </label>
                <input id="ud-file-input" className="ud-file-input" type="file"
                  accept="image/*" onChange={handleFiles} />
              </>
            )}
            {files.length > 0 && (
              <div className="ud-file-preview" style={{ marginTop: 8 }}>
                {files.map((f, i) => (
                  <div key={i} className="ud-file-chip">
                    {f.name}
                    <button type="button" onClick={() => removeFile(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="ud-modal-footer">
            <button type="button" className="ud-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="ud-btn-primary" disabled={loading}>
              {loading ? "Submitting…" : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Ticket Detail Panel ───────────────────────────────────────────────────────
function TicketDetailPanel({ ticket, onClose, onRefresh }) {
  const [comments, setComments] = useState(ticket.comments || []);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const attachUrl = (tid, aid) =>
    `${API_BASE_URL}/api/tickets/${tid}/attachments/${aid}/download`;
  const token = localStorage.getItem("token");

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await ticketApi.addComment(ticket.id, newComment.trim());
      setComments(c => [...c, res.data]);
      setNewComment("");
    } catch (_) {} finally { setSubmitting(false); }
  };

  const handleEditSave = async (commentId) => {
    try {
      const res = await ticketApi.editComment(ticket.id, commentId, editingText);
      setComments(c => c.map(x => x.id === commentId ? res.data : x));
      setEditingId(null);
    } catch (_) {}
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await ticketApi.deleteComment(ticket.id, commentId);
      setComments(c => c.filter(x => x.id !== commentId));
    } catch (_) {}
  };

  return (
    <>
      <div className="ud-panel-overlay" onClick={onClose} />
      <aside className="ud-panel">
        <div className="ud-panel-header">
          <div className="ud-panel-title">🎫 Ticket #{ticket.id}</div>
          <button className="ud-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="ud-panel-body">
          {/* Status + Priority */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span className={`badge ${ticket.category}`}
              style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
              {ticket.category?.replace("_", " ")}
            </span>
          </div>

          <div className="ud-detail-field">
            <div className="ud-detail-label">Resource / Location</div>
            <div className="ud-detail-value"><strong>{ticket.resourceLocation}</strong></div>
          </div>
          <div className="ud-detail-field">
            <div className="ud-detail-label">Description</div>
            <div className="ud-detail-value">{ticket.description}</div>
          </div>
          <div className="ud-detail-field">
            <div className="ud-detail-label">Contact</div>
            <div className="ud-detail-value">{ticket.contactDetails}</div>
          </div>
          {ticket.assignedTo && (
            <div className="ud-detail-field">
              <div className="ud-detail-label">Assigned To</div>
              <div className="ud-detail-value">{ticket.assignedTo}</div>
            </div>
          )}
          {ticket.resolutionNotes && (
            <div className="ud-detail-field">
              <div className="ud-detail-label">Resolution Notes</div>
              <div className="ud-detail-value" style={{ color: "var(--status-green)" }}>
                {ticket.resolutionNotes}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div className="ud-detail-field" style={{ margin: 0 }}>
              <div className="ud-detail-label">Created</div>
              <div className="ud-detail-value">{formatDate(ticket.createdAt)}</div>
            </div>
            <div className="ud-detail-field" style={{ margin: 0 }}>
              <div className="ud-detail-label">Updated</div>
              <div className="ud-detail-value">{formatDate(ticket.updatedAt)}</div>
            </div>
          </div>

          {/* Attachments */}
          {ticket.attachments?.length > 0 && (
            <>
              <hr className="ud-section-divider" />
              <div className="ud-detail-label" style={{ marginBottom: 10 }}>Attachments</div>
              <div className="ud-attachments">
                {ticket.attachments.map(a => (
                  <img key={a.id}
                    className="ud-attachment-img"
                    src={attachUrl(ticket.id, a.id)}
                    alt={a.originalFileName}
                    title={a.originalFileName}
                    onClick={() => window.open(attachUrl(ticket.id, a.id), "_blank")}
                    onError={e => { e.target.style.display = "none"; }}
                    {...(token ? {} : {})}
                  />
                ))}
              </div>
            </>
          )}

          {/* Comments */}
          <hr className="ud-section-divider" />
          <div className="ud-detail-label" style={{ marginBottom: 12 }}>
            Comments ({comments.length})
          </div>

          <div className="ud-comment-list">
            {comments.length === 0 && (
              <div className="ud-empty-state">No comments yet.</div>
            )}
            {comments.map(c => (
              <div key={c.id} className="ud-comment-item">
                <div className="ud-comment-meta">
                  <span className="ud-comment-author">{c.createdBy}</span>
                  <span className="ud-comment-time">
                    {formatDate(c.createdAt)} {formatTime(c.createdAt)}
                  </span>
                </div>
                {editingId === c.id ? (
                  <>
                    <textarea className="ud-textarea" style={{ minHeight: 56 }}
                      value={editingText} onChange={e => setEditingText(e.target.value)} />
                    <div className="ud-comment-actions">
                      <button className="ud-comment-action-btn"
                        onClick={() => handleEditSave(c.id)}>Save</button>
                      <button className="ud-comment-action-btn"
                        onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ud-comment-text">{c.content}</div>
                    {c.isOwner && (
                      <div className="ud-comment-actions">
                        <button className="ud-comment-action-btn"
                          onClick={() => { setEditingId(c.id); setEditingText(c.content); }}>
                          Edit
                        </button>
                        <button className="ud-comment-action-btn delete"
                          onClick={() => handleDelete(c.id)}>Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div className="ud-comment-input-row">
            <textarea className="ud-textarea"
              placeholder="Add a comment…"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleAddComment(); }}
            />
            <button className="ud-btn-primary" style={{ flexShrink: 0 }}
              onClick={handleAddComment} disabled={submitting || !newComment.trim()}>
              {submitting ? "…" : "Send"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            Ctrl+Enter to send
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const filters = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketApi.fetchAll(filter === "ALL" ? undefined : filter);
      setTickets(res.data);
    } catch (_) {} finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const roleLabels = { ROLE_USER: "User", ROLE_ADMIN: "Admin", ROLE_TECHNICIAN: "Technician" };

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
          <button className="ud-btn-primary" onClick={() => setShowCreate(true)}>
            ＋ New Ticket
          </button>
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
          <p className="ud-subtitle">Your SmartCampus dashboard — track and manage your incident tickets.</p>
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

        {/* My Tickets */}
        <div className="ud-tickets-card fade-in-2">
          <div className="ud-tickets-header">
            <div className="ud-tickets-title">🎫 My Tickets
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11,
                background: "var(--accent-glow)", color: "var(--accent)",
                padding: "2px 8px", borderRadius: "100px", marginLeft: 6 }}>
                {tickets.length}
              </span>
            </div>
            <button className="ud-btn-ghost" style={{ fontSize: 12 }} onClick={fetchTickets}>
              ↺ Refresh
            </button>
          </div>

          {/* Filter tabs */}
          <div className="ud-filter-row">
            {filters.map(f => (
              <button key={f} className={`ud-filter-btn${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}>
                {f === "ALL" ? "All" : STATUS_LABEL[f] || f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="ud-empty-state">Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="ud-empty-state">
              No tickets found. Click "New Ticket" to report an issue.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Location</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id} onClick={() => setSelectedTicket(t)}>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        #{t.id}
                      </td>
                      <td>{t.resourceLocation}</td>
                      <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {t.category?.replace("_", " ")}
                      </td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                        {formatDate(t.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchTickets(); }}
        />
      )}
      {selectedTicket && (
        <TicketDetailPanel
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onRefresh={fetchTickets}
        />
      )}
    </>
  );
}
