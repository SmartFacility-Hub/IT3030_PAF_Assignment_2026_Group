import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelBooking, getBookingById } from '../services/bookingService';
import BookingStatusBadge from '../components/BookingStatusBadge';

function extractMessage(err) {
  const d = err?.response?.data;
  if (typeof d === 'string') return d;
  if (d?.message) return Array.isArray(d.message) ? d.message.join(' ') : d.message;
  return err?.message || 'Request failed.';
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
  const [error, setError] = useState(null);
  const [conflictMessage, setConflictMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
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

  const handleCancel = async () => {
    setActionError(null);
    setConflictMessage(null);
    setBusy(true);
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
      setBusy(false);
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
              <dd>{booking.expectedAttendees ?? '—'}</dd>
              {booking.rejectionReason != null && booking.rejectionReason !== '' && (
                <>
                  <dt>Rejection reason</dt>
                  <dd>{booking.rejectionReason}</dd>
                </>
              )}
            </dl>

            {showUserCancel && (
              <div className="bookings-btn-group" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="bookings-btn bookings-btn--ghost"
                  disabled={busy}
                  onClick={handleCancel}
                >
                  {busy ? 'Cancelling…' : status === 'PENDING' ? 'Cancel request' : 'Cancel booking'}
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
    </div>
  );
}
