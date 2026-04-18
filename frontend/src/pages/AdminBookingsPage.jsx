import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { approveBooking, getAllBookings, rejectBooking } from '../services/bookingService';
import BookingStatusBadge from '../components/BookingStatusBadge';
import RejectModal from '../components/RejectModal';

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.bookings ?? data?.items ?? [];
}

function extractMessage(err) {
  const d = err?.response?.data;
  if (typeof d === 'string') return d;
  if (d?.message) return Array.isArray(d.message) ? d.message.join(' ') : d.message;
  return err?.message || 'Request failed.';
}

function buildQuery(filters) {
  const q = {};
  if (filters.status && filters.status !== 'ALL') q.status = filters.status;
  if (filters.bookingDate) q.bookingDate = filters.bookingDate;
  return q;
}

export default function AdminBookingsPage() {
  const [status, setStatus] = useState('ALL');
  const [bookingDate, setBookingDate] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conflictMessage, setConflictMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [rejectForId, setRejectForId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // BACKEND: GET /api/bookings — admin list with optional filters (BookingController.java)
      const res = await getAllBookings(buildQuery({ status, bookingDate }));
      setBookings(normalizeList(res.data));
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, bookingDate]);

  useEffect(() => {
    load();
  }, [load]);

  const setBusy = (id, action) => {
    setBusyId(id);
    setBusyAction(action);
  };

  const handleApprove = async (id) => {
    setActionError(null);
    setConflictMessage(null);
    setBusy(id, 'approve');
    try {
      // BACKEND: PUT /api/bookings/{id}/approve — admin approves (BookingController.java)
      await approveBooking(id);
      await load();
    } catch (err) {
      if (err?.response?.status === 409) {
        setConflictMessage(extractMessage(err) || 'Conflict: booking could not be approved.');
      } else {
        setActionError(extractMessage(err));
      }
    } finally {
      setBusy(null, '');
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectForId) return;
    setActionError(null);
    setConflictMessage(null);
    setBusy(rejectForId, 'reject');
    try {
      // BACKEND: PUT /api/bookings/{id}/reject — admin rejects with reason (BookingController.java)
      await rejectBooking(rejectForId, reason);
      setRejectForId(null);
      await load();
    } catch (err) {
      if (err?.response?.status === 409) {
        setConflictMessage(extractMessage(err) || 'Conflict: booking could not be rejected.');
      } else {
        setActionError(extractMessage(err));
      }
    } finally {
      setBusy(null, '');
    }
  };

  return (
    <div>
      <h1 className="bookings-page-title">All bookings (admin)</h1>
      <p className="bookings-page-sub">
        Review every request across users. Approve or reject pending items; approved bookings can be cancelled when policy allows.
      </p>

      {error && <div className="bookings-alert bookings-alert--error">{error}</div>}
      {actionError && <div className="bookings-alert bookings-alert--error">{actionError}</div>}
      {conflictMessage && <div className="bookings-alert bookings-alert--conflict">{conflictMessage}</div>}

      <div className="bookings-filters">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
        <label>
          Date
          <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
        </label>
        <button type="button" className="bookings-btn bookings-btn--ghost" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      {loading && <p className="bookings-loading">Loading bookings…</p>}

      {!loading && !error && bookings.length === 0 && (
        <div className="bookings-empty">No bookings match the current filters.</div>
      )}

      {!loading && bookings.length > 0 && (
        <>
          <div className="bookings-table-wrap">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const id = b.id;
                  const userName = b.userName ?? '—';
                  const resourceName = b.resourceName ?? '—';
                  const date = b.bookingDate ?? '—';
                  const start = b.startTime ?? '—';
                  const end = b.endTime ?? '—';
                  const purpose = b.purpose ?? '—';
                  const attendees = b.expectedAttendees ?? '—';
                  const st = (b.status || '').toString().toUpperCase();
                  const showModeration = st === 'PENDING';

                  return (
                    <tr key={id ?? JSON.stringify(b)}>
                      <td>{userName}</td>
                      <td>{resourceName}</td>
                      <td>{date}</td>
                      <td>
                        {start} – {end}
                      </td>
                      <td>{purpose}</td>
                      <td>{attendees}</td>
                      <td>
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td>
                        <div className="bookings-table-actions">
                          {id != null && (
                            <Link to={`/bookings/${id}`} className="bookings-btn bookings-btn--ghost">
                              Details
                            </Link>
                          )}
                          {showModeration && id != null && (
                            <>
                              <button
                                type="button"
                                className="bookings-btn bookings-btn--success"
                                disabled={busyId === id}
                                onClick={() => handleApprove(id)}
                              >
                                {busyId === id && busyAction === 'approve' ? '…' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                className="bookings-btn bookings-btn--danger"
                                disabled={busyId === id}
                                onClick={() => setRejectForId(id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bookings-admin-cards">
            {bookings.map((b) => {
              const id = b.id;
              const userName = b.userName ?? '—';
              const resourceName = b.resourceName ?? '—';
              const date = b.bookingDate ?? '—';
              const start = b.startTime ?? '—';
              const end = b.endTime ?? '—';
              const st = (b.status || '').toString().toUpperCase();
              const showModeration = st === 'PENDING';
              return (
                <div className="bookings-admin-card" key={id ?? JSON.stringify(b)}>
                  <dl>
                    <dt>User</dt>
                    <dd>{userName}</dd>
                    <dt>Resource</dt>
                    <dd>{resourceName}</dd>
                    <dt>Date / time</dt>
                    <dd>
                      {date} · {start}–{end}
                    </dd>
                    <dt>Purpose</dt>
                    <dd>{b.purpose ?? '—'}</dd>
                    <dt>Attendees</dt>
                    <dd>{b.expectedAttendees ?? '—'}</dd>
                    <dt>Status</dt>
                    <dd>
                      <BookingStatusBadge status={b.status} />
                    </dd>
                  </dl>
                  <div className="bookings-btn-group" style={{ marginTop: 12 }}>
                    {id != null && (
                      <Link to={`/bookings/${id}`} className="bookings-btn bookings-btn--ghost">
                        Details
                      </Link>
                    )}
                    {showModeration && id != null && (
                      <>
                        <button
                          type="button"
                          className="bookings-btn bookings-btn--success"
                          disabled={busyId === id}
                          onClick={() => handleApprove(id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="bookings-btn bookings-btn--danger"
                          disabled={busyId === id}
                          onClick={() => setRejectForId(id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <RejectModal
        open={rejectForId != null}
        title="Reject booking"
        busy={busyId != null && busyAction === 'reject'}
        onClose={() => !busyId && setRejectForId(null)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}
