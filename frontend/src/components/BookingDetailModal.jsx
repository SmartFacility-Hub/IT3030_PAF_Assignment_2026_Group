import React, { useCallback, useEffect, useState } from 'react';
import { cancelBooking, getBookingById } from '../services/bookingService';
import BookingStatusBadge from './BookingStatusBadge';

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

export default function BookingDetailModal({ booking, onClose, onRefresh }) {
  const [conflictMessage, setConflictMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busy, setBusy] = useState(false);

  const status = (booking?.status || '').toString().toUpperCase();
  const showUserCancel = status === 'PENDING' || status === 'APPROVED';

  const handleCancel = async () => {
    setActionError(null);
    setConflictMessage(null);
    setBusy(true);
    try {
      await cancelBooking(booking.id);
      if (onRefresh) onRefresh();
      onClose(); // Optional: close modal on success
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
    <>
      <style>{`
        .bd-modal-overlay {
          position: fixed; inset: 0; z-index: 400;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .bd-modal {
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: var(--radius-xl); padding: 32px;
          width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
          box-shadow: var(--shadow-card); position: relative;
        }
        .bd-modal-close {
          position: absolute; top: 20px; right: 20px;
          background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted);
          transition: color 0.2s;
        }
        .bd-modal-close:hover { color: var(--text-primary); }
        .bd-modal-title {
          font-family: var(--font-display); font-size: 24px; font-weight: 700;
          color: var(--text-primary); margin-bottom: 4px;
        }
        .bd-modal-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
        .bd-alert {
          padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px;
        }
        .bd-alert--error { background: var(--status-red-bg); color: var(--status-red); border: 1px solid var(--status-red); }
        .bd-alert--conflict { background: var(--status-amber-bg); color: var(--status-amber); border: 1px solid var(--status-amber); }
        .bd-detail-dl {
          display: grid; grid-template-columns: 140px 1fr; gap: 12px 16px; margin-top: 20px;
        }
        .bd-detail-dl dt {
          font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.08em; padding-top: 4px;
        }
        .bd-detail-dl dd {
          font-size: 14px; color: var(--text-primary); font-weight: 500; margin: 0;
        }
        .bd-btn-ghost {
          padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
          background: transparent; color: var(--text-secondary);
          font-family: var(--font-body); font-size: 13px; cursor: pointer; transition: all 0.2s;
        }
        .bd-btn-ghost:hover { border-color: var(--accent-border); color: var(--text-primary); background: var(--accent-glow); }
        .bd-history { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
        .bd-history h3 { font-family: var(--font-display); font-size: 15px; margin-bottom: 12px; }
        .bd-history ul { padding-left: 20px; font-size: 12px; color: var(--text-muted); }
        .bd-history li { margin-bottom: 6px; }
      `}</style>
      <div className="bd-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="bd-modal">
          <button className="bd-modal-close" onClick={onClose}>✕</button>
          
          <h1 className="bd-modal-title">Booking details</h1>
          <p className="bd-modal-sub">Full record for request #{booking?.id}.</p>

          {actionError && <div className="bd-alert bd-alert--error">{actionError}</div>}
          {conflictMessage && <div className="bd-alert bd-alert--conflict">{conflictMessage}</div>}

          {booking && (
            <>
              <div style={{ marginBottom: 16 }}>
                <BookingStatusBadge status={booking.status} />
              </div>

              <div className="bd-detail-dl">
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
                    <dd style={{ color: 'var(--status-red)' }}>{booking.rejectionReason}</dd>
                  </>
                )}
              </div>

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="bd-btn-ghost"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>

              {historyItems.length > 0 && (
                <div className="bd-history">
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
      </div>
    </>
  );
}
