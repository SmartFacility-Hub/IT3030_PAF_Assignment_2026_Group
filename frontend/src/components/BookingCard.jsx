import { Link } from 'react-router-dom';
import BookingStatusBadge from './BookingStatusBadge';
import '../styles/bookings.css';

/**
 * Card for a single list item (e.g. “My bookings”).
 * Actions follow business rules: only APPROVED and PENDING may show cancel.
 */
export default function BookingCard({ booking, onCancel, cancellingId }) {
  const id = booking?.id ?? booking?.bookingId;
  const resourceName =
    booking?.resourceName ?? booking?.resource?.name ?? `Resource #${booking?.resourceId ?? '—'}`;
  const date = booking?.bookingDate ?? booking?.date ?? '—';
  const start = booking?.startTime ?? '—';
  const end = booking?.endTime ?? '—';
  const purpose = booking?.purpose ?? '—';
  const status = (booking?.status || '').toString().toUpperCase();
  const isPending = status === 'PENDING';
  const isApproved = status === 'APPROVED';
  const showCancel = isPending || isApproved;
  const cancelLabel = isPending ? 'Cancel Request' : 'Cancel';

  return (
    <article className="booking-card">
      <div className="booking-card__header">
        <h2 className="booking-card__resource">{resourceName}</h2>
        <BookingStatusBadge status={booking?.status} />
      </div>
      <p className="booking-card__meta">
        {date}
        <br />
        {start} – {end}
      </p>
      <p className="booking-card__purpose">{purpose}</p>
      <div className="bookings-btn-group">
        {id != null && (
          <Link className="booking-card__link" to={`/bookings/${id}`}>
            View details →
          </Link>
        )}
        {showCancel && onCancel && id != null && (
          <button
            type="button"
            className="bookings-btn bookings-btn--ghost"
            onClick={() => onCancel(id)}
            disabled={cancellingId === id}
          >
            {cancellingId === id ? 'Cancelling…' : cancelLabel}
          </button>
        )}
      </div>
    </article>
  );
}
