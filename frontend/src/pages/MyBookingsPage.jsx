import { useCallback, useEffect, useState } from 'react';
import { cancelBooking, getMyBookings } from '../services/bookingService';
import BookingCard from '../components/BookingCard';

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.bookings ?? data?.items ?? [];
}

function extractMessage(err) {
  const d = err?.response?.data;
  if (typeof d === 'string') return d;
  if (d?.message) return Array.isArray(d.message) ? d.message.join(' ') : d.message;
  return err?.message || 'Could not load bookings.';
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conflictMessage, setConflictMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // BACKEND: GET /api/bookings/my - fetches current user's bookings (BookingController.java)
      const res = await getMyBookings();
      setBookings(normalizeList(res.data));
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (id) => {
    setActionError(null);
    setConflictMessage(null);
    setCancellingId(id);
    try {
      // BACKEND: PUT /api/bookings/{id}/cancel — user cancels own booking (BookingController.java)
      await cancelBooking(id);
      await load();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setConflictMessage(
          err?.response?.data?.message ||
            'Cancellation could not be completed (conflict or no longer allowed).',
        );
      } else {
        setActionError(extractMessage(err));
      }
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      <h1 className="bookings-page-title">My bookings</h1>
      <p className="bookings-page-sub">Bookings associated with your account. Pending and approved requests can be cancelled.</p>

      {error && <div className="bookings-alert bookings-alert--error">{error}</div>}
      {actionError && <div className="bookings-alert bookings-alert--error">{actionError}</div>}
      {conflictMessage && <div className="bookings-alert bookings-alert--conflict">{conflictMessage}</div>}

      {loading && <p className="bookings-loading">Loading your bookings…</p>}

      {!loading && !error && bookings.length === 0 && (
        <div className="bookings-empty">You have no bookings yet. Create a new request to get started.</div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="bookings-cards">
          {bookings.map((b) => (
            <BookingCard key={b.id ?? b.bookingId} booking={b} onCancel={handleCancel} cancellingId={cancellingId} />
          ))}
        </div>
      )}
    </div>
  );
}
