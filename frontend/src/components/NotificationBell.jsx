import { useState, useEffect, useCallback, useRef } from "react";
import { notificationApi } from "../services/api";

const TYPE_ICON = {
  BOOKING_CREATED:  "📅",
  BOOKING_APPROVED: "✅",
  BOOKING_REJECTED: "❌",
  TICKET_CREATED:   "🔧",
  TICKET_UPDATED:   "🔄",
};

const TYPE_BG = {
  BOOKING_CREATED:  "rgba(245,166,35,0.15)",
  BOOKING_APPROVED: "rgba(74,222,128,0.15)",
  BOOKING_REJECTED: "rgba(248,113,113,0.15)",
  TICKET_CREATED:   "rgba(96,165,250,0.15)",
  TICKET_UPDATED:   "rgba(167,139,250,0.15)",
};

const styles = `
  .nb-wrapper { position: relative; }

  .nb-btn {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: var(--text-secondary); transition: all 0.2s; position: relative;
  }
  .nb-btn:hover { border-color: var(--accent-border); color: var(--accent); background: var(--accent-glow); }

  .nb-badge {
    position: absolute; top: -4px; right: -4px;
    min-width: 16px; height: 16px; border-radius: 100px;
    background: var(--status-red); color: #fff;
    font-family: var(--font-mono); font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px; border: 2px solid var(--bg-overlay, #0a0f1e);
    animation: nbPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
    pointer-events: none;
  }
  @keyframes nbPop { from { transform: scale(0); } to { transform: scale(1); } }

  .nb-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0; z-index: 200;
    width: 360px; max-width: 90vw;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: 0 8px 40px rgba(0,0,0,0.3);
    overflow: hidden;
    animation: nbSlide 0.2s ease;
  }
  @keyframes nbSlide { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

  .nb-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; border-bottom: 1px solid var(--border);
  }
  .nb-header-title {
    font-family: var(--font-display); font-size: 14px; font-weight: 700;
    color: var(--text-primary); display: flex; align-items: center; gap: 8px;
  }
  .nb-mark-read {
    font-family: var(--font-mono); font-size: 10px; color: var(--accent);
    background: none; border: none; cursor: pointer; padding: 0; transition: color 0.2s;
  }
  .nb-mark-read:hover { color: var(--accent-hover); }

  .nb-list { max-height: 380px; overflow-y: auto; }
  .nb-list::-webkit-scrollbar { width: 4px; }
  .nb-list::-webkit-scrollbar-thumb { background: var(--bg-elevated); border-radius: 100px; }

  .nb-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 18px; border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background 0.15s;
  }
  .nb-item:last-child { border-bottom: none; }
  .nb-item:hover { background: var(--bg-elevated); }
  .nb-item.unread { background: var(--accent-glow); }
  .nb-item.unread:hover { filter: brightness(0.96); }

  .nb-icon {
    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 15px;
  }
  .nb-body { flex: 1; min-width: 0; }
  .nb-item-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
  .nb-item-msg   { font-size: 12px; color: var(--text-secondary); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .nb-item-time  { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 4px; }
  .nb-unread-pip { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-top: 6px; }

  .nb-empty { padding: 32px; text-align: center; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
  .nb-footer { padding: 10px 18px; border-top: 1px solid var(--border); text-align: center; }
  .nb-footer-btn { font-family: var(--font-mono); font-size: 11px; color: var(--accent); background: none; border: none; cursor: pointer; }
  .nb-footer-btn:hover { color: var(--accent-hover); }
  .nb-loading { padding: 20px; text-align: center; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
`;

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationBell() {
  const [open,         setOpen]         = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [loading,      setLoading]      = useState(false);
  const dropdownRef = useRef(null);
  const pollRef     = useRef(null);

  // ── Fetch unread count (lightweight poll) ──
  const fetchCount = useCallback(async () => {
    try {
      const res = await notificationApi.unreadCount();
      setUnreadCount(res.data?.count || 0);
    } catch (_) {}
  }, []);

  // ── Fetch full list (when dropdown opens) ──
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.fetchAll();
      setNotifications(res.data || []);
      setUnreadCount((res.data || []).filter(n => !n.read).length);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  // ── Poll unread count every 30s ──
  useEffect(() => {
    fetchCount();
    pollRef.current = setInterval(fetchCount, 30000);
    return () => clearInterval(pollRef.current);
  }, [fetchCount]);

  // ── Fetch list when dropdown opens ──
  useEffect(() => {
    if (open) fetchAll();
  }, [open, fetchAll]);

  // ── Close on outside click ──
  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(n => n.map(x => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch (_) {}
  };

  const handleClickItem = async (notif) => {
    if (!notif.read) {
      try {
        await notificationApi.markRead(notif.id);
        setNotifications(n => n.map(x => x.id === notif.id ? { ...x, read: true } : x));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch (_) {}
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="nb-wrapper" ref={dropdownRef}>

        {/* Bell button */}
        <button className="nb-btn" onClick={() => setOpen(o => !o)} title="Notifications">
          🔔
          {unreadCount > 0 && (
            <span className="nb-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="nb-dropdown">
            <div className="nb-header">
              <div className="nb-header-title">
                🔔 Notifications
                {unreadCount > 0 && (
                  <span style={{
                    background:"var(--status-red-bg)", color:"var(--status-red)",
                    fontFamily:"var(--font-mono)", fontSize:10,
                    padding:"2px 8px", borderRadius:"100px",
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button className="nb-mark-read" onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              )}
            </div>

            <div className="nb-list">
              {loading ? (
                <div className="nb-loading">Loading…</div>
              ) : notifications.length === 0 ? (
                <div className="nb-empty">No notifications yet.</div>
              ) : (
                notifications.slice(0, 20).map(n => (
                  <div
                    key={n.id}
                    className={`nb-item${n.read ? "" : " unread"}`}
                    onClick={() => handleClickItem(n)}
                  >
                    <div className="nb-icon"
                      style={{ background: TYPE_BG[n.type] || "var(--bg-elevated)" }}>
                      {TYPE_ICON[n.type] || "🔔"}
                    </div>
                    <div className="nb-body">
                      <div className="nb-item-title">{n.title}</div>
                      <div className="nb-item-msg">{n.message}</div>
                      <div className="nb-item-time">{timeAgo(n.createdAt)}</div>
                    </div>
                    {!n.read && <div className="nb-unread-pip" />}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 20 && (
              <div className="nb-footer">
                <button className="nb-footer-btn" onClick={fetchAll}>
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}