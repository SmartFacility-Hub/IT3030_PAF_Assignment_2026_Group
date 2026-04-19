import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ticketApi, API_BASE_URL } from "../../services/api";

export const STATUS_DOT = {
  OPEN: "var(--status-red)",
  IN_PROGRESS: "var(--status-amber)",
  RESOLVED: "var(--status-green)",
  CLOSED: "var(--text-muted)",
  REJECTED: "var(--status-red)",
};
export const STATUS_BG = {
  OPEN: "var(--status-red-bg)",
  IN_PROGRESS: "var(--status-amber-bg)",
  RESOLVED: "var(--status-green-bg)",
  CLOSED: "var(--bg-elevated)",
  REJECTED: "var(--status-red-bg)",
};
export const STATUS_CLR = {
  OPEN: "var(--status-red)",
  IN_PROGRESS: "var(--status-amber)",
  RESOLVED: "var(--status-green)",
  CLOSED: "var(--text-muted)",
  REJECTED: "var(--status-red)",
};
export const STATUS_LABEL = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};
export const PRIO_BG = {
  HIGH: "var(--status-red-bg)",
  CRITICAL: "var(--status-red-bg)",
  MEDIUM: "var(--status-amber-bg)",
  LOW: "var(--bg-elevated)",
};
export const PRIO_CLR = {
  HIGH: "var(--status-red)",
  CRITICAL: "var(--status-red)",
  MEDIUM: "var(--status-amber)",
  LOW: "var(--text-muted)",
};
export const VALID_NEXT = {
  OPEN: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED", "REJECTED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  REJECTED: [],
};

export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];

export const TICKET_CATEGORIES = [
  "ELECTRICAL",
  "PLUMBING",
  "IT_EQUIPMENT",
  "FURNITURE",
  "HVAC",
  "OTHER",
];

export function formatCategory(cat) {
  if (!cat) return "—";
  return String(cat).replace(/_/g, " ");
}

export const adminTicketModalStyles = `
  .adm-modal-overlay {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .adm-modal {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 28px;
    width: 100%; max-width: 460px; box-shadow: var(--shadow-card);
  }
  .adm-modal-title {
    font-family: var(--font-display); font-size: 17px; font-weight: 700;
    color: var(--text-primary); margin-bottom: 20px;
  }
  .adm-form-group { margin-bottom: 16px; }
  .adm-label {
    display: block; font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;
  }
  .adm-select, .adm-textarea {
    width: 100%; padding: 10px 14px;
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text-primary);
    font-family: var(--font-body); font-size: 13px; outline: none;
    transition: border-color 0.2s;
  }
  .adm-select:focus, .adm-textarea:focus { border-color: var(--accent-border); }
  .adm-textarea { resize: vertical; min-height: 72px; }
  .adm-select option { background: var(--bg-surface); }
  .adm-modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .adm-error {
    padding: 10px 14px; background: var(--status-red-bg); border: 1px solid var(--status-red);
    border-radius: var(--radius-sm); color: var(--status-red); font-size: 13px; margin-bottom: 14px;
  }
  .adm-row-actions { display: flex; gap: 6px; flex-wrap: wrap; }
  .adm-action-btn {
    padding: 4px 10px; border-radius: var(--radius-sm);
    font-family: var(--font-mono); font-size: 10px; cursor: pointer;
    border: 1px solid var(--border); background: transparent;
    color: var(--text-muted); transition: all 0.15s;
  }
  .adm-action-btn:hover { border-color: var(--accent-border); color: var(--accent); }
  .adm-action-btn.assign:hover { border-color: var(--status-blue, #60a5fa); color: var(--status-blue, #60a5fa); }
  .adm-panel-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); }
  .adm-panel {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 1001; width: 440px; max-width: 90vw;
    background: var(--bg-surface); border-left: 1px solid var(--border); display: flex; flex-direction: column;
    box-shadow: -10px 0 40px rgba(0,0,0,0.3); animation: admSlideIn 0.3s ease;
  }
  @keyframes admSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .adm-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
  .adm-panel-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); }
  .adm-panel-close { background: none; border: none; font-size: 18px; color: var(--text-muted); cursor: pointer; }
  .adm-panel-body { flex: 1; overflow-y: auto; padding: 24px; }
  .adm-detail-field { margin-bottom: 18px; }
  .adm-detail-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
  .adm-detail-value { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
  .adm-divider { border: 0; border-top: 1px solid var(--border); margin: 24px 0; }
  .adm-comment-item { padding: 12px 0; border-bottom: 1px solid var(--border); }
  .adm-comment-meta { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .adm-comment-author { font-size: 11px; font-weight: 700; color: var(--text-primary); }
  .adm-comment-time { font-size: 10px; color: var(--text-muted); }
  .adm-comment-text { font-size: 13px; color: var(--text-secondary); line-height: 1.4; white-space: pre-wrap; }
  .adm-comment-actions { display: flex; gap: 12px; margin-top: 8px; }
  .adm-add-comment { margin-top: 24px; }
  .adm-attach-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .adm-attach-thumb {
    width: 72px; height: 72px; object-fit: cover; border-radius: var(--radius-sm);
    border: 1px solid var(--border); cursor: pointer; background: var(--bg-elevated);
  }
`;

export function AssignModal({ ticket, technicians, onClose, onDone }) {
  const [techEmail, setTechEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!techEmail) {
      setError("Please select a technician.");
      return;
    }
    setLoading(true);
    try {
      await ticketApi.assign(ticket.id, techEmail);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign technician.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal-title">👷 Assign Technician — Ticket #{ticket.id}</div>
        {error && <div className="adm-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="adm-form-group">
            <label className="adm-label">Technician</label>
            <select className="adm-select" value={techEmail} onChange={(e) => setTechEmail(e.target.value)}>
              {technicians.length === 0 ? (
                <option value="">— No technicians available —</option>
              ) : (
                <>
                  <option value="">— Select technician —</option>
                  {technicians.map((t) => (
                    <option key={t.email} value={t.email}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </>
              )}
            </select>
            {technicians.length === 0 && (
              <p style={{ fontSize: "11px", color: "var(--status-amber)", marginTop: "8px", lineHeight: "1.4" }}>
                💡 <strong>Tip:</strong> Promote users to Technicians first using <strong>Users & Roles</strong> on the dashboard.
              </p>
            )}
          </div>
          <div className="adm-modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Assigning…" : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StatusModal({ ticket, onClose, onDone }) {
  const nextOptions = VALID_NEXT[ticket.status] || [];
  const [status, setStatus] = useState(nextOptions[0] || "");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "REJECTED" && !reason.trim()) {
      setError("Rejection reason required.");
      return;
    }
    if (status === "RESOLVED" && !notes.trim()) {
      setError("Resolution notes required.");
      return;
    }
    setLoading(true);
    try {
      await ticketApi.updateStatus(ticket.id, { status, reason, resolutionNotes: notes });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal-title">⚙️ Update Status — Ticket #{ticket.id}</div>
        {error && <div className="adm-error">{error}</div>}
        {nextOptions.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Terminal state — no further updates allowed.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="adm-form-group">
              <label className="adm-label">New Status</label>
              <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {nextOptions.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            {status === "REJECTED" && (
              <div className="adm-form-group">
                <label className="adm-label">Rejection Reason *</label>
                <textarea className="adm-textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why…" />
              </div>
            )}
            {status === "RESOLVED" && (
              <div className="adm-form-group">
                <label className="adm-label">Resolution Notes *</label>
                <textarea
                  className="adm-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what was done…"
                />
              </div>
            )}
            <div className="adm-modal-footer">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving…" : "Update"}
              </button>
            </div>
          </form>
        )}
        {nextOptions.length === 0 && (
          <div className="adm-modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TicketDetailPanel({ ticket, onClose, onRefresh }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(ticket.comments || []);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const handleEditSave = async (commentId) => {
    try {
      const res = await ticketApi.editComment(ticket.id, commentId, editingText);
      setComments((c) => c.map((x) => (x.id === commentId ? res.data : x)));
      setEditingId(null);
      onRefresh?.();
    } catch (_) {}
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await ticketApi.deleteComment(ticket.id, commentId);
      setComments((c) => c.filter((x) => x.id !== commentId));
      onRefresh?.();
    } catch (_) {}
  };

  const fmt = (d) =>
    d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const attachUrl = (attachmentId) =>
    `${API_BASE_URL}/api/tickets/${ticket.id}/attachments/${attachmentId}/download`;

  return (
    <>
      <div className="adm-panel-overlay" onClick={onClose} role="presentation" />
      <aside className="adm-panel">
        <div className="adm-panel-header">
          <div className="adm-panel-title">🎫 Incident Details — #{ticket.id}</div>
          <button type="button" className="adm-panel-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="adm-panel-body">
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <span className="badge" style={{ background: STATUS_BG[ticket.status], color: STATUS_CLR[ticket.status] }}>
              {STATUS_LABEL[ticket.status]}
            </span>
            <span className="badge" style={{ background: PRIO_BG[ticket.priority], color: PRIO_CLR[ticket.priority] }}>
              {ticket.priority}
            </span>
          </div>

          <div className="adm-detail-field">
            <div className="adm-detail-label">Location</div>
            <div className="adm-detail-value">
              <strong>{ticket.resourceLocation}</strong>
            </div>
          </div>
          <div className="adm-detail-field">
            <div className="adm-detail-label">Category</div>
            <div className="adm-detail-value">{formatCategory(ticket.category)}</div>
          </div>
          <div className="adm-detail-field">
            <div className="adm-detail-label">Description</div>
            <div className="adm-detail-value">{ticket.description}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div className="adm-detail-field" style={{ margin: 0 }}>
              <div className="adm-detail-label">Created By</div>
              <div className="adm-detail-value">{ticket.createdBy}</div>
            </div>
            <div className="adm-detail-field" style={{ margin: 0 }}>
              <div className="adm-detail-label">Assigned</div>
              <div className="adm-detail-value">{ticket.assignedTo || "None"}</div>
            </div>
          </div>

          {ticket.resolutionNotes && (
            <div className="adm-detail-field">
              <div className="adm-detail-label">Resolution Notes</div>
              <div className="adm-detail-value">{ticket.resolutionNotes}</div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
            <div className="adm-detail-field" style={{ margin: 0 }}>
              <div className="adm-detail-label">Created</div>
              <div className="adm-detail-value">{fmt(ticket.createdAt)}</div>
            </div>
            <div className="adm-detail-field" style={{ margin: 0 }}>
              <div className="adm-detail-label">Updated</div>
              <div className="adm-detail-value">{fmt(ticket.updatedAt)}</div>
            </div>
          </div>

          {ticket.attachments?.length > 0 && (
            <>
              <hr className="adm-divider" />
              <div className="adm-detail-label" style={{ marginBottom: 8 }}>
                Images ({ticket.attachments.length})
              </div>
              <div className="adm-attach-grid">
                {ticket.attachments.map((a) => (
                  <img
                    key={a.id}
                    className="adm-attach-thumb"
                    src={attachUrl(a.id)}
                    alt=""
                    onClick={() => window.open(attachUrl(a.id), "_blank")}
                    onError={(e) => {
                      e.target.style.opacity = 0.4;
                    }}
                  />
                ))}
              </div>
            </>
          )}

          <hr className="adm-divider" />
          <div className="adm-detail-label" style={{ marginBottom: 8 }}>
            Comments ({comments.length})
          </div>
          <p className="adm-detail-value" style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
            Comments are read-only here; posting is for users and technicians.
          </p>

          <div className="adm-comment-list">
            {comments.map((c) => (
              <div key={c.id} className="adm-comment-item">
                <div className="adm-comment-meta">
                  <span className="adm-comment-author">{c.createdBy}</span>
                  <span className="adm-comment-time">{fmt(c.createdAt)}</span>
                </div>
                {editingId === c.id ? (
                  <>
                    <textarea className="adm-textarea" style={{ minHeight: 60 }} value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                    <div className="adm-comment-actions">
                      <button type="button" className="adm-action-btn" onClick={() => handleEditSave(c.id)}>
                        Save
                      </button>
                      <button type="button" className="adm-action-btn" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="adm-comment-text">{c.content}</div>
                    <div className="adm-comment-actions">
                      {c.isOwner && (
                        <button type="button" className="adm-action-btn" onClick={() => { setEditingId(c.id); setEditingText(c.content); }}>
                          Edit
                        </button>
                      )}
                      {(c.isOwner || user?.roles?.some((r) => r === "ROLE_ADMIN")) && (
                        <button type="button" className="adm-action-btn" style={{ color: "var(--status-red)" }} onClick={() => handleDelete(c.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
