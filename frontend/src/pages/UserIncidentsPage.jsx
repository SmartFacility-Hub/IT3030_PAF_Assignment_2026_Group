import { useState, useEffect, useCallback } from "react";
import { ticketApi, resolveAttachmentImageSrc } from "../services/api";
import facilityService from "../services/facilityService";
import { useAuth } from "../context/AuthContext";

const styles = `
  .inc-page { padding: 32px; min-height: calc(100vh - 60px); }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; gap: 16px; }
  .page-label {
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    color: var(--status-teal); letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
  }
  .page-label::before { content: ''; display: block; width: 18px; height: 1px; background: var(--status-teal); }
  .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.025em; line-height: 1.1; }
  .page-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
  .page-header-right { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

  .btn-ghost {
    padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { border-color: rgba(45,212,191,0.4); color: var(--text-primary); background: var(--status-teal-bg); }
  .btn-primary {
    padding: 8px 18px; border: none; border-radius: var(--radius-sm);
    background: var(--status-teal); color: #fff;
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* KPI strip */
  .inc-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 28px; }
  .inc-kpi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 16px 18px;
    transition: all 0.2s; cursor: pointer;
  }
  .inc-kpi-card:hover { border-color: rgba(45,212,191,0.35); transform: translateY(-1px); box-shadow: var(--shadow-card); }
  .inc-kpi-icon { font-size: 20px; margin-bottom: 8px; }
  .inc-kpi-value { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .inc-kpi-label { font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; }

  /* Filter bar */
  .inc-filter-bar {
    display: flex; gap: 8px; flex-wrap: wrap;
    padding: 14px 20px; background: var(--bg-surface);
    border: 1px solid var(--border); border-radius: var(--radius-lg);
    margin-bottom: 20px; align-items: center;
  }
  .inc-filter-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-right: 4px; }
  .inc-filter-btn {
    padding: 5px 14px; border-radius: 100px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase;
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; color: var(--text-muted); transition: all 0.15s;
  }
  .inc-filter-btn:hover { border-color: rgba(45,212,191,0.4); color: var(--status-teal); }
  .inc-filter-btn.active { border-color: var(--status-teal); background: var(--status-teal-bg); color: var(--status-teal); }

  /* Table card */
  .inc-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .inc-card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); }
  .inc-card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
  .inc-card-subtitle { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th { font-family: var(--font-mono); font-size: 9.5px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; padding: 10px 16px; text-align: left; }
  th:first-child { padding-left: 22px; } th:last-child { padding-right: 22px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; cursor: pointer; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--bg-elevated); }
  td { padding: 12px 16px; color: var(--text-secondary); vertical-align: middle; }
  td:first-child { padding-left: 22px; color: var(--text-primary); font-weight: 500; }
  td:last-child  { padding-right: 22px; }

  .badge { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; font-weight: 500; padding: 3px 10px; border-radius: 100px; white-space: nowrap; }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }

  /* Modal */
  .ud-modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .ud-modal {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-xl); padding: 32px;
    width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
    box-shadow: var(--shadow-card);
  }
  .ud-modal-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
  .ud-form-group { margin-bottom: 18px; }
  .ud-label { display: block; font-family: var(--font-mono); font-size: 10px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .ud-input, .ud-select, .ud-textarea {
    width: 100%; padding: 10px 14px;
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text-primary);
    font-family: var(--font-body); font-size: 13px; transition: border-color 0.2s; outline: none;
  }
  .ud-input:focus, .ud-select:focus, .ud-textarea:focus { border-color: rgba(45,212,191,0.5); }
  .ud-textarea { resize: vertical; min-height: 80px; }
  .ud-select option { background: var(--bg-surface); }
  .ud-search-wrap { position: relative; }
  .ud-search-list {
    position: absolute; left: 0; right: 0; top: calc(100% + 6px); z-index: 25;
    max-height: 180px; overflow-y: auto;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-sm); box-shadow: var(--shadow-card);
  }
  .ud-search-item { width: 100%; border: none; background: transparent; cursor: pointer; text-align: left; color: var(--text-secondary); font-family: var(--font-body); font-size: 13px; padding: 10px 12px; transition: background 0.15s; }
  .ud-search-item:hover { background: var(--bg-elevated); color: var(--text-primary); }
  .ud-search-empty { padding: 10px 12px; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }
  .ud-file-input { display: none; }
  .ud-file-label { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--bg-elevated); border: 1px dashed var(--border); border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; color: var(--text-muted); transition: all 0.2s; }
  .ud-file-label:hover { border-color: rgba(45,212,191,0.4); color: var(--text-primary); }
  .ud-file-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 100px; font-size: 11px; color: var(--text-secondary); font-family: var(--font-mono); }
  .ud-file-chip button { background: none; border: none; cursor: pointer; color: var(--status-red); font-size: 12px; padding: 0; }
  .ud-modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
  .ud-error { padding: 10px 14px; background: var(--status-red-bg); border: 1px solid var(--status-red); border-radius: var(--radius-sm); color: var(--status-red); font-size: 13px; margin-bottom: 16px; }

  /* Panel */
  .ud-panel-overlay { position: fixed; inset: 0; z-index: 150; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); }
  .ud-panel {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 160;
    width: 480px; max-width: 95vw;
    background: var(--bg-surface); border-left: 1px solid var(--border);
    display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,0.3);
    animation: slideIn 0.25s ease;
  }
  @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .ud-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .ud-panel-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); }
  .ud-panel-close { width: 32px; height: 32px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-elevated); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--text-muted); transition: all 0.2s; }
  .ud-panel-close:hover { border-color: rgba(45,212,191,0.4); color: var(--text-primary); }
  .ud-panel-body { flex: 1; overflow-y: auto; padding: 22px; }
  .ud-detail-field { margin-bottom: 16px; }
  .ud-detail-label { font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .ud-detail-value { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
  .ud-detail-value strong { color: var(--text-primary); }
  .ud-section-divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
  .ud-attachments { display: flex; gap: 10px; flex-wrap: wrap; }
  .ud-attachment-img { width: 90px; height: 90px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border); cursor: pointer; transition: opacity 0.2s; }
  .ud-attachment-img:hover { opacity: 0.8; }
  .ud-comment-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
  .ud-comment-item { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px; }
  .ud-comment-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .ud-comment-author { font-size: 11px; font-weight: 600; color: var(--text-primary); }
  .ud-comment-time { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .ud-comment-text { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
  .ud-comment-actions { display: flex; gap: 6px; margin-top: 8px; }
  .ud-comment-action-btn { padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px; font-family: var(--font-mono); cursor: pointer; transition: all 0.15s; border: 1px solid var(--border); background: transparent; color: var(--text-muted); }
  .ud-comment-action-btn:hover { border-color: rgba(45,212,191,0.4); color: var(--status-teal); }
  .ud-comment-action-btn.delete:hover { border-color: var(--status-red); color: var(--status-red); }
  .ud-comment-input-row { display: flex; gap: 8px; align-items: flex-end; }
  .ud-comment-input-row .ud-textarea { margin: 0; flex: 1; min-height: 60px; }
  .ud-empty-state { text-align: center; padding: 32px; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }

  @media (max-width: 768px) { .inc-kpi-grid { grid-template-columns: repeat(2,1fr); } }
`;

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_LABEL = {
  OPEN: "Open", IN_PROGRESS: "In Progress", RESOLVED: "Resolved",
  CLOSED: "Closed", REJECTED: "Rejected",
};
const STATUS_DOT = {
  OPEN: "var(--status-red)", IN_PROGRESS: "var(--status-amber)",
  RESOLVED: "var(--status-green)", CLOSED: "var(--text-muted)", REJECTED: "var(--status-red)",
};
const STATUS_BG = {
  OPEN: "var(--status-red-bg)", IN_PROGRESS: "var(--status-amber-bg)",
  RESOLVED: "var(--status-green-bg)", CLOSED: "var(--bg-elevated)", REJECTED: "var(--status-red-bg)",
};
const STATUS_CLR = {
  OPEN: "var(--status-red)", IN_PROGRESS: "var(--status-amber)",
  RESOLVED: "var(--status-green)", CLOSED: "var(--text-muted)", REJECTED: "var(--status-red)",
};
const PRIO_BG  = { HIGH:"var(--status-red-bg)", CRITICAL:"var(--status-red-bg)", MEDIUM:"var(--status-amber-bg)", LOW:"var(--bg-elevated)" };
const PRIO_CLR = { HIGH:"var(--status-red)", CRITICAL:"var(--status-red)", MEDIUM:"var(--status-amber)", LOW:"var(--text-muted)" };
const TICKET_FILTERS = ["ALL","OPEN","IN_PROGRESS","RESOLVED","CLOSED","REJECTED"];

const formatDate = iso => iso ? new Date(iso).toLocaleDateString("en-US",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const formatTime = iso => iso ? new Date(iso).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "";

// ── Create Ticket Modal ────────────────────────────────────────────────────────
function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    resourceLocation: "", category: "IT_EQUIPMENT",
    description: "", priority: "MEDIUM",
  });
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleField = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const locationQuery = form.resourceLocation.trim().toLowerCase();
  const filteredLocations = locations
    .filter(l => !locationQuery || l.toLowerCase().includes(locationQuery))
    .slice(0, 8);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await facilityService.getAll();
        const unique = [...new Set((res.data||[]).map(f=>f?.location?.trim()).filter(Boolean))].sort();
        if (mounted) setLocations(unique);
      } catch (_) {}
      finally { if (mounted) setLoadingLocations(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const handleFiles = e => {
    const picked = Array.from(e.target.files).slice(0, 3 - files.length);
    setFiles(f => [...f, ...picked].slice(0, 3));
    e.target.value = "";
  };
  const removeFile = idx => setFiles(f => f.filter((_,i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (form.description.length < 10) { setError("Description must be at least 10 characters."); return; }
    setLoading(true);
    try {
      const res = await ticketApi.create(form);
      const ticketId = res.data.id;
      for (const file of files) {
        try { await ticketApi.uploadAttachment(ticketId, file); } catch (_) {}
      }
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket.");
    } finally { setLoading(false); }
  };

  return (
    <div className="ud-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ud-modal">
        <div className="ud-modal-title">🔧 Report an Issue</div>
        {error && <div className="ud-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="ud-form-group">
            <label className="ud-label">Resource / Location *</label>
            <div className="ud-search-wrap">
              <input className="ud-input" name="resourceLocation" required autoComplete="off"
                placeholder={loadingLocations ? "Loading locations…" : "Search a location"}
                value={form.resourceLocation}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                onChange={e => { handleField(e); setShowSuggestions(true); }}
              />
              {showSuggestions && !loadingLocations && (
                <div className="ud-search-list">
                  {filteredLocations.length > 0
                    ? filteredLocations.map(l => (
                        <button key={l} type="button" className="ud-search-item"
                          onMouseDown={() => { setForm(f=>({...f,resourceLocation:l})); setShowSuggestions(false); }}>
                          {l}
                        </button>
                      ))
                    : <div className="ud-search-empty">No matching locations</div>
                  }
                </div>
              )}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div className="ud-form-group">
              <label className="ud-label">Category *</label>
              <select className="ud-select" name="category" value={form.category} onChange={handleField}>
                {["IT_EQUIPMENT","HVAC","ELECTRICAL","PLUMBING","FURNITURE","OTHER"].map(c => (
                  <option key={c} value={c}>{c.replace("_"," ")}</option>
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
            <label className="ud-label">Description * (min 10 chars)</label>
            <textarea className="ud-textarea" name="description" required
              placeholder="Describe the issue clearly…"
              value={form.description} onChange={handleField} />
          </div>

          <div className="ud-form-group">
            <label className="ud-label">Image Attachments (up to 3)</label>
            {files.length < 3 && (
              <>
                <label className="ud-file-label" htmlFor="inc-file-input">📎 Choose image file</label>
                <input id="inc-file-input" className="ud-file-input" type="file"
                  accept="image/*" onChange={handleFiles} />
              </>
            )}
            {files.length > 0 && (
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:8 }}>
                {files.map((f,i) => (
                  <div key={i} className="ud-file-chip">
                    {f.name}
                    <button type="button" onClick={() => removeFile(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ud-modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Submitting…" : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Ticket Detail Panel ────────────────────────────────────────────────────────
function TicketDetailPanel({ ticket, onClose, onRefresh }) {
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
      <div className="ud-panel-overlay" onClick={onClose} />
      <aside className="ud-panel">
        <div className="ud-panel-header">
          <div className="ud-panel-title">🎫 Ticket #{ticket.id}</div>
          <button className="ud-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="ud-panel-body">
          {/* Status + Priority */}
          <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
            <span className="badge" style={{ background:STATUS_BG[ticket.status], color:STATUS_CLR[ticket.status] }}>
              <span className="badge-dot" style={{ background:STATUS_DOT[ticket.status] }} />
              {STATUS_LABEL[ticket.status]}
            </span>
            <span className="badge" style={{ background:PRIO_BG[ticket.priority], color:PRIO_CLR[ticket.priority] }}>
              {ticket.priority}
            </span>
            <span className="badge" style={{ background:"var(--bg-elevated)", color:"var(--text-muted)" }}>
              {ticket.category?.replace("_"," ")}
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
            <div className="ud-detail-label">Created By</div>
            <div className="ud-detail-value">{ticket.createdBy}</div>
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
              <div className="ud-detail-value" style={{ color:"var(--status-green)" }}>
                {ticket.resolutionNotes}
              </div>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            <div className="ud-detail-field" style={{ margin:0 }}>
              <div className="ud-detail-label">Created</div>
              <div className="ud-detail-value">{formatDate(ticket.createdAt)}</div>
            </div>
            <div className="ud-detail-field" style={{ margin:0 }}>
              <div className="ud-detail-label">Updated</div>
              <div className="ud-detail-value">{formatDate(ticket.updatedAt)}</div>
            </div>
          </div>

          {/* Attachments */}
          {ticket.attachments?.length > 0 && (
            <>
              <hr className="ud-section-divider" />
              <div className="ud-detail-label" style={{ marginBottom:10 }}>Attachments</div>
              <div className="ud-attachments">
                {ticket.attachments.map(a => (
                  <img key={a.id} className="ud-attachment-img"
                    src={resolveAttachmentImageSrc(a, ticket.id)}
                    alt={a.originalFileName}
                    title={a.originalFileName}
                    onClick={() => window.open(resolveAttachmentImageSrc(a, ticket.id),"_blank")}
                    onError={e => { e.target.style.display="none"; }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Comments */}
          <hr className="ud-section-divider" />
          <div className="ud-detail-label" style={{ marginBottom:12 }}>
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
                  <span className="ud-comment-time">{formatDate(c.createdAt)} {formatTime(c.createdAt)}</span>
                </div>
                {editingId === c.id ? (
                  <>
                    <textarea className="ud-textarea" style={{ minHeight:56 }}
                      value={editingText} onChange={e => setEditingText(e.target.value)} />
                    <div className="ud-comment-actions">
                      <button className="ud-comment-action-btn" onClick={() => handleEditSave(c.id)}>Save</button>
                      <button className="ud-comment-action-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ud-comment-text">{c.content}</div>
                    {c.isOwner && (
                      <div className="ud-comment-actions">
                        <button className="ud-comment-action-btn"
                          onClick={() => { setEditingId(c.id); setEditingText(c.content); }}>Edit</button>
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
            <textarea className="ud-textarea" placeholder="Add a comment… (Ctrl+Enter to send)"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleAdd(); }}
            />
            <button className="btn-primary" style={{ flexShrink:0, padding:"8px 14px" }}
              onClick={handleAdd} disabled={submitting || !newComment.trim()}>
              {submitting ? "…" : "Send"}
            </button>
          </div>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:6 }}>Ctrl+Enter to send</div>
        </div>
      </aside>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function UserIncidentsPage() {
  const [tickets,        setTickets]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [filter,         setFilter]         = useState("ALL");
  const [showCreate,     setShowCreate]     = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketApi.fetchAll(filter === "ALL" ? undefined : filter);
      setTickets(res.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  // KPI counts
  const total      = tickets.length;
  const open       = tickets.filter(t => t.status === "OPEN").length;
  const inProgress = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolved   = tickets.filter(t => t.status === "RESOLVED").length;
  const closed     = tickets.filter(t => t.status === "CLOSED" || t.status === "REJECTED").length;

  return (
    <div className="inc-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Page Header */}
      <div className="page-header fade-in">
        <div>
          <div className="page-label">Support</div>
          <div className="page-title">My Incident Reports</div>
          <div className="page-subtitle">Track, manage, and comment on your maintenance tickets</div>
        </div>
        <div className="page-header-right">
          <button className="btn-ghost" onClick={fetchTickets}>↻ Refresh</button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            ＋ Report Issue
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="inc-kpi-grid fade-in-1">
        {[
          { icon: "🎫", label: "Total",       value: total,      color: "var(--text-primary)" },
          { icon: "🔴", label: "Open",         value: open,       color: "var(--status-red)" },
          { icon: "🟡", label: "In Progress",  value: inProgress, color: "var(--status-amber)" },
          { icon: "🟢", label: "Resolved",     value: resolved,   color: "var(--status-green)" },
          { icon: "⚫", label: "Closed",       value: closed,     color: "var(--text-muted)" },
        ].map(k => (
          <div className="inc-kpi-card" key={k.label}
            onClick={() => setFilter(k.label === "Total" ? "ALL" : k.label.toUpperCase().replace(" ","_"))}>
            <div className="inc-kpi-icon">{k.icon}</div>
            <div className="inc-kpi-value" style={{ color: k.color }}>
              {loading ? "—" : k.value}
            </div>
            <div className="inc-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="inc-filter-bar fade-in-1">
        <span className="inc-filter-label">Filter:</span>
        {TICKET_FILTERS.map(f => (
          <button key={f} className={`inc-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}>
            {f === "ALL" ? "All" : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="inc-card fade-in-2">
        <div className="inc-card-header">
          <div>
            <div className="inc-card-title">
              🔧 Tickets
              <span style={{
                fontFamily:"var(--font-mono)", fontSize:11, padding:"2px 8px",
                borderRadius:"100px", background:"var(--status-teal-bg)", color:"var(--status-teal)",
              }}>
                {loading ? "…" : tickets.length}
              </span>
            </div>
            <div className="inc-card-subtitle">
              {filter === "ALL" ? "All tickets" : `Filtered: ${STATUS_LABEL[filter]}`}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="ud-empty-state">Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div className="ud-empty-state">
            No tickets found. Click "＋ Report Issue" to submit one.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} onClick={() => setSelectedTicket(t)}>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>#{t.id}</td>
                    <td>{t.resourceLocation}</td>
                    <td style={{ fontSize:12, color:"var(--text-muted)" }}>
                      {t.category?.replace("_"," ")}
                    </td>
                    <td>
                      <span className="badge"
                        style={{ background:PRIO_BG[t.priority], color:PRIO_CLR[t.priority] }}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className="badge"
                        style={{ background:STATUS_BG[t.status], color:STATUS_CLR[t.status] }}>
                        <span className="badge-dot" style={{ background:STATUS_DOT[t.status] }} />
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td style={{ fontSize:12, color: t.assignedTo ? "var(--text-secondary)" : "var(--status-amber)" }}>
                      {t.assignedTo || "Unassigned"}
                    </td>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-muted)" }}>
                      {formatDate(t.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
}