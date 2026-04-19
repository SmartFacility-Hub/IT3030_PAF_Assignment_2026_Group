import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketApi, API_BASE_URL } from "../services/api";
import NotificationBell from "../components/NotificationBell";
import { ticketApi, resolveAttachmentImageSrc } from "../services/api";

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

// ─── All existing styles kept + new modal/panel styles added ─────────────────
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

  /* ── Topbar (unchanged) ── */
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
  .td-btn-primary {
    padding: 8px 16px; border: none; border-radius: var(--radius-sm);
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-body); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  }
  .td-btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
  .td-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .td-theme-toggle {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; transition: all 0.2s;
  }
  .td-theme-toggle:hover { transform: rotate(12deg) scale(1.1); border-color: var(--accent-border); }

  /* ── Main layout (unchanged) ── */
  .td-main { max-width: 1000px; margin: 0 auto; padding: 100px 40px 60px; }
  .td-greeting { font-family: var(--font-display); font-size: 28px; font-weight: 800; margin-bottom: 6px; }
  .td-subtitle { font-size: 14px; color: var(--text-muted); margin-bottom: 32px; }

  /* ── KPI mini row ── */
  .td-kpi-row {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;
  }
  .td-kpi {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 16px 20px;
  }
  .td-kpi-val {
    font-family: var(--font-display); font-size: 28px; font-weight: 800;
    color: var(--text-primary); line-height: 1;
  }
  .td-kpi-lbl {
    font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.06em; margin-top: 6px;
  }

  /* ── Table card (unchanged) ── */
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
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; cursor: pointer; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--bg-elevated); }
  td { padding: 12px 16px; color: var(--text-secondary); vertical-align: middle; }
  td:first-child { padding-left: 22px; color: var(--text-primary); font-weight: 500; }

  /* ── Badges (unchanged style, expanded) ── */
  .td-badge {
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    padding: 3px 10px; border-radius: 100px; display: inline-flex; align-items: center; gap: 5px;
  }
  .td-badge-dot { width: 5px; height: 5px; border-radius: 50%; }

  /* ── Modal overlay ── */
  .td-modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .td-modal {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 28px;
    width: 100%; max-width: 460px; box-shadow: var(--shadow-card);
  }
  .td-modal-title {
    font-family: var(--font-display); font-size: 17px; font-weight: 700;
    color: var(--text-primary); margin-bottom: 20px;
  }
  .td-form-group { margin-bottom: 16px; }
  .td-label {
    display: block; font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;
  }
  .td-select, .td-textarea {
    width: 100%; padding: 10px 14px;
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text-primary);
    font-family: var(--font-body); font-size: 13px; outline: none;
    transition: border-color 0.2s;
  }
  .td-select:focus, .td-textarea:focus { border-color: var(--accent-border); }
  .td-textarea { resize: vertical; min-height: 72px; }
  .td-select option { background: var(--bg-surface); }
  .td-modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .td-error {
    padding: 10px 14px; background: var(--status-red-bg); border: 1px solid var(--status-red);
    border-radius: var(--radius-sm); color: var(--status-red); font-size: 13px; margin-bottom: 14px;
  }

  /* ── Detail Panel ── */
  .td-panel-overlay { position: fixed; inset: 0; z-index: 150; background: rgba(0,0,0,0.4); }
  .td-panel {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 160;
    width: 460px; max-width: 95vw;
    background: var(--bg-surface); border-left: 1px solid var(--border);
    display: flex; flex-direction: column;
    box-shadow: -8px 0 40px rgba(0,0,0,0.3);
    animation: slideIn 0.25s ease;
  }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .td-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  }
  .td-panel-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .td-panel-close {
    width: 30px; height: 30px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: var(--text-muted); transition: all 0.2s;
  }
  .td-panel-close:hover { border-color: var(--accent-border); color: var(--text-primary); }
  .td-panel-body { flex: 1; overflow-y: auto; padding: 20px; }
  .td-detail-field { margin-bottom: 14px; }
  .td-detail-label { font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
  .td-detail-value { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
  .td-divider { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
  .td-attachments { display: flex; gap: 10px; flex-wrap: wrap; }
  .td-attach-img {
    width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm);
    border: 1px solid var(--border); cursor: pointer; transition: opacity 0.2s;
  }
  .td-attach-img:hover { opacity: 0.8; }
  .td-comment-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
  .td-comment-item {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 10px 12px;
  }
  .td-comment-meta { display: flex; justify-content: space-between; margin-bottom: 5px; }
  .td-comment-author { font-size: 11px; font-weight: 600; color: var(--text-primary); }
  .td-comment-time { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .td-comment-text { font-size: 13px; color: var(--text-secondary); }
  .td-comment-actions { display: flex; gap: 6px; margin-top: 6px; }
  .td-comment-btn {
    padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px;
    font-family: var(--font-mono); cursor: pointer; transition: all 0.15s;
    border: 1px solid var(--border); background: transparent; color: var(--text-muted);
  }
  .td-comment-btn:hover { border-color: var(--accent-border); color: var(--accent); }
  .td-comment-btn.del:hover { border-color: var(--status-red); color: var(--status-red); }
  .td-add-comment { display: flex; gap: 8px; align-items: flex-end; }
  .td-add-comment .td-textarea { flex: 1; min-height: 52px; margin: 0; }
  .td-empty { text-align: center; padding: 28px 0; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_DOT = {
  OPEN: "var(--status-red)", IN_PROGRESS: "var(--status-amber)",
  RESOLVED: "var(--status-green)", CLOSED: "var(--text-muted)", REJECTED: "var(--status-red)",
};
const STATUS_BG  = {
  OPEN: "var(--status-red-bg)", IN_PROGRESS: "var(--status-amber-bg)",
  RESOLVED: "var(--status-green-bg)", CLOSED: "var(--bg-elevated)", REJECTED: "var(--status-red-bg)",
};
const STATUS_CLR = {
  OPEN: "var(--status-red)", IN_PROGRESS: "var(--status-amber)",
  RESOLVED: "var(--status-green)", CLOSED: "var(--text-muted)", REJECTED: "var(--status-red)",
};
const STATUS_LABEL = { OPEN:"Open", IN_PROGRESS:"In Progress", RESOLVED:"Resolved", CLOSED:"Closed", REJECTED:"Rejected" };
const PRIO_BG  = { HIGH:"var(--status-red-bg)", CRITICAL:"var(--status-red-bg)", MEDIUM:"var(--status-amber-bg)", LOW:"var(--bg-elevated)" };
const PRIO_CLR = { HIGH:"var(--status-red)",    CRITICAL:"var(--status-red)",    MEDIUM:"var(--status-amber)",    LOW:"var(--text-muted)" };

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day:"2-digit", month:"short" });
}
function fmtFull(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { day:"2-digit", month:"short" }) + " " +
         d.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" });
}

// ─── Update Status Modal ──────────────────────────────────────────────────────
// Technicians cannot reject; admin-only. From active work they may resolve only (admin closes later).
const VALID_NEXT = {
  OPEN: [],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
  CLOSED: [], REJECTED: [],
};

function technicianCanUpdateStatus(status) {
  return (VALID_NEXT[status] || []).length > 0;
}

function UpdateStatusModal({ ticket, onClose, onUpdated }) {
  const nextOptions = VALID_NEXT[ticket.status] || [];
  const [status, setStatus] = useState(nextOptions[0] || "");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (status === "REJECTED" && !reason.trim()) { setError("Rejection reason is required."); return; }
    if (status === "RESOLVED" && !notes.trim()) { setError("Resolution notes are required."); return; }
    setLoading(true);
    try {
      await ticketApi.updateStatus(ticket.id, { status, reason, resolutionNotes: notes });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally { setLoading(false); }
  };

  return (
    <div className="td-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="td-modal">
        <div className="td-modal-title">⚙️ Update Ticket #{ticket.id}</div>
        {error && <div className="td-error">{error}</div>}
        {nextOptions.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {ticket.status === "OPEN"
              ? "This ticket is still open. After an administrator assigns you and the ticket is in progress, you can mark it resolved here."
              : ticket.status === "RESOLVED"
              ? "This ticket is resolved. Further status changes (for example closing) are done by an administrator."
              : `This ticket is in a terminal state (${ticket.status}) and cannot be updated further.`}
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="td-form-group">
              <label className="td-label">New Status</label>
              <select className="td-select" value={status} onChange={e => setStatus(e.target.value)}>
                {nextOptions.map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            {status === "REJECTED" && (
              <div className="td-form-group">
                <label className="td-label">Rejection Reason *</label>
                <textarea className="td-textarea" value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Explain why the ticket is being rejected…" />
              </div>
            )}
            {status === "RESOLVED" && (
              <div className="td-form-group">
                <label className="td-label">Resolution Notes *</label>
                <textarea className="td-textarea" value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe what was done to resolve the issue…" />
              </div>
            )}
            <div className="td-modal-footer">
              <button type="button" className="td-btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="td-btn-primary" disabled={loading}>
                {loading ? "Saving…" : "Update Status"}
              </button>
            </div>
          </form>
        )}
        {nextOptions.length === 0 && (
          <div className="td-modal-footer">
            <button className="td-btn-ghost" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ticket Detail Panel ──────────────────────────────────────────────────────
function TicketDetailPanel({ ticket, onClose }) {
  const [comments, setComments] = useState(ticket.comments || []);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await ticketApi.addComment(ticket.id, newComment.trim());
      setComments(c => [...c, res.data]);
      setNewComment("");
    } catch (_) {} finally { setSubmitting(false); }
  };

  const handleEditSave = async id => {
    try {
      const res = await ticketApi.editComment(ticket.id, id, editingText);
      setComments(c => c.map(x => x.id === id ? res.data : x));
      setEditingId(null);
    } catch (_) {}
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await ticketApi.deleteComment(ticket.id, id);
      setComments(c => c.filter(x => x.id !== id));
    } catch (_) {}
  };

  return (
    <>
      <div className="td-panel-overlay" onClick={onClose} />
      <aside className="td-panel">
        <div className="td-panel-header">
          <div className="td-panel-title">🎫 Ticket #{ticket.id} — {ticket.resourceLocation}</div>
          <button className="td-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="td-panel-body">
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            <span className="td-badge" style={{ background: STATUS_BG[ticket.status], color: STATUS_CLR[ticket.status] }}>
              <span className="td-badge-dot" style={{ background: STATUS_DOT[ticket.status] }} />
              {STATUS_LABEL[ticket.status]}
            </span>
            <span className="td-badge" style={{ background: PRIO_BG[ticket.priority], color: PRIO_CLR[ticket.priority] }}>
              {ticket.priority}
            </span>
          </div>
          <div className="td-detail-field">
            <div className="td-detail-label">Description</div>
            <div className="td-detail-value">{ticket.description}</div>
          </div>
          <div className="td-detail-field">
            <div className="td-detail-label">Category</div>
            <div className="td-detail-value">{ticket.category?.replace("_"," ")}</div>
          </div>
          <div className="td-detail-field">
            <div className="td-detail-label">Created By</div>
            <div className="td-detail-value">{ticket.createdBy}</div>
          </div>
          {ticket.resolutionNotes && (
            <div className="td-detail-field">
              <div className="td-detail-label">Resolution Notes</div>
              <div className="td-detail-value" style={{ color:"var(--status-green)" }}>
                {ticket.resolutionNotes}
              </div>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            <div className="td-detail-field" style={{ margin:0 }}>
              <div className="td-detail-label">Created</div>
              <div className="td-detail-value">{fmt(ticket.createdAt)}</div>
            </div>
            <div className="td-detail-field" style={{ margin:0 }}>
              <div className="td-detail-label">Updated</div>
              <div className="td-detail-value">{fmt(ticket.updatedAt)}</div>
            </div>
          </div>

          {ticket.attachments?.length > 0 && (
            <>
              <hr className="td-divider" />
              <div className="td-detail-label" style={{ marginBottom:10 }}>Attachments</div>
              <div className="td-attachments">
                {ticket.attachments.map(a => (
                  <img key={a.id} className="td-attach-img"
                    src={resolveAttachmentImageSrc(a, ticket.id)}
                    alt={a.originalFileName} title={a.originalFileName}
                    onClick={() => window.open(resolveAttachmentImageSrc(a, ticket.id), "_blank")}
                    onError={e => { e.target.style.display = "none"; }} />
                ))}
              </div>
            </>
          )}

          <hr className="td-divider" />
          <div className="td-detail-label" style={{ marginBottom:12 }}>Comments ({comments.length})</div>
          <div className="td-comment-list">
            {comments.length === 0 && <div className="td-empty">No comments yet.</div>}
            {comments.map(c => (
              <div key={c.id} className="td-comment-item">
                <div className="td-comment-meta">
                  <span className="td-comment-author">{c.createdBy}</span>
                  <span className="td-comment-time">{fmtFull(c.createdAt)}</span>
                </div>
                {editingId === c.id ? (
                  <>
                    <textarea className="td-textarea" style={{ minHeight:48 }}
                      value={editingText} onChange={e => setEditingText(e.target.value)} />
                    <div className="td-comment-actions">
                      <button className="td-comment-btn" onClick={() => handleEditSave(c.id)}>Save</button>
                      <button className="td-comment-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="td-comment-text">{c.content}</div>
                    {c.isOwner && (
                      <div className="td-comment-actions">
                        <button className="td-comment-btn"
                          onClick={() => { setEditingId(c.id); setEditingText(c.content); }}>Edit</button>
                        <button className="td-comment-btn del" onClick={() => handleDelete(c.id)}>Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="td-add-comment">
            <textarea className="td-textarea"
              placeholder="Add a comment… (Ctrl+Enter to send)"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleAdd(); }} />
            <button className="td-btn-primary" style={{ flexShrink:0 }}
              onClick={handleAdd} disabled={submitting || !newComment.trim()}>
              {submitting ? "…" : "Send"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TechnicianDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // ticket being status-updated
  const [selected, setSelected] = useState(null); // ticket detail panel

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketApi.fetchAll();
      setTickets(res.data);
    } catch (_) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const getInitials = name => {
    if (!name) return "T";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const kpi = {
    open:       tickets.filter(t => t.status === "OPEN").length,
    inProgress: tickets.filter(t => t.status === "IN_PROGRESS").length,
    resolved:   tickets.filter(t => t.status === "RESOLVED").length,
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
          <NotificationBell />
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
          <p className="td-subtitle">View and manage your assigned maintenance tickets.</p>
        </div>

        {/* KPI mini row */}
        <div className="td-kpi-row fade-in">
          <div className="td-kpi">
            <div className="td-kpi-val" style={{ color:"var(--status-red)" }}>{kpi.open}</div>
            <div className="td-kpi-lbl">Open</div>
          </div>
          <div className="td-kpi">
            <div className="td-kpi-val" style={{ color:"var(--status-amber)" }}>{kpi.inProgress}</div>
            <div className="td-kpi-lbl">In Progress</div>
          </div>
          <div className="td-kpi">
            <div className="td-kpi-val" style={{ color:"var(--status-green)" }}>{kpi.resolved}</div>
            <div className="td-kpi-lbl">Resolved</div>
          </div>
        </div>

        {/* Assigned Tickets table */}
        <div className="td-table-card fade-in-1">
          <div className="td-table-header">
            <div className="td-table-title"><span>🔧</span> Assigned Incidents</div>
            <button className="td-btn-ghost" style={{ fontSize:12 }} onClick={fetchTickets}>↺ Refresh</button>
          </div>
          {loading ? (
            <div style={{ padding:"32px", textAlign:"center", color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:12 }}>
              Loading…
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ padding:"32px", textAlign:"center", color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:12 }}>
              No tickets assigned to you yet.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} onClick={() => setSelected(t)}>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>#{t.id}</td>
                    <td>{t.resourceLocation}</td>
                    <td style={{ fontSize:12, color:"var(--text-muted)" }}>{t.category?.replace("_"," ")}</td>
                    <td>
                      <span className="td-badge" style={{ background: PRIO_BG[t.priority], color: PRIO_CLR[t.priority] }}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className="td-badge" style={{ background: STATUS_BG[t.status], color: STATUS_CLR[t.status] }}>
                        <span className="td-badge-dot" style={{ background: STATUS_DOT[t.status] }} />
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-muted)" }}>
                      {fmt(t.createdAt)}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="td-btn-primary" style={{ fontSize:12, padding:"5px 12px" }}
                        onClick={() => setUpdating(t)}
                        disabled={!technicianCanUpdateStatus(t.status)}>
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Update Status Modal */}
      {updating && (
        <UpdateStatusModal
          ticket={updating}
          onClose={() => setUpdating(null)}
          onUpdated={() => { setUpdating(null); fetchTickets(); }}
        />
      )}

      {/* Detail Panel */}
      {selected && (
        <TicketDetailPanel
          ticket={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
