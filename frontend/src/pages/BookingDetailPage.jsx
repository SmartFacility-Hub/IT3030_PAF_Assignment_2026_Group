import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  approveBooking,
  cancelBooking,
  getBookingById,
  rejectBooking,
} from '../services/bookingService';
import BookingStatusBadge from '../components/BookingStatusBadge';
import RejectModal from '../components/RejectModal';

function extractMessage(err) {
  const d = err?.response?.data;
  if (typeof d === 'string') return d;
  if (d?.message) return Array.isArray(d.message) ? d.message.join(' ') : d.message;
  return err?.message || 'Request failed.';
}

/**
 * Integrate with your platform auth (JWT/session). For local dev, you can set e.g.
 * localStorage.setItem('smartcampus_user', JSON.stringify({ role: 'ADMIN' }))
 * so detail-page moderation buttons render.
 */
function isBookingAdminUser() {
  try {
    const raw = localStorage.getItem('smartcampus_user');
    if (!raw) return false;
    const u = JSON.parse(raw);
    const role = (u?.role || u?.userRole || '').toString().toUpperCase();
    return role === 'ADMIN' || u?.admin === true || u?.isAdmin === true;
  } catch {
    return false;
  }
}

function normalizeHistory(booking) {
  if (!booking) return [];
  const h =
    booking.statusHistory ??
    booking.statusHistories ??
    booking.history ??
    booking.auditEntries ??
    booking.events;
  if (!Array.isArray(h)) return [];
  return h;
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conflictMessage, setConflictMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);

  const isAdmin = useMemo(() => isBookingAdminUser(), []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      // BACKEND: GET /api/bookings/{id} - fetches one booking (BookingController.java)
      const res = await getBookingById(id);
      setBooking(res.data);
    } catch (err) {
      setError(extractMessage(err));
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const status = (booking?.status || '').toString().toUpperCase();
  const showUserCancel = status === 'PENDING' || status === 'APPROVED';
  const showAdminActions = isAdmin && status === 'PENDING';

  const handleApprove = async () => {
    setActionError('');
    setConflictMessage('');
    setBusy('approve');
    try {
      // BACKEND: PUT /api/bookings/{id}/approve — admin approves (BookingController.java)
      await approveBooking(id);
      await load();
    } catch (err) {
      if (err?.response?.status === 409) {
        setConflictMessage(extractMessage(err) || 'Conflict: could not approve this booking.');
      } else {
        setActionError(extractMessage(err));
      }
    } finally {
      setBusy('');
    }
  };

  const handleRejectConfirm = async (reason) => {
    setActionError('');
    setConflictMessage('');
    setBusy('reject');
    try {
      // BACKEND: PUT /api/bookings/{id}/reject — admin rejects with reason (BookingController.java)
      await rejectBooking(id, reason);
      setRejectOpen(false);
      await load();
    } catch (err) {
      if (err?.response?.status === 409) {
        setConflictMessage(extractMessage(err) || 'Conflict: could not reject this booking.');
      } else {
        setActionError(extractMessage(err));
      }
    } finally {
      setBusy('');
    }
  };

  const handleCancel = async () => {
    setActionError('');
    setConflictMessage('');
    setBusy('cancel');
    try {
      // BACKEND: PUT /api/bookings/{id}/cancel — booking owner cancels (BookingController.java)
      await cancelBooking(id);
      await load();
    } catch (err) {
      if (err?.response?.status === 409) {
        setConflictMessage(extractMessage(err) || 'Conflict: cancellation is not allowed.');
      } else {
        setActionError(extractMessage(err));
      }
    } finally {
      setBusy('');
    }
  };

  const historyItems = normalizeHistory(booking);

  const resourceName =
    booking?.resourceName ?? booking?.resource?.name ?? (booking?.resourceId != null ? `Resource #${booking.resourceId}` : '—');
  const userName =
    booking?.userName ??
    booking?.requesterName ??
    booking?.fullName ??
    booking?.user?.fullName ??
    booking?.user?.name ??
    '—';
  const date = booking?.bookingDate ?? booking?.date ?? '—';
  const start = booking?.startTime ?? '—';
  const end = booking?.endTime ?? '—';

  return (
    <div>
      <p style={{ marginBottom: 16 }}>
        <Link to="/bookings/my">← My bookings</Link>
        {' · '}
        <Link to="/bookings/admin">Admin list</Link>
      </p>

      <h1 className="bookings-page-title">Booking details</h1>
      <p className="bookings-page-sub">Full record for request #{id}.</p>

      {error && <div className="bookings-alert bookings-alert--error">{error}</div>}
      {actionError && <div className="bookings-alert bookings-alert--error">{actionError}</div>}
      {conflictMessage && <div className="bookings-alert bookings-alert--conflict">{conflictMessage}</div>}

      {loading && <p className="bookings-loading">Loading…</p>}

      {!loading && booking && (
        <>
          <div className="bookings-detail">
            <p style={{ marginTop: 0, marginBottom: 16 }}>
              <BookingStatusBadge status={booking.status} />
            </p>
            <dl>
              <dt>User</dt>
              <dd>{userName}</dd>
              <dt>Resource</dt>
              <dd>{resourceName}</dd>
              <dt>Date</dt>
              <dd>{date}</dd>
              <dt>Time</dt>
              <dd>
                {start} – {end}
              </dd>
              <dt>Purpose</dt>
              <dd>{booking.purpose ?? '—'}</dd>
              <dt>Expected attendees</dt>
              <dd>{booking.expectedAttendees ?? booking.attendees ?? '—'}</dd>
              {booking.rejectionReason != null && booking.rejectionReason !== '' && (
                <>
                  <dt>Rejection reason</dt>
                  <dd>{booking.rejectionReason}</dd>
                </>
              )}
            </dl>

            {showAdminActions && (
              <div className="bookings-btn-group" style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="bookings-btn bookings-btn--success"
                  disabled={!!busy}
                  onClick={handleApprove}
                >
                  {busy === 'approve' ? 'Approving…' : 'Approve'}
                </button>
                <button
                  type="button"
                  className="bookings-btn bookings-btn--danger"
                  disabled={!!busy}
                  onClick={() => setRejectOpen(true)}
                >
                  Reject
                </button>
              </div>
            )}

            {showUserCancel && (
              <div className="bookings-btn-group" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="bookings-btn bookings-btn--ghost"
                  disabled={!!busy}
                  onClick={handleCancel}
                >
                  {busy === 'cancel'
                    ? 'Cancelling…'
                    : status === 'PENDING'
                      ? 'Cancel request'
                      : 'Cancel booking'}
                </button>
              </div>
            )}
          </div>

          {historyItems.length > 0 && (
            <div className="bookings-history">
              <h3>Status history</h3>
              <ul>
                {historyItems.map((entry, idx) => {
                  const when = entry.at ?? entry.changedAt ?? entry.timestamp ?? entry.createdAt ?? '';
                  const st = entry.status ?? entry.newStatus ?? '';
                  const note = entry.note ?? entry.reason ?? entry.message ?? '';
                  const line = [when && String(when), st && String(st), note && String(note)].filter(Boolean).join(' — ');
                  return <li key={idx}>{line || JSON.stringify(entry)}</li>;
                })}
              </ul>
            </div>
          )}
        </>
      )}

      <RejectModal
        open={rejectOpen}
        title="Reject booking"
        busy={busy === 'reject'}
        onClose={() => !busy && setRejectOpen(false)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}
