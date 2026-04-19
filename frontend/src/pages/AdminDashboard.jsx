import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api, { ticketApi, bookingApi } from "../services/api";
import {
  STATUS_BG, STATUS_CLR, STATUS_DOT, STATUS_LABEL,
  PRIO_BG, PRIO_CLR,
} from "../components/admin/AdminTicketModals";

const styles = `
  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; gap: 16px;
  }
  .page-label {
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
  }
  .page-label::before { content: ''; display: block; width: 18px; height: 1px; background: var(--accent); }
  .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.025em; line-height: 1.1; }
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
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .kpi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px 22px;
    cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
  }
  .kpi-card::before { content: ''; position: absolute; inset: 0; background: var(--accent-glow); opacity: 0; transition: opacity 0.3s; }
  .kpi-card:hover { border-color: var(--accent-border); transform: translateY(-2px); box-shadow: var(--shadow-card); }
  .kpi-card:hover::before { opacity: 1; }
  .kpi-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .kpi-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid var(--border); background: var(--bg-elevated); position: relative; z-index: 1; }
  .kpi-change { font-family: var(--font-mono); font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; position: relative; z-index: 1; }
  .kpi-change.up      { background: var(--status-green-bg); color: var(--status-green); }
  .kpi-change.down    { background: var(--status-red-bg);   color: var(--status-red); }
  .kpi-change.neutral { background: var(--bg-elevated);     color: var(--text-muted); }
  .kpi-value { font-family: var(--font-display); font-size: 32px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.035em; line-height: 1; position: relative; z-index: 1; }
  .kpi-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 6px; letter-spacing: 0.06em; text-transform: uppercase; position: relative; z-index: 1; }
  .kpi-sub   { font-size: 12px; color: var(--text-muted); margin-top: 4px; position: relative; z-index: 1; }

  .content-grid   { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-bottom: 20px; }
  .content-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }

  .card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); }
  .card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
  .card-title-icon { font-size: 16px; }
  .card-subtitle { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
  .card-action { font-family: var(--font-mono); font-size: 11px; color: var(--accent); cursor: pointer; transition: color 0.2s; display: flex; align-items: center; gap: 4px; border: none; background: none; padding: 0; }
  .card-action:hover { color: var(--accent-hover); }

  /* Bar chart */
  .chart-wrap { padding: 0 22px 20px; }
  .bar-chart-axis { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
  .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
  .bar-stack { width: 100%; display: flex; flex-direction: column; gap: 2px; border-radius: 5px 5px 0 0; overflow: hidden; cursor: pointer; transition: opacity 0.2s; }
  .bar-stack:hover { opacity: 0.85; }
  .bar-seg { width: 100%; }
  .bar-seg.bookings  { background: var(--accent); }
  .bar-seg.incidents { background: var(--status-red); opacity: 0.7; }
  .bar-label { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-align: center; margin-top: 8px; }
  .chart-legend { display: flex; gap: 16px; padding: 12px 22px; border-top: 1px solid var(--border); }
  .legend-item { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th { font-family: var(--font-mono); font-size: 9.5px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; padding: 10px 16px; text-align: left; white-space: nowrap; }
  th:first-child { padding-left: 22px; } th:last-child { padding-right: 22px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; cursor: pointer; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--bg-elevated); }
  td { padding: 12px 16px; color: var(--text-secondary); vertical-align: middle; }
  td:first-child { padding-left: 22px; color: var(--text-primary); font-weight: 500; }
  td:last-child  { padding-right: 22px; }

  /* Badges */
  .badge { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; font-weight: 500; padding: 3px 10px; border-radius: 100px; white-space: nowrap; }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .badge.PENDING   { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.APPROVED  { background: var(--status-green-bg); color: var(--status-green); }
  .badge.REJECTED  { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.CANCELLED { background: var(--bg-elevated);     color: var(--text-muted); }
  .badge.active    { background: var(--status-green-bg); color: var(--status-green); }
  .badge.open      { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.progress  { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.resolved  { background: var(--status-green-bg); color: var(--status-green); }

  /* Donut */
  .donut-wrap { display: flex; align-items: center; justify-content: center; padding: 16px 0 8px; }
  .donut-legend { display: flex; flex-direction: column; gap: 10px; padding: 0 22px 20px; }
  .donut-legend-row { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-secondary); }
  .donut-legend-bar-wrap { flex: 1; height: 4px; background: var(--bg-elevated); border-radius: 100px; overflow: hidden; }
  .donut-legend-bar { height: 100%; border-radius: 100px; }
  .donut-legend-val { font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); font-weight: 500; min-width: 28px; text-align: right; }

  /* Approvals */
  .approval-item { display: flex; align-items: center; gap: 12px; padding: 12px 22px; border-bottom: 1px solid var(--border); transition: background 0.15s; }
  .approval-item:last-child { border-bottom: none; }
  .approval-item:hover { background: var(--bg-elevated); }
  .approval-icon { width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--bg-elevated); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .approval-body { flex: 1; min-width: 0; }
  .approval-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .approval-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .approval-actions { display: flex; gap: 6px; flex-shrink: 0; }
  .approve-btn { padding: 5px 12px; border-radius: var(--radius-sm); background: var(--status-green-bg); color: var(--status-green); border: 1px solid rgba(74,222,128,0.3); font-family: var(--font-mono); font-size: 11px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .approve-btn:hover { background: var(--status-green); color: #fff; }
  .reject-btn { padding: 5px 12px; border-radius: var(--radius-sm); background: var(--status-red-bg); color: var(--status-red); border: 1px solid rgba(248,113,113,0.3); font-family: var(--font-mono); font-size: 11px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .reject-btn:hover { background: var(--status-red); color: #fff; }

  /* Reject inline input */
  .reject-reason-input {
    padding: 5px 10px; font-size: 12px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    color: var(--text-primary); font-family: var(--font-body);
    width: 180px; outline: none;
  }
  .reject-reason-input:focus { border-color: var(--accent-border); }

  /* System health */
  .health-list { display: flex; flex-direction: column; }
  .health-row { display: flex; align-items: center; gap: 12px; padding: 11px 22px; border-bottom: 1px solid var(--border); }
  .health-row:last-child { border-bottom: none; }
  .health-indicator { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .health-name { flex: 1; font-size: 13px; color: var(--text-secondary); }
  .health-val  { font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); font-weight: 500; }

  /* Users table */
  .adm-modal-overlay { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .adm-modal { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 460px; box-shadow: var(--shadow-card); }
  .adm-modal-title { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; }
  .adm-form-group { margin-bottom: 16px; }
  .adm-label { display: block; font-family: var(--font-mono); font-size: 10px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .adm-select, .adm-textarea { width: 100%; padding: 10px 14px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font-body); font-size: 13px; outline: none; transition: border-color 0.2s; }
  .adm-select:focus, .adm-textarea:focus { border-color: var(--accent-border); }
  .adm-textarea { resize: vertical; min-height: 72px; }
  .adm-select option { background: var(--bg-surface); }
  .adm-modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .adm-error { padding: 10px 14px; background: var(--status-red-bg); border: 1px solid var(--status-red); border-radius: var(--radius-sm); color: var(--status-red); font-size: 13px; margin-bottom: 14px; }

  /* Quick actions */
  .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 4px 22px 22px; }
  .quick-action-btn { display: flex; flex-direction: column; align-items: flex-start; padding: 14px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); cursor: pointer; gap: 6px; transition: all 0.2s; font-family: var(--font-body); }
  .quick-action-btn:hover { border-color: var(--accent-border); background: var(--accent-glow); }
  .quick-action-icon  { font-size: 20px; }
  .quick-action-label { font-size: 12px; font-weight: 600; color: var(--text-primary); }
  .quick-action-desc  { font-size: 11px; color: var(--text-muted); line-height: 1.3; }

  .empty-cell { padding: 28px; text-align: center; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in   { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }
  .fade-in-3 { animation: fadeInUp 0.5s 0.15s ease both; }
  .fade-in-4 { animation: fadeInUp 0.5s 0.20s ease both; }

  @media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2,1fr); } .content-grid { grid-template-columns: 1fr; } .content-grid-3 { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 768px)  { .kpi-grid { grid-template-columns: 1fr 1fr; } .content-grid-3 { grid-template-columns: 1fr; } }
`;

// ── Static data (no API exists yet) ──────────────────────────────────────────
const healthItems = [
  { name: "API Server",    val: "12 ms", status: "Healthy",  color: "#4ade80" },
  { name: "Database",      val: "3 ms",  status: "Healthy",  color: "#4ade80" },
  { name: "Auth Service",  val: "28 ms", status: "Healthy",  color: "#4ade80" },
  { name: "File Storage",  val: "—",     status: "Degraded", color: "#fbbf24" },
  { name: "Email Service", val: "—",     status: "Healthy",  color: "#4ade80" },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtShort = iso => iso
  ? new Date(iso).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })
  : "—";

const fmtDateTime = iso => iso
  ? new Date(iso).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })
  : "—";

const VALID_NEXT = {
  OPEN: ["IN_PROGRESS","REJECTED"], IN_PROGRESS: ["RESOLVED","REJECTED"],
  RESOLVED: ["CLOSED"], CLOSED: [], REJECTED: [],
};

// ── SVG Donut ─────────────────────────────────────────────────────────────────
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
            style={{ transformOrigin:"center", transform:"rotate(-90deg)" }}
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

// ── Assign Technician Modal ───────────────────────────────────────────────────
function AssignModal({ ticket, technicians, onClose, onDone }) {
  const [techEmail, setTechEmail] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    if (!techEmail) { setError("Please select a technician."); return; }
    setLoading(true);
    try {
      await ticketApi.assign(ticket.id, techEmail);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign.");
    } finally { setLoading(false); }
  };

  return (
    <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal-title">👷 Assign Technician — #{ticket.id}</div>
        {error && <div className="adm-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="adm-form-group">
            <label className="adm-label">Technician</label>
            <select className="adm-select" value={techEmail} onChange={e => setTechEmail(e.target.value)}>
              <option value="">{technicians.length === 0 ? "— No technicians —" : "— Select —"}</option>
              {technicians.map(t => (
                <option key={t.email} value={t.email}>{t.name} ({t.email})</option>
              ))}
            </select>
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

// ── Update Status Modal ───────────────────────────────────────────────────────
function StatusModal({ ticket, onClose, onDone }) {
  const nextOptions = VALID_NEXT[ticket.status] || [];
  const [status,  setStatus]  = useState(nextOptions[0] || "");
  const [reason,  setReason]  = useState("");
  const [notes,   setNotes]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    if (status === "REJECTED" && !reason.trim()) { setError("Rejection reason required."); return; }
    if (status === "RESOLVED" && !notes.trim())  { setError("Resolution notes required."); return; }
    setLoading(true);
    try {
      await ticketApi.updateStatus(ticket.id, { status, reason, resolutionNotes: notes });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update.");
    } finally { setLoading(false); }
  };

  return (
    <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal-title">⚙️ Update Status — #{ticket.id}</div>
        {error && <div className="adm-error">{error}</div>}
        {nextOptions.length === 0 ? (
          <>
            <p style={{ fontSize:13, color:"var(--text-muted)" }}>Terminal state — no further updates.</p>
            <div className="adm-modal-footer">
              <button className="btn-ghost" onClick={onClose}>Close</button>
            </div>
          </>
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
                <textarea className="adm-textarea" value={reason}
                  onChange={e => setReason(e.target.value)} placeholder="Explain why…" />
              </div>
            )}
            {status === "RESOLVED" && (
              <div className="adm-form-group">
                <label className="adm-label">Resolution Notes *</label>
                <textarea className="adm-textarea" value={notes}
                  onChange={e => setNotes(e.target.value)} placeholder="Describe what was done…" />
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
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── State ──
  const [tickets,          setTickets]          = useState([]);
  const [ticketsLoading,   setTicketsLoading]   = useState(true);
  const [facilities,       setFacilities]       = useState([]);
  const [allUsers,         setAllUsers]         = useState([]);
  const [usersLoading,     setUsersLoading]     = useState(true);
  const [pendingBookings,  setPendingBookings]  = useState([]);
  const [bookingsLoading,  setBookingsLoading]  = useState(true);
  const [allBookings,      setAllBookings]      = useState([]);

  // Inline reject state for pending approvals
  const [rejectingId,   setRejectingId]   = useState(null);
  const [rejectReason,  setRejectReason]  = useState("");

  // Incident modals
  const [assigning,      setAssigning]      = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // ── Fetch helpers ──
  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await ticketApi.fetchAll();
      setTickets(res.data || []);
    } catch (_) {}
    finally { setTicketsLoading(false); }
  }, []);

  const fetchFacilities = useCallback(async () => {
    try {
      const res = await api.get("/api/facilities");
      setFacilities(res.data || []);
    } catch (_) {}
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/api/admin/users");
      setAllUsers(res.data || []);
    } catch (_) {}
    finally { setUsersLoading(false); }
  }, []);

  const fetchPendingBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        bookingApi.fetchAll("PENDING"),
        bookingApi.fetchAll(),
      ]);
      setPendingBookings(pendingRes.data || []);
      setAllBookings(allRes.data || []);
    } catch (_) {}
    finally { setBookingsLoading(false); }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchFacilities();
    fetchUsers();
    fetchPendingBookings();
  }, [fetchTickets, fetchFacilities, fetchUsers, fetchPendingBookings]);

  // ── Derived values ──
  const openCount = tickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  const recentTickets = useMemo(() =>
    [...tickets]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8),
    [tickets]
  );

  const recentBookings = useMemo(() =>
    [...allBookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6),
    [allBookings]
  );

  const technicians = useMemo(() =>
    allUsers.filter(u => u.roles?.some(r => r.toUpperCase().includes("TECHNICIAN"))),
    [allUsers]
  );

  // ── Weekly bar chart — built from real booking + ticket data ──
  const weeklyBarData = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = d.toDateString();

      const bCount = allBookings.filter(b =>
        new Date(b.createdAt).toDateString() === dStr
      ).length;

      const tCount = tickets.filter(t =>
        new Date(t.createdAt).toDateString() === dStr
      ).length;

      days.push({ day: DAY_NAMES[d.getDay()], bookings: bCount, incidents: tCount });
    }
    return days;
  }, [allBookings, tickets]);

  const maxBar = Math.max(...weeklyBarData.map(d => d.bookings + d.incidents), 1);

  // ── Booking approve / reject ──
  const handleApprove = async (id) => {
    try {
      await bookingApi.approve(id);
      fetchPendingBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve.");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await bookingApi.reject(id, reason || "No reason provided.");
      setRejectingId(null);
      setRejectReason("");
      fetchPendingBookings();
    } catch (_) {}
  };

  // ── User role management ──
  const getInitials = name =>
    name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  const handleRoleChange = async (userId, newRoles) => {
    try {
      await api.put(`/api/admin/users/${userId}/roles`, { roles: newRoles });
      fetchUsers();
    } catch (err) {
      console.error("Role update failed:", err);
    }
  };

  // ── Donut data from live facilities ──
  const typeConfig = [
    { key: "LECTURE_HALL", label: "Lecture Halls", color: "#f5a623" },
    { key: "LAB",          label: "Labs",          color: "#60a5fa" },
    { key: "MEETING_ROOM", label: "Meeting Rooms", color: "#a78bfa" },
    { key: "EQUIPMENT",    label: "Equipment",     color: "#34d399" },
  ];
  const typeCounts = typeConfig.map(t => ({
    ...t,
    count: facilities.filter(f => f.type === t.key).length,
  }));
  const donutSegments = typeCounts
    .filter(t => t.count > 0)
    .map(t => ({ value: t.count, color: t.color }));

  return (
    <>
      <div style={{ padding: "32px", minHeight: "calc(100vh - 60px)" }}>
        <style dangerouslySetInnerHTML={{ __html: styles }} />

        {/* ── Page Header ── */}
        <div className="page-header fade-in">
          <div>
            <div className="page-label">Operations Overview</div>
            <div className="page-title">Admin Dashboard</div>
            <div className="page-subtitle">Smart Campus Operations Hub</div>
          </div>
          <div className="page-header-right">
            <button className="btn-ghost" onClick={() => { fetchTickets(); fetchFacilities(); fetchUsers(); fetchPendingBookings(); }}>
              ↻ Refresh All
            </button>
            <button className="btn-primary" onClick={() => navigate("/admin/facilities")}>
              🏛️ Manage Resources
            </button>
          </div>
        </div>

        {/* ── KPI Row — all live ── */}
        <div className="kpi-grid">
          {[
            {
              icon: "📅", label: "Total Bookings",
              value: bookingsLoading ? "…" : allBookings.length,
              change: `${pendingBookings.length} pending`, up: null,
              sub: "All requests",
              onClick: () => navigate("/admin/bookings"),
            },
            {
              icon: "🏛️", label: "Total Resources",
              value: facilities.length || "—",
              change: `${facilities.filter(f => f.status === "ACTIVE").length} active`, up: null,
              sub: "Rooms & equipment",
              onClick: () => navigate("/admin/facilities"),
            },
            {
              icon: "🔧", label: "Open Incidents",
              value: ticketsLoading ? "…" : openCount,
              change: openCount > 0 ? `${openCount} active` : "All clear",
              up: openCount > 0 ? false : null,
              sub: "Needs attention",
              onClick: () => navigate("/admin/incidents"),
            },
            {
              icon: "👥", label: "Total Users",
              value: usersLoading ? "…" : allUsers.length,
              change: `${technicians.length} technicians`, up: null,
              sub: "Registered accounts",
              onClick: () => navigate("/admin/users"),
            },
          ].map((k, i) => (
            <div className={`kpi-card fade-in-${i + 1}`} key={k.label} onClick={k.onClick}>
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

        {/* ── Row 1: Weekly Chart (live) + Recent Bookings (live) ── */}
        <div className="content-grid fade-in-2">

          {/* Bar chart — built from real booking + ticket creation dates */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title"><span className="card-title-icon">📊</span> Weekly Activity</div>
                <div className="card-subtitle">New bookings vs incidents — last 7 days</div>
              </div>
              <button className="card-action" onClick={() => navigate("/admin/bookings")}>
                All bookings →
              </button>
            </div>
            <div className="chart-wrap" style={{ paddingTop: "20px" }}>
              <div className="bar-chart-axis">
                {weeklyBarData.map(d => {
                  const total = d.bookings + d.incidents || 1;
                  const bookH = (d.bookings / maxBar) * 100;
                  const incH  = (d.incidents / maxBar) * 100;
                  return (
                    <div className="bar-group" key={d.day}>
                      <div className="bar-stack"
                        style={{ height: `${bookH + incH}%`, minHeight: (bookH + incH) > 0 ? "4px" : 0 }}
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
              <div className="legend-item"><div className="legend-dot" style={{ background:"var(--accent)" }} /> Bookings</div>
              <div className="legend-item"><div className="legend-dot" style={{ background:"var(--status-red)", opacity:0.7 }} /> Incidents</div>
            </div>
          </div>

          {/* Recent bookings — live */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title"><span className="card-title-icon">📅</span> Recent Bookings</div>
                <div className="card-subtitle">Latest 6 requests</div>
              </div>
              <button className="card-action" onClick={() => navigate("/admin/bookings")}>
                View all →
              </button>
            </div>
            {bookingsLoading ? (
              <div className="empty-cell">Loading…</div>
            ) : recentBookings.length === 0 ? (
              <div className="empty-cell">No bookings yet.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Facility</th><th>By</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {recentBookings.map(b => (
                      <tr key={b.id} onClick={() => navigate("/admin/bookings")}>
                        <td style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>#{b.id}</td>
                        <td style={{ fontSize:12 }}>
                          <div style={{ fontWeight:600 }}>{b.facilityName}</div>
                          <div style={{ fontSize:11, color:"var(--text-muted)" }}>{b.location}</div>
                        </td>
                        <td style={{ fontSize:12, color:"var(--text-muted)" }}>{b.bookedBy}</td>
                        <td>
                          <span className={`badge ${b.status}`}>
                            {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: Pending Approvals (live) + System Health ── */}
        <div className="content-grid-3 fade-in-3">
          <div className="card" style={{ gridColumn: "span 2" }}>
            <div className="card-header">
              <div>
                <div className="card-title"><span className="card-title-icon">⏳</span> Pending Approvals</div>
                <div className="card-subtitle">
                  {bookingsLoading ? "Loading…" : `${pendingBookings.length} booking request${pendingBookings.length !== 1 ? "s" : ""} awaiting review`}
                </div>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <button className="card-action" onClick={() => navigate("/admin/bookings")}>
                  View all →
                </button>
                <button className="card-action" onClick={fetchPendingBookings}>Refresh →</button>
              </div>
            </div>

            {bookingsLoading ? (
              <div className="empty-cell">Loading…</div>
            ) : pendingBookings.length === 0 ? (
              <div className="empty-cell">✅ All caught up! No pending approvals.</div>
            ) : (
              pendingBookings.slice(0, 5).map(b => (
                <div className="approval-item" key={b.id}>
                  <div className="approval-icon">🏛️</div>
                  <div className="approval-body">
                    <div className="approval-name">
                      {b.facilityName} — {b.bookedBy}
                    </div>
                    <div className="approval-meta">
                      #{b.id} · {b.facilityType?.replace("_"," ")} · {b.location}
                      {" · "}{fmtDateTime(b.startAt)} → {new Date(b.endAt).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                      {b.expectedAttendees ? ` · ${b.expectedAttendees} attendees` : ""}
                    </div>
                  </div>
                  <div className="approval-actions">
                    {rejectingId === b.id ? (
                      <>
                        <input
                          className="reject-reason-input"
                          placeholder="Rejection reason…"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          autoFocus
                        />
                        <button className="reject-btn"
                          onClick={() => handleReject(b.id, rejectReason)}>
                          Confirm
                        </button>
                        <button className="approve-btn"
                          onClick={() => { setRejectingId(null); setRejectReason(""); }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="approve-btn" onClick={() => handleApprove(b.id)}>✓ Approve</button>
                        <button className="reject-btn"  onClick={() => setRejectingId(b.id)}>✕ Reject</button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            {pendingBookings.length > 5 && (
              <div style={{ padding:"12px 22px", textAlign:"center" }}>
                <button className="card-action" onClick={() => navigate("/admin/bookings")}>
                  View all {pendingBookings.length} pending →
                </button>
              </div>
            )}
          </div>

          {/* System Health — static (no health API) */}
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
                    fontFamily: "var(--font-mono)", fontSize:"10px", padding:"2px 8px", borderRadius:"100px",
                  }}>
                    {h.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Resource Donut (live) + Open Incidents (live) ── */}
        <div className="content-grid-3 fade-in-4">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title"><span className="card-title-icon">📐</span> Resource Breakdown</div>
                <div className="card-subtitle">By type — live from database</div>
              </div>
            </div>
            <div className="donut-wrap">
              {facilities.length === 0 ? (
                <div style={{ padding:"20px", textAlign:"center", color:"var(--text-muted)", fontFamily:"var(--font-mono)", fontSize:12 }}>
                  No resources yet
                </div>
              ) : (
                <Donut segments={donutSegments.length > 0 ? donutSegments : [{ value:1, color:"var(--bg-elevated)" }]} />
              )}
            </div>
            <div className="donut-legend">
              {typeCounts.map(r => (
                <div className="donut-legend-row" key={r.key}>
                  <div className="legend-dot" style={{ width:8, height:8, borderRadius:"50%", background:r.color, flexShrink:0 }} />
                  <span style={{ fontSize:12, color:"var(--text-secondary)", flex:1 }}>{r.label}</span>
                  <div className="donut-legend-bar-wrap">
                    <div className="donut-legend-bar" style={{
                      width: `${Math.round((r.count / (facilities.length || 1)) * 100)}%`,
                      background: r.color,
                    }} />
                  </div>
                  <div className="donut-legend-val">{r.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Incidents — live */}
          <div className="card" style={{ gridColumn:"span 2" }}>
            <div className="card-header">
              <div>
                <div className="card-title"><span className="card-title-icon">🔧</span> Open Incidents</div>
                <div className="card-subtitle">
                  {ticketsLoading ? "Loading…" : `${openCount} active · ${recentTickets.length} shown`}
                </div>
              </div>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <button className="card-action" onClick={() => navigate("/admin/incidents")}>Manage all →</button>
                <button className="card-action" onClick={fetchTickets}>Refresh →</button>
              </div>
            </div>
            {ticketsLoading ? (
              <div className="empty-cell">Loading…</div>
            ) : recentTickets.length === 0 ? (
              <div className="empty-cell">✅ No tickets yet.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Location</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Reported</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {recentTickets.map(t => (
                      <tr key={t.id} onClick={e => { if (e.target.tagName !== "BUTTON") setSelectedTicket(t); }}>
                        <td style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>#{t.id}</td>
                        <td style={{ fontSize:12 }}>{t.resourceLocation}</td>
                        <td>
                          <span className="badge" style={{ background:PRIO_BG[t.priority], color:PRIO_CLR[t.priority] }}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span className="badge" style={{ background:STATUS_BG[t.status], color:STATUS_CLR[t.status] }}>
                            <span className="badge-dot" style={{ background:STATUS_DOT[t.status] }} />
                            {STATUS_LABEL[t.status]}
                          </span>
                        </td>
                        <td style={{ fontSize:12, color: t.assignedTo ? "var(--text-secondary)" : "var(--status-amber)" }}>
                          {t.assignedTo || "Unassigned"}
                        </td>
                        <td style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-muted)" }}>
                          {fmtShort(t.createdAt)}
                        </td>
                        <td>
                          <div style={{ display:"flex", gap:6 }}>
                            <button className="approve-btn"
                              onClick={e => { e.stopPropagation(); setAssigning(t); }}>
                              Assign
                            </button>
                            <button className="reject-btn"
                              onClick={e => { e.stopPropagation(); setStatusUpdating(t); }}
                              disabled={t.status === "CLOSED" || t.status === "REJECTED"}>
                              Status
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 4: Users & Roles (live) ── */}
        <div className="card fade-in" style={{ marginBottom:"32px" }}>
          <div className="card-header">
            <div>
              <div className="card-title"><span className="card-title-icon">👥</span> Users & Roles</div>
              <div className="card-subtitle">
                {usersLoading ? "Loading…" : `${allUsers.length} registered users`}
              </div>
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <button className="card-action" onClick={() => navigate("/admin/users")}>Full management →</button>
              <button className="card-action" onClick={fetchUsers}>Refresh →</button>
            </div>
          </div>
          {usersLoading ? (
            <div className="empty-cell">Loading users…</div>
          ) : allUsers.length === 0 ? (
            <div className="empty-cell">No users found.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>User</th><th>Email</th><th>Roles</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{
                            width:30, height:30, borderRadius:"50%", background:"var(--accent)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontFamily:"var(--font-display)", fontSize:10, fontWeight:700,
                            color:"var(--accent-fg)", overflow:"hidden", flexShrink:0,
                          }}>
                            {u.picture
                              ? <img src={u.picture} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                              : getInitials(u.name)}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily:"var(--font-mono)", fontSize:11 }}>{u.email}</td>
                      <td>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {u.roles?.map(r => (
                            <span key={r} className={`badge ${
                              r === "ROLE_ADMIN" ? "open" :
                              r === "ROLE_TECHNICIAN" ? "progress" : "active"
                            }`}>
                              {r.replace("ROLE_", "")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {!u.roles?.includes("ROLE_ADMIN") && (
                            <button className="approve-btn"
                              onClick={() => handleRoleChange(u.id, [...(u.roles||[]), "ROLE_ADMIN"])}>
                              +Admin
                            </button>
                          )}
                          {!u.roles?.includes("ROLE_TECHNICIAN") && (
                            <button className="approve-btn"
                              style={{ background:"var(--status-amber-bg)", color:"var(--status-amber)", borderColor:"rgba(245,166,35,0.3)" }}
                              onClick={() => handleRoleChange(u.id, [...(u.roles||[]), "ROLE_TECHNICIAN"])}>
                              +Tech
                            </button>
                          )}
                          {u.roles?.length > 1 && (
                            <button className="reject-btn"
                              onClick={() => handleRoleChange(u.id, ["ROLE_USER"])}>
                              Reset
                            </button>
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

        {/* ── Quick Actions ── */}
        <div className="card fade-in" style={{ marginBottom:"40px" }}>
          <div className="card-header">
            <div className="card-title"><span className="card-title-icon">⚡</span> Quick Actions</div>
          </div>
          <div className="quick-actions">
            {[
              { icon:"🏛️", label:"Add Facility",       desc:"Register a new room or lab",      action: () => navigate("/admin/facilities") },
              { icon:"📅", label:"Manage Bookings",    desc:"Review pending requests",          action: () => navigate("/admin/bookings") },
              { icon:"👥", label:"Manage Users",       desc:"Edit roles & permissions",         action: () => navigate("/admin/users") },
              { icon:"🔧", label:"View Incidents",     desc:"All maintenance tickets",          action: () => navigate("/admin/incidents") },
              { icon:"📊", label:"Booking Reports",    desc:"Full booking history & filters",   action: () => navigate("/admin/bookings") },
              { icon:"👷", label:"Assign Technicians", desc:"Go to incidents to assign",        action: () => navigate("/admin/incidents") },
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

      {/* ── Incident modals ── */}
      {assigning && (
        <AssignModal
          ticket={assigning}
          technicians={technicians}
          onClose={() => setAssigning(null)}
          onDone={() => { setAssigning(null); fetchTickets(); }}
        />
      )}
      {statusUpdating && (
        <StatusModal
          ticket={statusUpdating}
          onClose={() => setStatusUpdating(null)}
          onDone={() => { setStatusUpdating(null); fetchTickets(); }}
        />
      )}
    </>
  );
}