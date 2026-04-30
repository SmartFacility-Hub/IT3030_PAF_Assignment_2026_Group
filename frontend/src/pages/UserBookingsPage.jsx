import { useState, useEffect, useCallback } from "react";
import { bookingApi } from "../services/api";
import facilityService from "../services/facilityService";

const styles = `
  .bk-page { padding: 32px; min-height: calc(100vh - 60px); }

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
  .btn-danger {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-red-bg); color: var(--status-red);
    border: 1px solid rgba(248,113,113,0.3);
    font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.15s;
  }
  .btn-danger:hover { background: var(--status-red); color: #fff; }
  .btn-edit {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-teal-bg); color: var(--status-teal);
    border: 1px solid rgba(45,212,191,0.3);
    font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.15s;
  }
  .btn-edit:hover { background: var(--status-teal); color: #fff; }

  /* KPI strip */
  .bk-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
  .bk-kpi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 18px 20px;
    transition: all 0.2s; cursor: pointer;
  }
  .bk-kpi-card:hover { border-color: rgba(45,212,191,0.35); transform: translateY(-1px); box-shadow: var(--shadow-card); }
  .bk-kpi-icon  { font-size: 20px; margin-bottom: 8px; }
  .bk-kpi-value { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .bk-kpi-label { font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; }

  /* Filter bar */
  .bk-filter-bar {
    display: flex; gap: 8px; flex-wrap: wrap;
    padding: 14px 20px; background: var(--bg-surface);
    border: 1px solid var(--border); border-radius: var(--radius-lg);
    margin-bottom: 20px; align-items: center;
  }
  .bk-filter-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-right: 4px; }
  .bk-filter-btn {
    padding: 5px 14px; border-radius: 100px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase;
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; color: var(--text-muted); transition: all 0.15s;
  }
  .bk-filter-btn:hover { border-color: rgba(45,212,191,0.4); color: var(--status-teal); }
  .bk-filter-btn.active { border-color: var(--status-teal); background: var(--status-teal-bg); color: var(--status-teal); }

  /* Card */
  .bk-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 24px; }
  .bk-card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); }
  .bk-card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
  .bk-card-subtitle { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th { font-family: var(--font-mono); font-size: 9.5px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; padding: 10px 16px; text-align: left; }
  th:first-child { padding-left: 22px; } th:last-child { padding-right: 22px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
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

  /* Modal */
  .bk-modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .bk-modal {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-xl); padding: 32px;
    width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto;
    box-shadow: var(--shadow-card);
  }
  .bk-modal-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; }
  .bk-modal-sub   { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
  .bk-form-group  { margin-bottom: 18px; }
  .bk-label { display: block; font-family: var(--font-mono); font-size: 10px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .bk-input, .bk-select, .bk-textarea {
    width: 100%; padding: 10px 14px;
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text-primary);
    font-family: var(--font-body); font-size: 13px; outline: none;
    transition: border-color 0.2s;
  }
  .bk-input:focus, .bk-select:focus, .bk-textarea:focus { border-color: rgba(45,212,191,0.5); }
  .bk-textarea { resize: vertical; min-height: 72px; }
  .bk-select option { background: var(--bg-surface); }
  .bk-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .bk-modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
  .bk-error {
    padding: 10px 14px; background: var(--status-red-bg);
    border: 1px solid rgba(248,113,113,0.3); border-radius: var(--radius-sm);
    color: var(--status-red); font-size: 13px; margin-bottom: 16px;
  }
  .bk-info {
    padding: 10px 14px; background: var(--status-teal-bg);
    border: 1px solid rgba(45,212,191,0.3); border-radius: var(--radius-sm);
    color: var(--status-teal); font-size: 12px; margin-bottom: 16px;
    font-family: var(--font-mono);
  }

  /* Booking detail panel */
  .bk-panel-overlay { position: fixed; inset: 0; z-index: 150; background: rgba(0,0,0,0.4); backdrop-filter: blur(2px); }
  .bk-panel {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 160;
    width: 420px; max-width: 95vw;
    background: var(--bg-surface); border-left: 1px solid var(--border);
    display: flex; flex-direction: column;
    box-shadow: -8px 0 40px rgba(0,0,0,0.3);
    animation: bkSlideIn 0.25s ease;
  }
  @keyframes bkSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .bk-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .bk-panel-title  { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); }
  .bk-panel-close  { width: 32px; height: 32px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-elevated); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--text-muted); transition: all 0.2s; }
  .bk-panel-close:hover { border-color: rgba(45,212,191,0.4); color: var(--text-primary); }
  .bk-panel-body   { flex: 1; overflow-y: auto; padding: 22px; }
  .bk-detail-field { margin-bottom: 16px; }
  .bk-detail-label { font-family: var(--font-mono); font-size: 9.5px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .bk-detail-value { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
  .bk-detail-value strong { color: var(--text-primary); }
  .bk-divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
  .bk-panel-actions { display: flex; gap: 10px; padding: 16px 22px; border-top: 1px solid var(--border); flex-shrink: 0; }

  .bk-empty { text-align: center; padding: 40px; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in   { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }
  .fade-in-3 { animation: fadeInUp 0.5s 0.15s ease both; }

  @media (max-width: 900px)  { .bk-kpi-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 600px)  { .bk-form-row { grid-template-columns: 1fr; } }
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

const toPayload = val =>
  val && val.length === 16 ? `${val}:00` : val;

// ── Create / Edit Modal ────────────────────────────────────────────────────────
function BookingModal({ editBooking, onClose, onSaved }) {
  const isEdit = !!editBooking;
  const [facilities,        setFacilities]        = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(!isEdit);
  const [form, setForm] = useState({
    facilityId:        isEdit ? editBooking.facilityId  : "",
    startAt:           isEdit ? (editBooking.startAt||"").slice(0,16) : "",
    endAt:             isEdit ? (editBooking.endAt||"").slice(0,16)   : "",
    purpose:           isEdit ? (editBooking.purpose||"")             : "",
    expectedAttendees: isEdit ? (editBooking.expectedAttendees||"")   : "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    if (isEdit) return;
    let mounted = true;
    (async () => {
      try {
        const res = await facilityService.getAll({ status: "ACTIVE" });
        if (mounted) setFacilities(res.data || []);
      } catch (_) {}
      finally { if (mounted) setLoadingFacilities(false); }
    })();
    return () => { mounted = false; };
  }, [isEdit]);

  const handleField = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const selectedFacility = isEdit
    ? null
    : facilities.find(f => String(f.id) === String(form.facilityId));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (!form.startAt || !form.endAt) { setError("Please set start and end time."); return; }
    if (new Date(form.endAt) <= new Date(form.startAt)) { setError("End time must be after start time."); return; }

    setSaving(true);
    try {
      const payload = {
        startAt:           toPayload(form.startAt),
        endAt:             toPayload(form.endAt),
        purpose:           form.purpose?.trim() || null,
        expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : null,
      };
      if (isEdit) {
        await bookingApi.update(editBooking.id, payload);
      } else {
        await bookingApi.create({ ...payload, facilityId: Number(form.facilityId) });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to save booking.");
    } finally { setSaving(false); }
  };

  return (
    <div className="bk-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bk-modal">
        <div className="bk-modal-title">{isEdit ? "✏️ Edit Booking" : "📅 New Booking"}</div>
        <div className="bk-modal-sub">
          {isEdit
            ? `Editing booking #${editBooking.id} — only PENDING bookings can be changed.`
            : "Select a facility and choose your time slot."}
        </div>

        {error && <div className="bk-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Facility selector — only for create */}
          {isEdit ? (
            <div className="bk-form-group">
              <label className="bk-label">Facility</label>
              <div className="bk-input" style={{ display:"flex", alignItems:"center", color:"var(--text-muted)" }}>
                {editBooking.facilityName} — {editBooking.facilityType} — {editBooking.location}
              </div>
            </div>
          ) : (
            <div className="bk-form-group">
              <label className="bk-label">Facility *</label>
              <select className="bk-select" name="facilityId" value={form.facilityId}
                onChange={handleField} required>
                <option value="" disabled>
                  {loadingFacilities ? "Loading…" : "Select a facility"}
                </option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {f.type?.replace("_"," ")} — {f.location}
                    {f.capacity ? ` (${f.capacity} seats)` : ""}
                  </option>
                ))}
              </select>
              {selectedFacility && selectedFacility.type !== "EQUIPMENT" && selectedFacility.capacity && (
                <div className="bk-info" style={{ marginTop:8, marginBottom:0 }}>
                  ℹ️ Max capacity: {selectedFacility.capacity} seats
                </div>
              )}
            </div>
          )}

          {/* Time range */}
          <div className="bk-form-row">
            <div className="bk-form-group">
              <label className="bk-label">Start Date & Time *</label>
              <input className="bk-input" type="datetime-local" name="startAt"
                value={form.startAt} onChange={handleField} required />
            </div>
            <div className="bk-form-group">
              <label className="bk-label">End Date & Time *</label>
              <input className="bk-input" type="datetime-local" name="endAt"
                value={form.endAt} onChange={handleField} required />
            </div>
          </div>

          {/* Purpose */}
          <div className="bk-form-group">
            <label className="bk-label">Purpose</label>
            <textarea className="bk-textarea" name="purpose"
              placeholder="e.g. Group study, Lab session, Meeting…"
              value={form.purpose} onChange={handleField} />
          </div>

          {/* Expected Attendees — hide for EQUIPMENT type */}
          {(!selectedFacility || selectedFacility.type !== "EQUIPMENT") && (
            <div className="bk-form-group">
              <label className="bk-label">Expected Attendees</label>
              <input className="bk-input" type="number" name="expectedAttendees"
                min="1"
                max={selectedFacility?.capacity || undefined}
                placeholder="e.g. 15"
                value={form.expectedAttendees} onChange={handleField} />
            </div>
          )}

          <div className="bk-modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving || loadingFacilities}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Submit Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Booking Detail Panel ───────────────────────────────────────────────────────
function BookingDetailPanel({ booking, onClose, onEdit, onCancel }) {
  const canEdit   = booking.status === "PENDING";
  const canCancel = booking.status === "PENDING" || booking.status === "APPROVED";

  return (
    <>
      <div className="bk-panel-overlay" onClick={onClose} />
      <aside className="bk-panel">
        <div className="bk-panel-header">
          <div className="bk-panel-title">📅 Booking #{booking.id}</div>
          <button className="bk-panel-close" onClick={onClose}>✕</button>
        </div>
        <div className="bk-panel-body">
          {/* Status badge */}
          <div style={{ marginBottom:20 }}>
            <span className={`badge ${booking.status}`}>
              <span className="badge-dot" style={{ background: STATUS_DOT[booking.status] }} />
              {booking.status}
            </span>
          </div>

          <div className="bk-detail-field">
            <div className="bk-detail-label">Facility</div>
            <div className="bk-detail-value">
              <strong>{booking.facilityName}</strong>
              <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                {booking.facilityType?.replace("_"," ")} · {booking.location}
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div className="bk-detail-field">
              <div className="bk-detail-label">Start</div>
              <div className="bk-detail-value">{fmt(booking.startAt)}</div>
            </div>
            <div className="bk-detail-field">
              <div className="bk-detail-label">End</div>
              <div className="bk-detail-value">{fmt(booking.endAt)}</div>
            </div>
          </div>

          {booking.purpose && (
            <div className="bk-detail-field">
              <div className="bk-detail-label">Purpose</div>
              <div className="bk-detail-value">{booking.purpose}</div>
            </div>
          )}

          {booking.expectedAttendees && (
            <div className="bk-detail-field">
              <div className="bk-detail-label">Expected Attendees</div>
              <div className="bk-detail-value">{booking.expectedAttendees}</div>
            </div>
          )}

          <hr className="bk-divider" />

          <div className="bk-detail-field">
            <div className="bk-detail-label">Submitted</div>
            <div className="bk-detail-value">{fmtDate(booking.createdAt)}</div>
          </div>

          {booking.reviewedBy && (
            <>
              <div className="bk-detail-field">
                <div className="bk-detail-label">Reviewed By</div>
                <div className="bk-detail-value">{booking.reviewedBy}</div>
              </div>
              <div className="bk-detail-field">
                <div className="bk-detail-label">Reviewed At</div>
                <div className="bk-detail-value">{fmtDate(booking.reviewedAt)}</div>
              </div>
            </>
          )}

          {booking.rejectionReason && (
            <div className="bk-detail-field">
              <div className="bk-detail-label">Rejection Reason</div>
              <div className="bk-detail-value" style={{ color:"var(--status-red)" }}>
                {booking.rejectionReason}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {(canEdit || canCancel) && (
          <div className="bk-panel-actions">
            {canEdit && (
              <button className="btn-edit" style={{ flex:1 }} onClick={onEdit}>
                ✏️ Edit Booking
              </button>
            )}
            {canCancel && (
              <button className="btn-danger" style={{ flex:1 }} onClick={onCancel}>
                ✕ Cancel Booking
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function UserBookingsPage() {
  const [bookings,        setBookings]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [filter,          setFilter]          = useState("ALL");
  const [showCreate,      setShowCreate]      = useState(false);
  const [editingBooking,  setEditingBooking]  = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingApi.fetchMine();
      setBookings(res.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await bookingApi.cancel(id);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  // ── Derived ──
  const filtered = filter === "ALL"
    ? bookings
    : bookings.filter(b => b.status === filter);

  const total     = bookings.length;
  const pending   = bookings.filter(b => b.status === "PENDING").length;
  const approved  = bookings.filter(b => b.status === "APPROVED").length;
  const rejected  = bookings.filter(b => b.status === "REJECTED").length;

  return (
    <div className="bk-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Page Header */}
      <div className="page-header fade-in">
        <div>
          <div className="page-label">Bookings</div>
          <div className="page-title">My Bookings</div>
          <div className="page-subtitle">Request, track, and manage your facility reservations</div>
        </div>
        <div className="page-header-right">
          <button className="btn-ghost" onClick={fetchBookings}>↻ Refresh</button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            ＋ New Booking
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="bk-kpi-grid fade-in-1">
        {[
          { icon:"📋", label:"Total",    value: loading ? "…" : total,    filter:"ALL",      color:"var(--text-primary)" },
          { icon:"⏳", label:"Pending",  value: loading ? "…" : pending,  filter:"PENDING",  color:"var(--status-amber)" },
          { icon:"✅", label:"Approved", value: loading ? "…" : approved, filter:"APPROVED", color:"var(--status-green)" },
          { icon:"❌", label:"Rejected", value: loading ? "…" : rejected, filter:"REJECTED", color:"var(--status-red)" },
        ].map(k => (
          <div className="bk-kpi-card" key={k.label} onClick={() => setFilter(k.filter)}>
            <div className="bk-kpi-icon">{k.icon}</div>
            <div className="bk-kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="bk-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bk-filter-bar fade-in-2">
        <span className="bk-filter-label">Filter:</span>
        {FILTERS.map(f => (
          <button key={f}
            className={`bk-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}>
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bk-card fade-in-3">
        <div className="bk-card-header">
          <div>
            <div className="bk-card-title">
              📅 Reservations
              <span style={{
                fontFamily:"var(--font-mono)", fontSize:11,
                background:"var(--status-teal-bg)", color:"var(--status-teal)",
                padding:"2px 8px", borderRadius:"100px",
              }}>
                {loading ? "…" : filtered.length}
              </span>
            </div>
            <div className="bk-card-subtitle">
              {filter === "ALL" ? "All your bookings" : `Filtered: ${filter}`}
            </div>
          </div>
          
        </div>

        {loading ? (
          <div className="bk-empty">Loading bookings…</div>
        ) : filtered.length === 0 ? (
          <div className="bk-empty">
            {filter === "ALL"
              ? "No bookings yet. Click \"＋ New Booking\" to get started."
              : `No ${filter.toLowerCase()} bookings found.`}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Facility</th>
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
                  <tr key={b.id} onClick={() => setSelectedBooking(b)}
                    style={{ cursor:"pointer" }}>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>
                      #{b.id}
                    </td>
                    <td>
                      <div style={{ fontWeight:600, color:"var(--text-primary)" }}>
                        {b.facilityName}
                      </div>
                      <div style={{ fontSize:11, color:"var(--text-muted)" }}>
                        {b.facilityType?.replace("_"," ")} · {b.location}
                      </div>
                    </td>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-muted)" }}>
                      {fmt(b.startAt)}
                    </td>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-muted)" }}>
                      {fmt(b.endAt)}
                    </td>
                    <td style={{ fontSize:12, color:"var(--text-muted)", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {b.purpose || "—"}
                    </td>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:12, textAlign:"center" }}>
                      {b.expectedAttendees || "—"}
                    </td>
                    <td>
                      <span className={`badge ${b.status}`}>
                        <span className="badge-dot" style={{ background: STATUS_DOT[b.status] }} />
                        {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:"flex", gap:6 }}>
                        {b.status === "PENDING" && (
                          <button className="btn-edit"
                            onClick={() => setEditingBooking(b)}>
                            Edit
                          </button>
                        )}
                        {(b.status === "PENDING" || b.status === "APPROVED") && (
                          <button className="btn-danger"
                            onClick={() => handleCancel(b.id)}>
                            Cancel
                          </button>
                        )}
                        {b.status === "REJECTED" && b.rejectionReason && (
                          <span style={{ fontSize:11, color:"var(--status-red)", fontFamily:"var(--font-mono)" }}
                            title={b.rejectionReason}>
                            ⚠ Reason
                          </span>
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

      {/* Modals */}
      {showCreate && (
        <BookingModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); fetchBookings(); }}
        />
      )}
      {editingBooking && (
        <BookingModal
          editBooking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSaved={() => { setEditingBooking(null); fetchBookings(); }}
        />
      )}
      {selectedBooking && (
        <BookingDetailPanel
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onEdit={() => { setEditingBooking(selectedBooking); setSelectedBooking(null); }}
          onCancel={() => handleCancel(selectedBooking.id)}
        />
      )}
    </div>
  );
}