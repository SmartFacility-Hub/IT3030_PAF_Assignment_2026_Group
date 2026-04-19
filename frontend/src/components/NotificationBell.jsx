import { useState, useEffect, useRef, useCallback } from "react";
import { notificationApi, ticketApi } from "../services/api";

/* ─── Inline styles (matches project design system) ─────────────────────────── */
const bellStyles = `
  .notif-bell-wrap { position: relative; }

  .notif-bell-btn {
    width: 36px; height: 36px; border-radius: var(--radius-sm, 8px);
    border: 1px solid var(--border, rgba(255,255,255,0.07));
    background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: var(--text-secondary, #c4cdd9);
    transition: all 0.2s; position: relative;
  }
  .notif-bell-btn:hover {
    border-color: var(--accent-border, rgba(245,166,35,0.3));
    color: var(--accent, #f5a623);
    background: var(--accent-glow, rgba(245,166,35,0.12));
  }
  .notif-bell-btn.has-unread { animation: bellPulse 2s infinite; }

  .notif-badge {
    position: absolute; top: 3px; right: 3px;
    min-width: 16px; height: 16px; padding: 0 4px;
    border-radius: 100px;
    background: var(--status-red, #f87171); color: #fff;
    font-family: var(--font-mono, monospace); font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--bg-surface, #111827);
    line-height: 1;
  }

  /* ── Dropdown panel ── */
  .notif-panel {
    position: absolute; top: calc(100% + 10px); right: 0;
    width: 380px; max-height: 480px;
    background: var(--bg-surface, #111827);
    border: 1px solid var(--border, rgba(255,255,255,0.07));
    border-radius: var(--radius-lg, 16px);
    box-shadow: 0 12px 48px rgba(0,0,0,0.4);
    z-index: 9999; overflow: hidden;
    animation: notifSlideDown 0.2s ease;
    display: flex; flex-direction: column;
  }
  @keyframes notifSlideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bellPulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.08); }
  }

  .notif-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .notif-panel-title {
    font-family: var(--font-display, serif); font-size: 14px; font-weight: 700;
    color: var(--text-primary, #f0f4ff);
    display: flex; align-items: center; gap: 8px;
  }
  .notif-panel-count {
    font-family: var(--font-mono, monospace); font-size: 10px; font-weight: 600;
    padding: 2px 8px; border-radius: 100px;
    background: var(--accent-glow, rgba(245,166,35,0.12));
    color: var(--accent, #f5a623);
  }
  .notif-mark-all {
    font-family: var(--font-mono, monospace); font-size: 10px;
    color: var(--accent, #f5a623); cursor: pointer;
    background: none; border: none; padding: 4px 8px;
    border-radius: var(--radius-sm, 8px);
    transition: all 0.15s;
  }
  .notif-mark-all:hover { background: var(--accent-glow); }

  .notif-panel-body {
    flex: 1; overflow-y: auto; max-height: 400px;
    scrollbar-width: thin;
    scrollbar-color: var(--bg-elevated, #1a2235) transparent;
  }
  .notif-panel-body::-webkit-scrollbar { width: 5px; }
  .notif-panel-body::-webkit-scrollbar-track { background: transparent; }
  .notif-panel-body::-webkit-scrollbar-thumb { background: var(--bg-elevated); border-radius: 100px; }

  .notif-item {
    display: flex; gap: 12px; padding: 12px 18px;
    border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background 0.15s;
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: var(--bg-elevated, #1a2235); }
  .notif-item.unread {
    background: var(--accent-glow, rgba(245,166,35,0.12));
    border-left: 3px solid var(--accent, #f5a623);
  }
  .notif-item.unread:hover { background: rgba(245,166,35,0.18); }

  .notif-icon-wrap {
    width: 34px; height: 34px; border-radius: var(--radius-sm, 8px);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
    border: 1px solid var(--border);
  }
  .notif-icon-wrap.booking  { background: rgba(96,165,250,0.12); }
  .notif-icon-wrap.ticket   { background: rgba(245,166,35,0.12); }
  .notif-icon-wrap.comment  { background: rgba(167,139,250,0.12); }
  .notif-icon-wrap.assign   { background: rgba(74,222,128,0.12); }

  .notif-content { flex: 1; min-width: 0; }
  .notif-title-text {
    font-size: 12px; font-weight: 600; color: var(--text-primary, #f0f4ff);
    line-height: 1.3; margin-bottom: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .notif-message {
    font-size: 11px; color: var(--text-muted, #8892a4);
    line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .notif-time {
    font-family: var(--font-mono, monospace); font-size: 9px;
    color: var(--text-muted, #8892a4); margin-top: 4px;
    display: flex; align-items: center; gap: 6px;
  }
  .notif-unread-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent, #f5a623); flex-shrink: 0;
  }

  .notif-empty {
    padding: 40px 18px; text-align: center;
    font-family: var(--font-mono, monospace); font-size: 11px;
    color: var(--text-muted, #8892a4);
  }
  .notif-empty-icon { font-size: 28px; margin-bottom: 10px; display: block; }

  /* ── Detail overlay (ticket / booking detail shown on click) ── */
  .notif-detail-overlay {
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px; animation: notifFadeIn 0.2s ease;
  }
  @keyframes notifFadeIn { from { opacity: 0; } to { opacity: 1; } }

  .notif-detail-panel {
    background: var(--bg-surface, #111827);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg, 16px);
    width: 100%; max-width: 520px; max-height: 85vh;
    overflow-y: auto; box-shadow: 0 16px 64px rgba(0,0,0,0.5);
    animation: notifSlideUp 0.25s ease;
  }
  @keyframes notifSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .notif-detail-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: var(--bg-surface); z-index: 1;
  }
  .notif-detail-title {
    font-family: var(--font-display, serif); font-size: 16px; font-weight: 700;
    color: var(--text-primary); display: flex; align-items: center; gap: 8px;
  }
  .notif-detail-close {
    width: 32px; height: 32px; border-radius: var(--radius-sm, 8px);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: var(--text-muted); transition: all 0.2s;
  }
  .notif-detail-close:hover { border-color: var(--accent-border); color: var(--text-primary); }
  .notif-detail-body { padding: 22px; }
  .notif-detail-field { margin-bottom: 16px; }
  .notif-detail-label {
    font-family: var(--font-mono, monospace); font-size: 9px;
    color: var(--text-muted); text-transform: uppercase;
    letter-spacing: 0.1em; margin-bottom: 4px;
  }
  .notif-detail-value { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
  .notif-detail-divider { border: 0; border-top: 1px solid var(--border); margin: 20px 0; }

  .notif-detail-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-mono, monospace); font-size: 10px; font-weight: 500;
    padding: 3px 10px; border-radius: 100px;
  }

  .notif-comment-item {
    background: var(--bg-elevated, #1a2235); border: 1px solid var(--border);
    border-radius: var(--radius-sm, 8px); padding: 12px 14px; margin-bottom: 10px;
  }
  .notif-comment-meta {
    display: flex; justify-content: space-between; margin-bottom: 6px;
  }
  .notif-comment-author { font-size: 11px; font-weight: 600; color: var(--text-primary); }
  .notif-comment-time { font-family: var(--font-mono, monospace); font-size: 10px; color: var(--text-muted); }
  .notif-comment-text { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
`;

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const ICON_MAP = {
  BOOKING_APPROVED:      { emoji: "✅", cls: "booking"  },
  BOOKING_REJECTED:      { emoji: "❌", cls: "booking"  },
  TICKET_STATUS_CHANGED: { emoji: "🔧", cls: "ticket"   },
  TICKET_COMMENT_ADDED:  { emoji: "💬", cls: "comment"  },
  TICKET_ASSIGNED:       { emoji: "👷", cls: "assign"   },
  TICKET_CREATED:        { emoji: "🎫", cls: "ticket"   },
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_COLORS = {
  OPEN:        { bg: "rgba(248,113,113,0.15)", fg: "var(--status-red, #f87171)"  },
  IN_PROGRESS: { bg: "rgba(245,166,35,0.15)",  fg: "var(--status-amber, #fbbf24)" },
  RESOLVED:    { bg: "rgba(74,222,128,0.15)",   fg: "var(--status-green, #4ade80)" },
  CLOSED:      { bg: "var(--bg-elevated)",       fg: "var(--text-muted)"           },
  REJECTED:    { bg: "rgba(248,113,113,0.15)", fg: "var(--status-red, #f87171)"  },
  PENDING:     { bg: "rgba(245,166,35,0.15)",  fg: "var(--status-amber, #fbbf24)" },
  APPROVED:    { bg: "rgba(74,222,128,0.15)",   fg: "var(--status-green, #4ade80)" },
  CANCELLED:   { bg: "rgba(248,113,113,0.15)", fg: "var(--status-red, #f87171)"  },
};

/* ─── Ticket Detail Overlay ────────────────────────────────────────────────── */
function TicketDetailOverlay({ ticketId, onClose }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await ticketApi.getById(ticketId);
        if (mounted) setTicket(res.data);
      } catch (e) {
        console.error("Failed to fetch ticket", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [ticketId]);

  if (loading) {
    return (
      <div className="notif-detail-overlay" onClick={onClose}>
        <div className="notif-detail-panel" onClick={e => e.stopPropagation()}>
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            Loading ticket…
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="notif-detail-overlay" onClick={onClose}>
        <div className="notif-detail-panel" onClick={e => e.stopPropagation()}>
          <div style={{ padding: 40, textAlign: "center", color: "var(--status-red)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            Ticket not found or access denied.
          </div>
        </div>
      </div>
    );
  }

  const sc = STATUS_COLORS[ticket.status] || {};

  return (
    <div className="notif-detail-overlay" onClick={onClose}>
      <div className="notif-detail-panel" onClick={e => e.stopPropagation()}>
        <div className="notif-detail-header">
          <div className="notif-detail-title">🎫 Ticket #{ticket.id}</div>
          <button className="notif-detail-close" onClick={onClose}>✕</button>
        </div>
        <div className="notif-detail-body">
          {/* Status + Priority badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <span className="notif-detail-badge" style={{ background: sc.bg, color: sc.fg }}>
              {ticket.status?.replace("_", " ")}
            </span>
            {ticket.priority && (
              <span className="notif-detail-badge"
                style={{ background: (STATUS_COLORS[ticket.priority] || {}).bg, color: (STATUS_COLORS[ticket.priority] || {}).fg }}>
                {ticket.priority}
              </span>
            )}
          </div>

          <div className="notif-detail-field">
            <div className="notif-detail-label">Location</div>
            <div className="notif-detail-value" style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {ticket.resourceLocation}
            </div>
          </div>
          <div className="notif-detail-field">
            <div className="notif-detail-label">Description</div>
            <div className="notif-detail-value">{ticket.description}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div className="notif-detail-field" style={{ margin: 0 }}>
              <div className="notif-detail-label">Contact</div>
              <div className="notif-detail-value">{ticket.contactDetails}</div>
            </div>
            <div className="notif-detail-field" style={{ margin: 0 }}>
              <div className="notif-detail-label">Assigned To</div>
              <div className="notif-detail-value">{ticket.assignedTo || "Unassigned"}</div>
            </div>
          </div>
          {ticket.resolutionNotes && (
            <div className="notif-detail-field">
              <div className="notif-detail-label">Resolution Notes</div>
              <div className="notif-detail-value" style={{ color: "var(--status-green)" }}>
                {ticket.resolutionNotes}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div className="notif-detail-field" style={{ margin: 0 }}>
              <div className="notif-detail-label">Created</div>
              <div className="notif-detail-value">{fmtDate(ticket.createdAt)}</div>
            </div>
            <div className="notif-detail-field" style={{ margin: 0 }}>
              <div className="notif-detail-label">Updated</div>
              <div className="notif-detail-value">{fmtDate(ticket.updatedAt)}</div>
            </div>
          </div>

          {/* Comments */}
          <hr className="notif-detail-divider" />
          <div className="notif-detail-label" style={{ marginBottom: 12 }}>
            Comments ({ticket.comments?.length || 0})
          </div>
          {(!ticket.comments || ticket.comments.length === 0) ? (
            <div style={{ textAlign: "center", padding: "16px 0", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
              No comments yet.
            </div>
          ) : (
            ticket.comments.map(c => (
              <div key={c.id} className="notif-comment-item">
                <div className="notif-comment-meta">
                  <span className="notif-comment-author">{c.createdBy}</span>
                  <span className="notif-comment-time">{fmtDate(c.createdAt)}</span>
                </div>
                <div className="notif-comment-text">{c.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Booking Detail Overlay ───────────────────────────────────────────────── */
function BookingDetailOverlay({ bookingId, onClose }) {
  // Bookings don't have a getById API, so we show a simple summary
  return (
    <div className="notif-detail-overlay" onClick={onClose}>
      <div className="notif-detail-panel" onClick={e => e.stopPropagation()}>
        <div className="notif-detail-header">
          <div className="notif-detail-title">📅 Booking #{bookingId}</div>
          <button className="notif-detail-close" onClick={onClose}>✕</button>
        </div>
        <div className="notif-detail-body">
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>📅</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              Booking #{bookingId}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Check your bookings tab to see the full details and current status of this booking.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailTicketId, setDetailTicketId] = useState(null);
  const [detailBookingId, setDetailBookingId] = useState(null);
  const wrapRef = useRef(null);
  const pollRef = useRef(null);

  // ── Poll unread count every 5 seconds ──
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await notificationApi.unreadCount();
      setUnreadCount(res.data.count || 0);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchUnreadCount]);

  // ── Fetch all notifications when panel opens ──
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.fetchAll();
      setNotifications(res.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // ── Close on outside click ──
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ── Handle notification click ──
  const handleNotifClick = async (n) => {
    // Mark as read
    if (!n.read) {
      try {
        await notificationApi.markRead(n.id);
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch (_) {}
    }
    setOpen(false);

    // Open relevant detail
    if (n.referenceType === "TICKET") {
      setDetailTicketId(n.referenceId);
    } else if (n.referenceType === "BOOKING") {
      setDetailBookingId(n.referenceId);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (_) {}
  };

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: bellStyles }} />
      <div className="notif-bell-wrap" ref={wrapRef}>
        <button
          className={`notif-bell-btn${unreadCount > 0 ? " has-unread" : ""}`}
          onClick={() => setOpen(o => !o)}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </button>

        {open && (
          <div className="notif-panel">
            <div className="notif-panel-header">
              <div className="notif-panel-title">
                Notifications
                {unreadNotifs.length > 0 && (
                  <span className="notif-panel-count">{unreadNotifs.length} new</span>
                )}
              </div>
              {unreadNotifs.length > 0 && (
                <button className="notif-mark-all" onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="notif-panel-body">
              {loading ? (
                <div className="notif-empty">
                  <span className="notif-empty-icon">⏳</span>
                  Loading…
                </div>
              ) : notifications.length === 0 ? (
                <div className="notif-empty">
                  <span className="notif-empty-icon">🔔</span>
                  No notifications yet
                </div>
              ) : (
                notifications.map(n => {
                  const icon = ICON_MAP[n.type] || { emoji: "📌", cls: "ticket" };
                  return (
                    <div
                      key={n.id}
                      className={`notif-item${!n.read ? " unread" : ""}`}
                      onClick={() => handleNotifClick(n)}
                    >
                      <div className={`notif-icon-wrap ${icon.cls}`}>
                        {icon.emoji}
                      </div>
                      <div className="notif-content">
                        <div className="notif-title-text">{n.title}</div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">
                          {!n.read && <span className="notif-unread-dot" />}
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail overlays */}
      {detailTicketId && (
        <TicketDetailOverlay
          ticketId={detailTicketId}
          onClose={() => setDetailTicketId(null)}
        />
      )}
      {detailBookingId && (
        <BookingDetailOverlay
          bookingId={detailBookingId}
          onClose={() => setDetailBookingId(null)}
        />
      )}
    </>
  );
}
