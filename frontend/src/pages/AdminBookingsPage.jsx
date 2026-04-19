import { useState, useEffect, useCallback } from "react";
import { bookingApi } from "../services/api";

const styles = `
  .abk-page { padding: 32px; min-height: calc(100vh - 60px); }

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

  .btn-ghost {
    padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { border-color: var(--accent-border); color: var(--text-primary); background: var(--accent-glow); }

  /* KPI */
  .abk-kpi-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 14px; margin-bottom: 28px; }
  .abk-kpi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 18px 20px;
    cursor: pointer; transition: all 0.2s;
  }
  .abk-kpi-card:hover { border-color: var(--accent-border); transform: translateY(-1px); box-shadow: var(--shadow-card); }
  .abk-kpi-card.active { border-color: var(--accent-border); background: var(--accent-glow); }
  .abk-kpi-icon  { font-size: 20px; margin-bottom: 8px; }
  .abk-kpi-value { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .abk-kpi-label { font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; }

  /* Filter bar */
  .abk-filter-bar {
    display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
    padding: 14px 20px; background: var(--bg-surface);
    border: 1px solid var(--border); border-radius: var(--radius-lg); margin-bottom: 20px;
  }
  .abk-filter-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-right: 4px; }
  .abk-filter-btn {
    padding: 5px 14px; border-radius: 100px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase;
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; color: var(--text-muted); transition: all 0.15s;
  }
  .abk-filter-btn:hover  { border-color: var(--accent-border); color: var(--accent); }
  .abk-filter-btn.active { border-color: var(--accent-border); background: var(--accent-glow); color: var(--accent); }
  .abk-search {
    margin-left: auto; padding: 7px 14px;
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 13px;
    color: var(--text-primary); outline: none; width: 220px; transition: border-color 0.2s;
  }
  .abk-search:focus { border-color: var(--accent-border); }
  .abk-search::placeholder { color: var(--text-muted); }

  /* Card */
  .abk-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .abk-card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); }
  .abk-card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
  .abk-card-subtitle { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

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

  /* Action buttons */
  .approve-btn {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-green-bg); color: var(--status-green);
    border: 1px solid rgba(74,222,128,0.3);
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .approve-btn:hover { background: var(--status-green); color: #fff; }
  .reject-btn {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-red-bg); color: var(--status-red);
    border: 1px solid rgba(248,113,113,0.3);
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .reject-btn:hover { background: var(--status-red); color: #fff; }

  /* Detail panel */
  .abk-panel-overlay { position: fixed; inset: 0; z-index: 150; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); }
  .abk-panel {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 160;
    width: 460px; max-width: 95vw;
    background: var(--bg-surface); border-left: 1px solid var(--border);
    display: flex; flex-direction: column;
    box-shadow: -8px 0 40px rgba(0,0,0,0.3);
    animation: abkSlide 0.25s ease;
  }
  @keyframes abkSlide { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .abk-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .abk-panel-title  { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); }
  .abk-panel-close  { width: 32px; height: 32px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-elevated); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--text-muted); transition: all 0.2s; }
  .abk-panel-close:hover { border-color: var(--accent-border); color: var(--text-primary); }
  .abk-panel-body   { flex: 1; overflow-y: auto; padding: 22px; }
  .abk-panel-footer { padding: 16px 22px; border-top: 1px solid var(--border); flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; }

  .abk-detail-field { margin-bottom: 16px; }
  .abk-detail-label { font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .abk-detail-value { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
  .abk-detail-value strong { color: var(--text-primary); }
  .abk-divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

  /* Reject reason input */
  .abk-reject-box {
    background: var(--status-red-bg); border: 1px solid rgba(248,113,113,0.3);
    border-radius: var(--radius-sm); padding: 12px;
  }
  .abk-reject-box label { font-family: var(--font-mono); font-size: 10px; color: var(--status-red); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 8px; }
  .abk-reject-input {
    width: 100%; padding: 8px 12px;
    background: var(--bg-surface); border: 1px solid rgba(248,113,113,0.3);
    border-radius: var(--radius-sm); color: var(--text-primary);
    font-family: var(--font-body); font-size: 13px; outline: none;
    margin-bottom: 8px; transition: border-color 0.2s;
  }
  .abk-reject-input:focus { border-color: var(--status-red); }
  .abk-reject-actions { display: flex; gap: 8px; }

  .abk-empty { text-align: center; padding: 48px; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in   { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }
  .fade-in-3 { animation: fadeInUp 0.5s 0.15s ease both; }

  @media (max-width: 1100px) { .abk-kpi-grid { grid-template-columns: repeat(3,1fr); } }
  @media (max-width: 768px)  { .abk-kpi-grid { grid-template-columns: repeat(2,1fr); } }
`;

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_DOT = {
  PENDING:   "var(--status-amber)",
  APPROVED:  "var(--status-green)",
  REJECTED:  "var(--status-red)",
  CANCELLED: "var(--text-muted)",
};
const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const fmt = iso => iso ? new Date(iso).toLocaleString("en-US", {
  day:"2-digit", month:"short", year:"numeric",
  hour:"2-digit", minute:"2-digit",
}) : "—";

const fmtDate = iso => iso ? new Date(iso).toLocaleDateString("en-US", {
  day:"2-digit", month:"short", year:"numeric",
}) : "—";

// ── Booking Detail Panel ───────────────────────────────────────────────────────
function BookingDetailPanel({ booking, onClose, onApprove, onReject }) {
  const [showRejectBox,  setShowRejectBox]  = useState(false);
  const [rejectReason,   setRejectReason]   = useState("");
  const [approving,      setApproving]      = useState(false);
  const [rejecting,      setRejecting]      = useState(false);
  const [error,          setError]          = useState("");

  const isPending = booking.status === "PENDING";

  const handleApprove = async () => {
    setApproving(true); setError("");
    try {
      await onApprove(booking.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve.");
    } finally { setApproving(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setError("Please provide a rejection reason."); return; }
    setRejecting(true); setError("");
    try {
      await onReject(booking.id, rejectReason.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject.");
    } finally { setRejecting(false); }
  };

  return (
    <>
      <div className="abk-panel-overlay" onClick={onClose} />
      <aside className="abk-panel">
        <div className="abk-panel-header">
          <div className="abk-panel-title">📅 Booking #{booking.id}</div>
          <button className="abk-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="abk-panel-body">
          {/* Status */}
          <div style={{ marginBottom: 20 }}>
            <span className={`badge ${booking.status}`}>
              <span className="badge-dot" style={{ background: STATUS_DOT[booking.status] }} />
              {booking.status}
            </span>
          </div>

          {/* Facility */}
          <div className="abk-detail-field">
            <div className="abk-detail-label">Facility</div>
            <div className="abk-detail-value">
              <strong>{booking.facilityName}</strong>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {booking.facilityType?.replace("_", " ")} · {booking.location}
              </div>
            </div>
          </div>

          {/* Requested By */}
          <div className="abk-detail-field">
            <div className="abk-detail-label">Requested By</div>
            <div className="abk-detail-value">
              <strong>{booking.bookedBy}</strong>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {booking.bookedByEmail}
              </div>
            </div>
          </div>

          {/* Time range */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="abk-detail-field">
              <div className="abk-detail-label">Start</div>
              <div className="abk-detail-value">{fmt(booking.startAt)}</div>
            </div>
            <div className="abk-detail-field">
              <div className="abk-detail-label">End</div>
              <div className="abk-detail-value">{fmt(booking.endAt)}</div>
            </div>
          </div>

          {/* Purpose */}
          {booking.purpose && (
            <div className="abk-detail-field">
              <div className="abk-detail-label">Purpose</div>
              <div className="abk-detail-value">{booking.purpose}</div>
            </div>
          )}

          {/* Attendees */}
          {booking.expectedAttendees && (
            <div className="abk-detail-field">
              <div className="abk-detail-label">Expected Attendees</div>
              <div className="abk-detail-value">{booking.expectedAttendees}</div>
            </div>
          )}

          <hr className="abk-divider" />

          {/* Submitted */}
          <div className="abk-detail-field">
            <div className="abk-detail-label">Submitted</div>
            <div className="abk-detail-value">{fmtDate(booking.createdAt)}</div>
          </div>

          {/* Review info */}
          {booking.reviewedBy && (
            <>
              <div className="abk-detail-field">
                <div className="abk-detail-label">Reviewed By</div>
                <div className="abk-detail-value">{booking.reviewedBy}</div>
              </div>
              <div className="abk-detail-field">
                <div className="abk-detail-label">Reviewed At</div>
                <div className="abk-detail-value">{fmtDate(booking.reviewedAt)}</div>
              </div>
            </>
          )}

          {/* Rejection reason if already rejected */}
          {booking.status === "REJECTED" && booking.rejectionReason && (
            <div className="abk-detail-field">
              <div className="abk-detail-label">Rejection Reason</div>
              <div className="abk-detail-value" style={{ color: "var(--status-red)" }}>
                {booking.rejectionReason}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px", background: "var(--status-red-bg)",
              border: "1px solid rgba(248,113,113,0.3)", borderRadius: "var(--radius-sm)",
              color: "var(--status-red)", fontSize: 13, marginTop: 12,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer actions — only for PENDING */}
        {isPending && (
          <div className="abk-panel-footer">
            {!showRejectBox ? (
              <div style={{ display: "flex", gap: 10 }}>
                <button className="approve-btn" style={{ flex: 1, padding: "10px" }}
                  onClick={handleApprove} disabled={approving}>
                  {approving ? "Approving…" : "✓ Approve Booking"}
                </button>
                <button className="reject-btn" style={{ flex: 1, padding: "10px" }}
                  onClick={() => setShowRejectBox(true)}>
                  ✕ Reject Booking
                </button>
              </div>
            ) : (
              <div className="abk-reject-box">
                <label>Rejection Reason *</label>
                <input
                  className="abk-reject-input"
                  placeholder="e.g. Facility already reserved, maintenance scheduled…"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  autoFocus
                />
                <div className="abk-reject-actions">
                  <button className="reject-btn" style={{ flex: 1 }}
                    onClick={handleReject} disabled={rejecting}>
                    {rejecting ? "Rejecting…" : "Confirm Rejection"}
                  </button>
                  <button className="btn-ghost" style={{ flex: 1 }}
                    onClick={() => { setShowRejectBox(false); setRejectReason(""); setError(""); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminBookingsPage() {
  const [bookings,        setBookings]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [filter,          setFilter]          = useState("ALL");
  const [search,          setSearch]          = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingApi.fetchAll(filter === "ALL" ? undefined : filter);
      setBookings(res.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // ── Actions ──
  const handleApprove = async (id) => {
    await bookingApi.approve(id);
    fetchBookings();
  };

  const handleReject = async (id, reason) => {
    await bookingApi.reject(id, reason);
    fetchBookings();
  };

  // ── Derived ──
  const total     = bookings.length;
  const pending   = bookings.filter(b => b.status === "PENDING").length;
  const approved  = bookings.filter(b => b.status === "APPROVED").length;
  const rejected  = bookings.filter(b => b.status === "REJECTED").length;
  const cancelled = bookings.filter(b => b.status === "CANCELLED").length;

  const filtered = bookings.filter(b => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.facilityName?.toLowerCase().includes(q) ||
      b.bookedBy?.toLowerCase().includes(q) ||
      b.bookedByEmail?.toLowerCase().includes(q) ||
      b.location?.toLowerCase().includes(q) ||
      b.purpose?.toLowerCase().includes(q) ||
      String(b.id).includes(q)
    );
  });

  return (
    <div className="abk-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Page Header */}
      <div className="page-header fade-in">
        <div>
          <div className="page-label">Admin</div>
          <div className="page-title">Booking Management</div>
          <div className="page-subtitle">
            Review, approve, or reject facility booking requests
          </div>
        </div>
        <div className="page-header-right">
          <button className="btn-ghost" onClick={fetchBookings}>↻ Refresh</button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="abk-kpi-grid fade-in-1">
        {[
          { icon: "📋", label: "Total",     value: total,     f: "ALL",       color: "var(--text-primary)" },
          { icon: "⏳", label: "Pending",   value: pending,   f: "PENDING",   color: "var(--status-amber)" },
          { icon: "✅", label: "Approved",  value: approved,  f: "APPROVED",  color: "var(--status-green)" },
          { icon: "❌", label: "Rejected",  value: rejected,  f: "REJECTED",  color: "var(--status-red)"   },
          { icon: "🚫", label: "Cancelled", value: cancelled, f: "CANCELLED", color: "var(--text-muted)"   },
        ].map(k => (
          <div key={k.label}
            className={`abk-kpi-card${filter === k.f ? " active" : ""}`}
            onClick={() => setFilter(k.f)}>
            <div className="abk-kpi-icon">{k.icon}</div>
            <div className="abk-kpi-value" style={{ color: k.color }}>
              {loading ? "—" : k.value}
            </div>
            <div className="abk-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search bar */}
      <div className="abk-filter-bar fade-in-2">
        <span className="abk-filter-label">Status:</span>
        {FILTERS.map(f => (
          <button key={f}
            className={`abk-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}>
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
        <input
          className="abk-search"
          placeholder="🔍  Search facility, user, purpose…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Bookings Table */}
      <div className="abk-card fade-in-3">
        <div className="abk-card-header">
          <div>
            <div className="abk-card-title">
              📅 All Bookings
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                background: "var(--accent-glow)", color: "var(--accent)",
                padding: "2px 8px", borderRadius: "100px",
              }}>
                {loading ? "…" : filtered.length}
              </span>
            </div>
            <div className="abk-card-subtitle">
              {filter === "ALL" ? "All booking requests" : `Showing: ${filter}`}
              {search && ` · Searching: "${search}"`}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="abk-empty">Loading bookings…</div>
        ) : filtered.length === 0 ? (
          <div className="abk-empty">
            {search ? `No results for "${search}"` : "No bookings found."}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Facility</th>
                  <th>Requested By</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Purpose</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}
                    onClick={() => setSelectedBooking(b)}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>#{b.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {b.facilityName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {b.facilityType?.replace("_", " ")} · {b.location}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {b.bookedBy}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {b.bookedByEmail}
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {fmt(b.startAt)}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {fmt(b.endAt)}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {b.purpose || "—"}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, textAlign: "center" }}>
                      {b.expectedAttendees || "—"}
                    </td>
                    <td>
                      <span className={`badge ${b.status}`}>
                        <span className="badge-dot" style={{ background: STATUS_DOT[b.status] }} />
                        {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {b.status === "PENDING" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="approve-btn"
                            onClick={async () => {
                              try { await handleApprove(b.id); }
                              catch (err) { alert(err.response?.data?.message || "Failed."); }
                            }}>
                            ✓
                          </button>
                          <button className="reject-btn"
                            onClick={() => setSelectedBooking(b)}>
                            ✕
                          </button>
                        </div>
                      )}
                      {b.status !== "PENDING" && (
                        <button className="btn-ghost"
                          style={{ fontSize: 11, padding: "4px 10px" }}
                          onClick={() => setSelectedBooking(b)}>
                          View →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedBooking && (
        <BookingDetailPanel
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}