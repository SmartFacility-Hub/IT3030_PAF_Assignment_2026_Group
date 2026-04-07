import { useEffect, useState } from 'react';
import '../styles/bookings.css';

/**
 * Small modal for entering a rejection reason before calling the reject API.
 */
export default function RejectModal({ open, title, onClose, onConfirm, busy }) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div className="reject-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
      <div className="reject-modal">
        <h3 id="reject-modal-title">{title || 'Reject booking'}</h3>
        <p>Provide a short reason. It will be stored with the booking record.</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection…"
            required
            disabled={busy}
            aria-label="Rejection reason"
          />
          <div className="reject-modal-actions">
            <button type="button" className="bookings-btn bookings-btn--ghost" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className="bookings-btn bookings-btn--danger" disabled={busy || !reason.trim()}>
              {busy ? 'Submitting…' : 'Reject booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
