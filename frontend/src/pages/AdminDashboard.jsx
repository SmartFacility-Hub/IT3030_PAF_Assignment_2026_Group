import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api, { ticketApi } from "../services/api";
import {
  STATUS_BG,
  STATUS_CLR,
  STATUS_DOT,
  STATUS_LABEL,
  PRIO_BG,
  PRIO_CLR,
} from "../components/admin/AdminTicketModals";

// ─── Page-specific styles only (no sidebar/topbar/themes) ─────────────────────
const styles = `
  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; gap: 16px;
  }
  .page-header-left {}
  .page-label {
    font-family: var(--font-mono);
    font-size: 10px; font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 6px;
    display: flex; align-items: center; gap: 8px;
  }
  .page-label::before {
    content: ''; display: block; width: 18px; height: 1px; background: var(--accent);
  }
  .page-title {
    font-family: var(--font-display);
    font-size: 28px; font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.025em; line-height: 1.1;
  }
  .page-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
  .page-header-right { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

  .btn-ghost {
    padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { border-color: var(--accent-border); color: var(--text-primary); background: var(--accent-glow); }

  .btn-primary {
    padding: 8px 18px; border: none; border-radius: var(--radius-sm);
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 14px var(--accent-glow); }

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
    background: var(--accent-glow); opacity: 0; transition: opacity 0.3s;
  }
  .kpi-card:hover { border-color: var(--accent-border); transform: translateY(-2px); box-shadow: var(--shadow-card); }
  .kpi-card:hover::before { opacity: 1; }
  .kpi-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
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
  .kpi-change.down    { background: var(--status-red-bg);   color: var(--status-red);   }
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

  .content-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-bottom: 20px; }
  .content-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }

  .card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); transition: var(--transition-theme); overflow: hidden;
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid var(--border);
  }
  .card-title {
    font-family: var(--font-display); font-size: 15px; font-weight: 700;
    color: var(--text-primary); display: flex; align-items: center; gap: 8px;
  }
  .card-title-icon { font-size: 16px; }
  .card-subtitle {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px;
  }
  .card-body { padding: 20px 22px; }
  .card-action {
    font-family: var(--font-mono); font-size: 11px; color: var(--accent);
    cursor: pointer; transition: color 0.2s;
    display: flex; align-items: center; gap: 4px;
    border: none; background: none; padding: 0;
  }
  .card-action:hover { color: var(--accent-hover); }

  .chart-wrap { padding: 0 22px 20px; }
  .bar-chart-axis { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
  .bar-stack { width: 100%; display: flex; flex-direction: column; gap: 2px; border-radius: 5px 5px 0 0; overflow: hidden; cursor: pointer; transition: opacity 0.2s; }
  .bar-stack:hover { opacity: 0.85; }
  .bar-seg { width: 100%; transition: height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .bar-seg.bookings  { background: var(--accent); }
  .bar-seg.incidents { background: var(--status-red); opacity: 0.7; }
  .bar-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-align: center; margin-top: 8px; }
  .chart-legend { display: flex; gap: 16px; padding: 12px 22px; border-top: 1px solid var(--border); }
  .legend-item { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

  .activity-list { display: flex; flex-direction: column; }
  .activity-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 22px; border-bottom: 1px solid var(--border);
    transition: background 0.15s; cursor: pointer;
  }
  .activity-item:last-child { border-bottom: none; }
  .activity-item:hover { background: var(--bg-elevated); }
  .activity-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 11px; font-weight: 700;
    flex-shrink: 0; color: var(--accent-fg);
  }
  .activity-body { flex: 1; min-width: 0; }
  .activity-text { font-size: 13px; color: var(--text-secondary); line-height: 1.4; }
  .activity-text strong { color: var(--text-primary); font-weight: 600; }
  .activity-time { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 3px; }
  .activity-type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }

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

  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    padding: 3px 10px; border-radius: 100px; white-space: nowrap;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .badge.pending  { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.approved { background: var(--status-green-bg); color: var(--status-green); }
  .badge.rejected { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.open     { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.progress { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.resolved { background: var(--status-green-bg); color: var(--status-green); }
  .badge.closed   { background: var(--bg-elevated);     color: var(--text-muted); }
  .badge.active   { background: var(--status-green-bg); color: var(--status-green); }
  .badge.inactive { background: var(--status-red-bg);   color: var(--status-red); }

  .donut-wrap { display: flex; align-items: center; justify-content: center; padding: 16px 0 8px; }
  .donut-legend { display: flex; flex-direction: column; gap: 10px; padding: 0 22px 20px; }
  .donut-legend-row { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-secondary); }
  .donut-legend-bar-wrap { flex: 1; height: 4px; background: var(--bg-elevated); border-radius: 100px; overflow: hidden; }
  .donut-legend-bar { height: 100%; border-radius: 100px; transition: width 1s cubic-bezier(0.34,1.56,0.64,1); }
  .donut-legend-val { font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); font-weight: 500; min-width: 28px; text-align: right; }

  .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 4px 22px 22px; }
  .quick-action-btn {
    display: flex; flex-direction: column; align-items: flex-start;
    padding: 14px; background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-md); cursor: pointer; gap: 6px;
    transition: all 0.2s; font-family: var(--font-body);
  }
  .quick-action-btn:hover { border-color: var(--accent-border); background: var(--accent-glow); }
  .quick-action-icon  { font-size: 20px; }
  .quick-action-label { font-size: 12px; font-weight: 600; color: var(--text-primary); }
  .quick-action-desc  { font-size: 11px; color: var(--text-muted); line-height: 1.3; }

  .health-list { display: flex; flex-direction: column; }
  .health-row { display: flex; align-items: center; gap: 12px; padding: 11px 22px; border-bottom: 1px solid var(--border); }
  .health-row:last-child { border-bottom: none; }
  .health-indicator { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .health-name { flex: 1; font-size: 13px; color: var(--text-secondary); }
  .health-val  { font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); font-weight: 500; }

  .approval-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 22px; border-bottom: 1px solid var(--border); transition: background 0.15s;
  }
  .approval-item:last-child { border-bottom: none; }
  .approval-icon {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    background: var(--bg-elevated); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .approval-body { flex: 1; min-width: 0; }
  .approval-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .approval-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .approval-actions { display: flex; gap: 6px; flex-shrink: 0; }
  .approve-btn {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-green-bg); color: var(--status-green);
    border: 1px solid var(--status-green-bg);
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .approve-btn:hover { filter: brightness(1.2); }
  .reject-btn {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-red-bg); color: var(--status-red);
    border: 1px solid var(--status-red-bg);
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .reject-btn:hover { filter: brightness(1.2); }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes countUp  { from { opacity: 0; } to { opacity: 1; } }
  .fade-in   { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }
  .fade-in-3 { animation: fadeInUp 0.5s 0.15s ease both; }
  .fade-in-4 { animation: fadeInUp 0.5s 0.20s ease both; }

  @media (max-width: 1100px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .content-grid { grid-template-columns: 1fr; }
    .content-grid-3 { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .kpi-grid { grid-template-columns: 1fr 1fr; }
    .content-grid-3 { grid-template-columns: 1fr; }
    .main-content { padding: 20px 16px; }
  }
`;

// ─── Mock Data ────────────────────────────────────────────────────────────────
const weeklyData = [
  { day: "Mon", bookings: 38, incidents: 5 },
  { day: "Tue", bookings: 52, incidents: 8 },
  { day: "Wed", bookings: 61, incidents: 4 },
  { day: "Thu", bookings: 45, incidents: 11 },
  { day: "Fri", bookings: 70, incidents: 6 },
  { day: "Sat", bookings: 20, incidents: 2 },
  { day: "Sun", bookings: 14, incidents: 1 },
];
const maxBar = Math.max(...weeklyData.map(d => d.bookings + d.incidents));

const pendingBookings = [
  { id: "BK-1041", icon: "🏛️", name: "Lecture Hall A — Dr. Perera",       detail: "Fri 11 Apr · 09:00–11:00 · 80 attendees" },
  { id: "BK-1042", icon: "🔬", name: "Bio Lab 3 — Ms. Fernando",           detail: "Mon 14 Apr · 14:00–16:00 · 24 attendees" },
  { id: "BK-1043", icon: "💻", name: "Computer Lab 2 — IT Dept.",          detail: "Tue 15 Apr · 10:00–12:00 · 40 attendees" },
  { id: "BK-1044", icon: "🎙️", name: "Seminar Room B — Postgrad Council", detail: "Wed 16 Apr · 15:00–17:00 · 30 attendees" },
];

const recentActivity = [
  { initials: "TK", color: "#f5a623", text: <><strong>T. Kumara</strong> resolved ticket <strong>#INC-088</strong> — HVAC fault in Lecture Hall 3</>,  time: "2 min ago",  type: "green" },
  { initials: "AS", color: "#60a5fa", text: <><strong>A. Silva</strong> submitted booking request for <strong>Computer Lab 2</strong></>,                time: "9 min ago",  type: "blue"  },
  { initials: "DR", color: "#a78bfa", text: <><strong>Dr. Perera</strong> reported a new incident — Projector fault in <strong>Lab A-102</strong></>,   time: "18 min ago", type: "red"   },
  { initials: "SA", color: "#4ade80", text: <><strong>Admin</strong> approved booking <strong>#BK-1039</strong> for Engineering Faculty</>,              time: "34 min ago", type: "green" },
  { initials: "NR", color: "#f87171", text: <><strong>N. Rajapaksa</strong> cancelled booking <strong>#BK-1037</strong> — Seminar Room A</>,             time: "1 hr ago",   type: "amber" },
  { initials: "MJ", color: "#34d399", text: <><strong>M. Jayawardena</strong> added a comment on ticket <strong>#INC-085</strong></>,                   time: "2 hr ago",   type: "blue"  },
];

const recentBookings = [
  { id: "BK-1045", resource: "Lecture Hall B",  user: "Dr. R. Silva",   date: "10 Apr", time: "08:00–10:00", status: "approved" },
  { id: "BK-1044", resource: "Seminar Room B",  user: "PG Council",     date: "16 Apr", time: "15:00–17:00", status: "pending"  },
  { id: "BK-1043", resource: "Computer Lab 2",  user: "IT Dept.",        date: "15 Apr", time: "10:00–12:00", status: "pending"  },
  { id: "BK-1042", resource: "Bio Lab 3",       user: "Ms. Fernando",   date: "14 Apr", time: "14:00–16:00", status: "pending"  },
  { id: "BK-1040", resource: "Meeting Room C",  user: "Finance Dept.",  date: "9 Apr",  time: "11:00–12:00", status: "approved" },
  { id: "BK-1038", resource: "Auditorium",      user: "Dr. K. Mendis",  date: "8 Apr",  time: "09:00–13:00", status: "rejected" },
];

// ─── Allowed ticket status transitions ─────────────────────────────────────────
const VALID_NEXT = { OPEN:["IN_PROGRESS","REJECTED"], IN_PROGRESS:["RESOLVED","REJECTED"], RESOLVED:["CLOSED"], CLOSED:[], REJECTED:[] };

// ─── Assign Technician Modal ──────────────────────────────────────────────────
function AssignModal({ ticket, technicians, onClose, onDone }) {
  const [techEmail, setTechEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    if (!techEmail) { setError("Please select a technician."); return; }
    setLoading(true);
    try {
      await ticketApi.assign(ticket.id, techEmail);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign technician.");
    } finally { setLoading(false); }
  };

  return (
    <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal-title">👷 Assign Technician — Ticket #{ticket.id}</div>
        {error && <div className="adm-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="adm-form-group">
            <label className="adm-label">Technician</label>
            <select className="adm-select" value={techEmail} onChange={e => setTechEmail(e.target.value)}>
              {technicians.length === 0 ? (
                <option value="">— No technicians available —</option>
              ) : (
                <>
                  <option value="">— Select technician —</option>
                  {technicians.map(t => (
                    <option key={t.email} value={t.email}>{t.name} ({t.email})</option>
                  ))}
                </>
              )}
            </select>
            {technicians.length === 0 && (
              <p style={{ fontSize: '11px', color: 'var(--status-amber)', marginTop: '8px', lineHeight: '1.4' }}>
                💡 <strong>Tip:</strong> Promote users to Technicians first using the <strong>Users & Roles</strong> table below.
              </p>
            )}
          </div>
          <div className="adm-modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Assigning…" : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Update Status Modal ──────────────────────────────────────────────────────
function StatusModal({ ticket, onClose, onDone }) {
  const nextOptions = VALID_NEXT[ticket.status] || [];
  const [status, setStatus] = useState(nextOptions[0] || "");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    if (status === "REJECTED" && !reason.trim()) { setError("Rejection reason required."); return; }
    if (status === "RESOLVED" && !notes.trim()) { setError("Resolution notes required."); return; }
    setLoading(true);
    try {
      await ticketApi.updateStatus(ticket.id, { status, reason, resolutionNotes: notes });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    } finally { setLoading(false); }
  };

  return (
    <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal-title">⚙️ Update Status — Ticket #{ticket.id}</div>
        {error && <div className="adm-error">{error}</div>}
        {nextOptions.length === 0 ? (
          <p style={{ fontSize:13, color:"var(--text-muted)" }}>Terminal state — no further updates allowed.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="adm-form-group">
              <label className="adm-label">New Status</label>
              <select className="adm-select" value={status} onChange={e => setStatus(e.target.value)}>
                {nextOptions.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            {status === "REJECTED" && (
              <div className="adm-form-group">
                <label className="adm-label">Rejection Reason *</label>
                <textarea className="adm-textarea" value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Explain why…" />
              </div>
            )}
            {status === "RESOLVED" && (
              <div className="adm-form-group">
                <label className="adm-label">Resolution Notes *</label>
                <textarea className="adm-textarea" value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Describe what was done…" />
              </div>
            )}
            <div className="adm-modal-footer">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving…" : "Update"}
              </button>
            </div>
          </form>
        )}
        {nextOptions.length === 0 && (
          <div className="adm-modal-footer">
            <button className="btn-ghost" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}



const healthItems = [
  { name: "API Server",    val: "12 ms", status: "Healthy",  color: "#4ade80" },
  { name: "Database",      val: "3 ms",  status: "Healthy",  color: "#4ade80" },
  { name: "Auth Service",  val: "28 ms", status: "Healthy",  color: "#4ade80" },
  { name: "File Storage",  val: "—",     status: "Degraded", color: "#fbbf24" },
  { name: "Email Service", val: "—",     status: "Healthy",  color: "#4ade80" },
];

// ─── Counter hook ─────────────────────────────────────────────────────────────
function useCounter(targets, duration = 1600) {
  const [vals, setVals] = useState(() =>
    Object.fromEntries(Object.keys(targets).map(k => [k, 0]))
  );
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVals(Object.fromEntries(
        Object.entries(targets).map(([k, v]) => [k, Math.round(v * ease)])
      ));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);
  return vals;
}

// ─── SVG Donut ────────────────────────────────────────────────────────────────
function Donut({ segments }) {
  const r = 52, cx = 64, cy = 64;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="14" />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circumference;
        const gap  = circumference - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset} strokeLinecap="butt"
            style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dasharray 1s ease" }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontFamily="'Bricolage Grotesque',serif" fontSize="22" fontWeight="800" fill="var(--text-primary)">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="var(--text-muted)" letterSpacing="1">RESOURCES</text>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [approvals,    setApprovals]    = useState(pendingBookings);
  const [allUsers,     setAllUsers]     = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);
   const [assigning, setAssigning] = useState(null);  // ticket to assign
  const [statusUpdating, setStatusUpdating] = useState(null); // ticket to update status
  const [selectedTicket, setSelectedTicket] = useState(null);

  const kpi = useCounter({ bookings: 1247, assets: 382, uptime: 99 });
  const openCount = tickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  const recentOpenIncidents = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return sorted.slice(0, 8);
  }, [tickets]);

  const fmtShort = (d) =>
    d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const handleApprove = (id) => setApprovals(a => a.filter(x => x.id !== id));
  const handleReject  = (id) => setApprovals(a => a.filter(x => x.id !== id));

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/api/admin/users');
      setAllUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchFacilities = useCallback(async () => {
    try {
      const res = await api.get('/api/facilities');
      setFacilities(res.data);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    }
  }, []);

  // Fetch all tickets
  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await ticketApi.fetchAll();
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); fetchTickets(); fetchFacilities(); }, [fetchUsers, fetchTickets, fetchFacilities]);

  const handleRoleChange = async (userId, newRoles) => {
    try {
      await api.put(`/api/admin/users/${userId}/roles`, { roles: newRoles });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const getInitials = (name) =>
    name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <>
    <div style={{ padding: "32px", minHeight: "calc(100vh - 60px)" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Page Header */}
      <div className="page-header fade-in">
        <div className="page-header-left">
          <div className="page-label">Operations Overview</div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-subtitle">Smart Campus Operations Hub</div>
        </div>
        <div className="page-header-right">
          <button className="btn-ghost">⬇ Export Report</button>
          <button className="btn-primary" onClick={() => navigate("/admin/facilities")}>
            🏛️ Manage Resources
          </button>
        </div>
      </div>

        {/* KPI Row */}
        <div className="kpi-grid">
          {[
            { icon: "📅", label: "Total Bookings",    value: kpi.bookings.toLocaleString() + "+", change: "+12%",    up: true,    sub: "This semester" },
            { icon: "🏛️", label: "Total Resources",  value: facilities.length || "—",                         change: "+8 today", up: true,    sub: "Active inventory" },
            { icon: "🔧", label: "Open Incidents",    value: ticketsLoading ? "…" : openCount,    change: "Live",     up: null,    sub: "Active tickets" },
            { icon: "⚡",  label: "Platform Uptime",  value: kpi.uptime + "%",                    change: "Stable",   up: null,    sub: "Last 30 days" },
          ].map((k, i) => (
            <div className={`kpi-card fade-in-${i + 1}`} key={k.label}>
              <div className="kpi-card-top">
                <div className="kpi-icon">{k.icon}</div>
                <div className={`kpi-change ${k.up === null ? "neutral" : k.up ? "up" : "down"}`}>
                  {k.up === null ? "—" : k.up ? "↑" : "↓"} {k.change}
                </div>
              </div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

      {/* Row 1: Bar Chart + Activity */}
      <div className="content-grid fade-in-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span className="card-title-icon">📊</span> Weekly Overview</div>
              <div className="card-subtitle">Bookings vs Incidents — last 7 days</div>
            </div>
            <button className="card-action">Full report →</button>
          </div>
          <div className="chart-wrap" style={{ paddingTop: "20px" }}>
            <div className="bar-chart-axis">
              {weeklyData.map((d) => {
                const total = d.bookings + d.incidents;
                const bookH = (d.bookings / maxBar) * 100;
                const incH  = (d.incidents / maxBar) * 100;
                return (
                  <div className="bar-group" key={d.day}>
                    <div className="bar-stack" style={{ height: `${bookH + incH}%` }}
                      title={`${d.day}: ${d.bookings} bookings, ${d.incidents} incidents`}>
                      <div className="bar-seg incidents" style={{ height: `${(d.incidents / total) * 100}%` }} />
                      <div className="bar-seg bookings"  style={{ height: `${(d.bookings  / total) * 100}%` }} />
                    </div>
                    <div className="bar-label">{d.day}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item"><div className="legend-dot" style={{ background: "var(--accent)" }} /> Bookings</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: "var(--status-red)", opacity: 0.7 }} /> Incidents</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span className="card-title-icon">⚡</span> Recent Activity</div>
              <div className="card-subtitle">Live platform events</div>
            </div>
            <button className="card-action">View all →</button>
          </div>
          <div className="activity-list">
            {recentActivity.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-avatar" style={{ background: a.color }}>{a.initials}</div>
                <div className="activity-body">
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
                <div className="activity-type-dot" style={{
                  background: a.type === "green" ? "var(--status-green)" : a.type === "red" ? "var(--status-red)" : a.type === "blue" ? "var(--status-blue)" : "var(--status-amber)"
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Pending Approvals + System Health */}
      <div className="content-grid-3 fade-in-3">
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-header">
            <div>
              <div className="card-title"><span className="card-title-icon">⏳</span> Pending Approvals</div>
              <div className="card-subtitle">{approvals.length} booking requests awaiting review</div>
            </div>
            <button className="card-action">View all bookings →</button>
          </div>
          {approvals.length === 0 ? (
            <div style={{ padding: "32px 22px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
              ✅ All caught up! No pending approvals.
            </div>
          ) : (
            approvals.map(b => (
              <div className="approval-item" key={b.id}>
                <div className="approval-icon">{b.icon}</div>
                <div className="approval-body">
                  <div className="approval-name">{b.name}</div>
                  <div className="approval-meta">{b.id} &nbsp;·&nbsp; {b.detail}</div>
                </div>
                <div className="approval-actions">
                  <button className="approve-btn" onClick={() => handleApprove(b.id)}>✓ Approve</button>
                  <button className="reject-btn"  onClick={() => handleReject(b.id)}>✕ Reject</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span className="card-title-icon">🟢</span> System Health</div>
              <div className="card-subtitle">Service status</div>
            </div>
          </div>
          <div className="health-list">
            {healthItems.map(h => (
              <div className="health-row" key={h.name}>
                <div className="health-indicator" style={{ background: h.color }} />
                <div className="health-name">{h.name}</div>
                <div className="health-val">{h.val}</div>
                <div style={{
                  background: h.status === "Healthy" ? "var(--status-green-bg)" : "var(--status-amber-bg)",
                  color:      h.status === "Healthy" ? "var(--status-green)"    : "var(--status-amber)",
                  fontFamily: "var(--font-mono)", fontSize: "10px", padding: "2px 8px", borderRadius: "100px"
                }}>
                  {h.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Resource Utilisation + Open Incidents */}
      <div className="content-grid-3 fade-in-4">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span className="card-title-icon">📐</span> Resource Breakdown</div>
              <div className="card-subtitle">By type — live from database</div>
            </div>
          </div>
          {(() => {
            // ── Compute counts per type from live facilities data ──
            const typeConfig = [
              { key: "LECTURE_HALL", label: "Lecture Halls", color: "#f5a623" },
              { key: "LAB",          label: "Labs",          color: "#60a5fa" },
              { key: "MEETING_ROOM", label: "Meeting Rooms", color: "#a78bfa" },
              { key: "EQUIPMENT",    label: "Equipment",     color: "#34d399" },
            ];

            const counts = typeConfig.map(t => ({
              ...t,
              count: facilities.filter(f => f.type === t.key).length,
            }));

            const total = counts.reduce((sum, t) => sum + t.count, 0) || 1;

            const donutSegments = counts
              .filter(t => t.count > 0)
              .map(t => ({ value: t.count, color: t.color }));

            return (
              <>
                <div className="donut-wrap">
                  {total === 1 && facilities.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      No resources yet
                    </div>
                  ) : (
                    <Donut segments={donutSegments.length > 0 ? donutSegments : [{ value: 1, color: "var(--bg-elevated)" }]} />
                  )}
                </div>
                <div className="donut-legend">
                  {counts.map(r => (
                    <div className="donut-legend-row" key={r.key}>
                      <div className="legend-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{r.label}</span>
                      <div className="donut-legend-bar-wrap">
                        <div className="donut-legend-bar" style={{
                          width: `${Math.round((r.count / (facilities.length || 1)) * 100)}%`,
                          background: r.color
                        }} />
                      </div>
                      <div className="donut-legend-val">{r.count}</div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>

          {/* Open Incidents — recently added (compact; full management on Incidents page) */}
          <div className="card" style={{ gridColumn: "span 2" }}>
            <div className="card-header">
              <div>
                <div className="card-title"><span className="card-title-icon">🔧</span> Open Incidents</div>
                <div className="card-subtitle">Recently reported tickets (newest first)</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button type="button" className="card-action" onClick={() => navigate("/admin/incidents")}>Manage all →</button>
                <button type="button" className="card-action" onClick={fetchTickets}>Refresh →</button>
              </div>
            </div>
            <div className="table-wrap">
              {ticketsLoading ? (
                <div style={{ padding:"24px", textAlign:"center", color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:12 }}>Loading…</div>
              ) : recentOpenIncidents.length === 0 ? (
                <div style={{ padding:"24px", textAlign:"center", color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:12 }}>No tickets yet.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Location</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOpenIncidents.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>#{t.id}</td>
                        <td>{t.resourceLocation}</td>
                        <td>
                          <span className="badge" style={{ background: PRIO_BG[t.priority], color: PRIO_CLR[t.priority] }}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: STATUS_BG[t.status], color: STATUS_CLR[t.status] }}>
                            <span className="badge-dot" style={{ background: STATUS_DOT[t.status] }} />
                            {STATUS_LABEL[t.status]}
                          </span>
                        </td>
                        <td style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-muted)" }}>{fmtShort(t.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

      {/* Row 4: Recent Bookings */}
      <div className="card fade-in" style={{ marginBottom: "32px" }}>
        <div className="card-header">
          <div>
            <div className="card-title"><span className="card-title-icon">📅</span> Recent Bookings</div>
            <div className="card-subtitle">Last 6 booking requests across all resources</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-ghost">Filter</button>
            <button className="card-action" style={{ marginTop: 0 }}>View all →</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Booking ID</th><th>Resource</th><th>Requested By</th><th>Date</th><th>Time Slot</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {recentBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{b.id}</td>
                  <td>{b.resource}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{b.user}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{b.date}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{b.time}</td>
                  <td>
                    <span className={`badge ${b.status}`}>
                      <span className="badge-dot" style={{
                        background: b.status === "approved" ? "var(--status-green)" : b.status === "pending" ? "var(--status-amber)" : "var(--status-red)"
                      }} />
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {b.status === "pending" && (
                        <><button className="approve-btn">✓</button><button className="reject-btn">✕</button></>
                      )}
                      {b.status !== "pending" && (
                        <button className="card-action" style={{ fontSize: 11 }}>View →</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users & Roles */}
      <div className="card fade-in" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div>
            <div className="card-title"><span className="card-title-icon">👥</span> Users & Roles</div>
            <div className="card-subtitle">Manage platform users and their permissions</div>
          </div>
          <button className="card-action" onClick={fetchUsers}>Refresh →</button>
        </div>
        {usersLoading ? (
          <div style={{ padding: "32px 22px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
            Loading users...
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Current Roles</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "30px", height: "30px", borderRadius: "50%",
                          background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, color: "var(--accent-fg)",
                          overflow: "hidden", flexShrink: 0,
                        }}>
                          {u.picture
                            ? <img src={u.picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : getInitials(u.name)}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{u.email}</td>
                    <td>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {u.roles?.map(r => (
                          <span key={r} className={`badge ${r === "ROLE_ADMIN" ? "open" : r === "ROLE_TECHNICIAN" ? "progress" : "active"}`}>
                            {r.replace("ROLE_", "")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {!u.roles?.includes("ROLE_ADMIN") && (
                          <button className="approve-btn" onClick={() => handleRoleChange(u.id, [...(u.roles || []), "ROLE_ADMIN"])}>+Admin</button>
                        )}
                        {!u.roles?.includes("ROLE_TECHNICIAN") && (
                          <button className="approve-btn"
                            style={{ background: "var(--status-amber-bg)", color: "var(--status-amber)", borderColor: "var(--status-amber-bg)" }}
                            onClick={() => handleRoleChange(u.id, [...(u.roles || []), "ROLE_TECHNICIAN"])}>+Tech</button>
                        )}
                        {u.roles?.length > 1 && (
                          <button className="reject-btn" onClick={() => handleRoleChange(u.id, ["ROLE_USER"])}>Reset</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card fade-in" style={{ marginBottom: "40px" }}>
        <div className="card-header">
          <div className="card-title"><span className="card-title-icon">⚡</span> Quick Actions</div>
        </div>
        <div className="quick-actions">
          {[
            { icon: "🏛️", label: "Add Facility",     desc: "Register a new room or lab",  action: () => navigate("/admin/facilities") },
            { icon: "🖥️", label: "Add Asset",         desc: "Add equipment to inventory",  action: () => {} },
            { icon: "👥", label: "Manage Users",      desc: "Edit roles & permissions",    action: () => {} },
            { icon: "📋", label: "View Audit Log",    desc: "Full action history",         action: () => {} },
            { icon: "📊", label: "Usage Analytics",   desc: "Bookings & peak hours",       action: () => {} },
            { icon: "📧", label: "Send Notification", desc: "Broadcast to all users",      action: () => {} },
          ].map(a => (
            <button className="quick-action-btn" key={a.label} onClick={a.action}>
              <span className="quick-action-icon">{a.icon}</span>
              <span className="quick-action-label">{a.label}</span>
              <span className="quick-action-desc">{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      </div>
    </>
  );
}
