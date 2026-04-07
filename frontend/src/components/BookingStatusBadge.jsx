import '../styles/bookings.css';

/**
 * Colored pill for booking workflow status.
 * PENDING → APPROVED | REJECTED; APPROVED → CANCELLED
 */
export default function BookingStatusBadge({ status }) {
  const normalized = (status || '').toString().toUpperCase();

  let variant = 'unknown';
  if (normalized === 'PENDING') variant = 'pending';
  else if (normalized === 'APPROVED') variant = 'approved';
  else if (normalized === 'REJECTED') variant = 'rejected';
  else if (normalized === 'CANCELLED') variant = 'cancelled';

  const label =
    normalized === 'CANCELLED'
      ? 'Cancelled'
      : normalized
        ? normalized.charAt(0) + normalized.slice(1).toLowerCase()
        : 'Unknown';

  return (
    <span className={`booking-status-badge booking-status-badge--${variant}`}>
      {label}
    </span>
  );
}
