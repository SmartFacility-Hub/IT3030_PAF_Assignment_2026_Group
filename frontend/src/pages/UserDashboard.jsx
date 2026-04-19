import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingApi, ticketApi } from "../services/api";
import facilityService from "../services/facilityService";

const styles = `
  .welcome-banner {
    background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%);
    border: 1px solid var(--border); border-left: 4px solid var(--status-teal);
    border-radius: var(--radius-lg); padding: 24px 28px;
    display: flex; align-items: center; gap: 20px;
    margin-bottom: 28px; position: relative; overflow: hidden;
  }
  .welcome-banner::before {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 180px; height: 180px; border-radius: 50%;
    background: var(--status-teal-bg); pointer-events: none;
  }
  .welcome-avatar {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--status-teal);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 20px; font-weight: 800;
    color: #fff; flex-shrink: 0; position: relative; z-index: 1; overflow: hidden;
  }
  .welcome-text { flex: 1; position: relative; z-index: 1; }
  .welcome-greeting { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
  .welcome-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
  .welcome-actions { display: flex; gap: 10px; flex-shrink: 0; position: relative; z-index: 1; }

  .role-tag {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-mono); font-size: 9px; font-weight: 600;
    padding: 3px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.08em;
    background: var(--status-teal-bg); color: var(--status-teal);
    border: 1px solid rgba(45,212,191,0.3); margin-bottom: 6px; width: fit-content;
  }

  .btn-ghost {
    padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { border-color: rgba(45,212,191,0.4); color: var(--text-primary); background: var(--status-teal-bg); }
  .btn-primary {
    padding: 8px 18px; border: none; border-radius: var(--radius-sm);
    background: var(--status-teal); color: #fff;
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .kpi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px 22px;
    cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
  }
  .kpi-card::before { content: ''; position: absolute; inset: 0; background: var(--status-teal-bg); opacity: 0; transition: opacity 0.3s; }
  .kpi-card:hover { border-color: rgba(45,212,191,0.35); transform: translateY(-2px); box-shadow: var(--shadow-card); }
  .kpi-card:hover::before { opacity: 1; }
  .kpi-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .kpi-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid var(--border); background: var(--bg-elevated); position: relative; z-index: 1; }
  .kpi-change { font-family: var(--font-mono); font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; position: relative; z-index: 1; }
  .kpi-change.up      { background: var(--status-green-bg); color: var(--status-green); }
  .kpi-change.down    { background: var(--status-red-bg);   color: var(--status-red); }
  .kpi-change.neutral { background: var(--bg-elevated);     color: var(--text-muted); }
  .kpi-value { font-family: var(--font-display); font-size: 32px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.035em; line-height: 1; position: relative; z-index: 1; }
  .kpi-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 6px; letter-spacing: 0.06em; text-transform: uppercase; position: relative; z-index: 1; }
  .kpi-sub   { font-size: 12px; color: var(--text-muted); margin-top: 4px; position: relative; z-index: 1; }

  .content-grid       { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; margin-bottom: 20px; }
  .content-grid-equal { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }

  .card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); }
  .card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
  .card-subtitle { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
  .card-action { font-family: var(--font-mono); font-size: 11px; color: var(--status-teal); cursor: pointer; transition: color 0.2s; display: flex; align-items: center; gap: 4px; border: none; background: none; padding: 0; }
  .card-action:hover { color: var(--accent); }

  .badge { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; font-weight: 500; padding: 3px 10px; border-radius: 100px; white-space: nowrap; }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .badge.PENDING   { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.pending   { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.APPROVED  { background: var(--status-green-bg); color: var(--status-green); }
  .badge.approved  { background: var(--status-green-bg); color: var(--status-green); }
  .badge.REJECTED  { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.rejected  { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.CANCELLED { background: var(--bg-elevated);     color: var(--text-muted); }
  .badge.cancelled { background: var(--bg-elevated);     color: var(--text-muted); }
  .badge.open      { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.OPEN      { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.progress  { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.IN_PROGRESS { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.resolved  { background: var(--status-green-bg); color: var(--status-green); }
  .badge.RESOLVED  { background: var(--status-green-bg); color: var(--status-green); }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th { font-family: var(--font-mono); font-size: 9.5px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; padding: 10px 16px; text-align: left; }
  th:first-child { padding-left: 22px; } th:last-child { padding-right: 22px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; cursor: pointer; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--bg-elevated); }
  td { padding: 12px 16px; color: var(--text-secondary); vertical-align: middle; }
  td:first-child { padding-left: 22px; color: var(--text-primary); font-weight: 500; }
  td:last-child  { padding-right: 22px; }

  .calendar-strip { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 0 22px 22px; }
  .cal-day { display: flex; flex-direction: column; align-items: center; padding: 10px 4px; border-radius: var(--radius-md); background: var(--bg-elevated); border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; gap: 4px; }
  .cal-day:hover { border-color: rgba(45,212,191,0.4); background: var(--status-teal-bg); }
  .cal-day.has-booking { border-color: rgba(45,212,191,0.5); background: var(--status-teal-bg); }
  .cal-day.today { border-color: var(--status-teal); }
  .cal-day-name { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; }
  .cal-day-num  { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-primary); line-height: 1; }
  .cal-day-dot  { width: 5px; height: 5px; border-radius: 50%; background: var(--status-teal); }

  .booking-list { display: flex; flex-direction: column; }
  .booking-item { display: flex; align-items: center; gap: 14px; padding: 13px 22px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
  .booking-item:last-child { border-bottom: none; }
  .booking-item:hover { background: var(--bg-elevated); }
  .booking-time-col { display: flex; flex-direction: column; align-items: center; min-width: 52px; gap: 1px; }
  .booking-time { font-family: var(--font-mono); font-size: 11px; font-weight: 500; color: var(--text-primary); }
  .booking-date { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); }
  .booking-bar  { width: 3px; align-self: stretch; border-radius: 4px; flex-shrink: 0; }
  .booking-body { flex: 1; min-width: 0; }
  .booking-title { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .booking-meta  { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .booking-status-col { flex-shrink: 0; }

  .room-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 22px 22px; }
  .room-card { padding: 14px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
  .room-card:hover { border-color: rgba(45,212,191,0.5); transform: translateY(-1px); }
  .room-card.unavailable { opacity: 0.5; cursor: not-allowed; }
  .room-card.unavailable:hover { transform: none; }
  .room-icon  { font-size: 20px; margin-bottom: 8px; }
  .room-name  { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .room-cap   { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .room-avail { margin-top: 8px; font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 100px; display: inline-block; }
  .room-avail.free { background: var(--status-green-bg); color: var(--status-green); }
  .room-avail.busy { background: var(--status-red-bg);   color: var(--status-red); }

  .notif-list { display: flex; flex-direction: column; }
  .notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 22px; border-bottom: 1px solid var(--border); transition: background 0.15s; cursor: pointer; }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: var(--bg-elevated); }
  .notif-item.unread { background: var(--status-teal-bg); }
  .notif-icon-wrap { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; }
  .notif-body { flex: 1; }
  .notif-text { font-size: 13px; color: var(--text-secondary); line-height: 1.4; }
  .notif-text strong { color: var(--text-primary); }
  .notif-time { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 3px; }
  .unread-pip { width: 7px; height: 7px; border-radius: 50%; background: var(--status-teal); flex-shrink: 0; margin-top: 6px; }

  .empty-state { padding: 24px; text-align: center; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in   { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }
  .fade-in-3 { animation: fadeInUp 0.5s 0.15s ease both; }
  .fade-in-4 { animation: fadeInUp 0.5s 0.20s ease both; }

  @media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2,1fr); } .content-grid { grid-template-columns: 1fr; } }
  @media (max-width: 768px)  { .kpi-grid { grid-template-columns: 1fr 1fr; } .content-grid-equal, .form-row { grid-template-columns: 1fr; } .calendar-strip { grid-template-columns: repeat(4,1fr); } .room-grid { grid-template-columns: 1fr; } }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtTime = iso => iso
  ? new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  : "—";

const fmtDate = iso => iso
  ? new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })
  : "—";

const STATUS_DOT_COLOR = {
  PENDING:   "#fbbf24",
  APPROVED:  "#4ade80",
  REJECTED:  "#f87171",
  CANCELLED: "#8892a4",
};

const TICKET_STATUS_LABEL = {
  OPEN: "Open", IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved", CLOSED: "Closed", REJECTED: "Rejected",
};

const FACILITY_TYPE_ICON = {
  LECTURE_HALL: "🏛️",
  LAB:          "🔬",
  MEETING_ROOM: "🎙️",
  EQUIPMENT:    "🖥️",
};

// ── Build 7-day calendar strip centered on today ──────────────────────────────
function buildCalStrip(bookings) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build set of date strings that have a booking
  const bookedDates = new Set(
    bookings
      .filter(b => b.status === "APPROVED" || b.status === "PENDING")
      .map(b => new Date(b.startAt).toDateString())
  );

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      name:       DAY_NAMES[d.getDay()],
      num:        d.getDate(),
      hasBooking: bookedDates.has(d.toDateString()),
      today:      i === 0,
    });
  }
  return days;
}

// ── Static notifications (no notification API yet) ────────────────────────────
const staticNotifications = [
  { icon: "💡", bg: "var(--status-teal-bg)",  title: "Welcome",    text: <><strong>SmartCampus</strong> — Book facilities and report incidents from your dashboard.</>, time: "Now",       unread: true  },
  { icon: "📅", bg: "var(--status-amber-bg)", title: "Reminder",   text: <>Your bookings are now live. Check <strong>My Bookings</strong> for status updates.</>,        time: "Today",     unread: false },
  { icon: "🔧", bg: "var(--status-blue-bg)",  title: "Tip",        text: <>Use <strong>My Incidents</strong> to track submitted maintenance requests.</>,                 time: "This week", unread: false },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  // ── State ──
  const [bookings,          setBookings]          = useState([]);
  const [bookingsLoading,   setBookingsLoading]   = useState(true);
  const [tickets,           setTickets]           = useState([]);
  const [ticketsLoading,    setTicketsLoading]    = useState(true);
  const [facilities,        setFacilities]        = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);

  // ── Fetch all data ──
  const fetchAll = useCallback(async () => {
    // Bookings
    setBookingsLoading(true);
    try {
      const res = await bookingApi.fetchMine();
      setBookings(res.data || []);
    } catch (_) {}
    finally { setBookingsLoading(false); }

    // Tickets
    setTicketsLoading(true);
    try {
      const res = await ticketApi.fetchAll();
      setTickets(res.data || []);
    } catch (_) {}
    finally { setTicketsLoading(false); }

    // Facilities
    setFacilitiesLoading(true);
    try {
      const res = await facilityService.getAll({ status: "ACTIVE" });
      setFacilities(res.data || []);
    } catch (_) {}
    finally { setFacilitiesLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived values ──
  const now = new Date();

  const upcomingBookings = bookings
    .filter(b => (b.status === "APPROVED" || b.status === "PENDING") && new Date(b.endAt) > now)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 4);

  const totalBookings  = bookings.length;
  const upcomingCount  = upcomingBookings.length;
  const openIncidents  = tickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const recentTickets  = tickets.slice(0, 3);
  const calDays        = buildCalStrip(bookings);

  // Hours booked = sum of duration of APPROVED bookings
  const hoursBooked = Math.round(
    bookings
      .filter(b => b.status === "APPROVED")
      .reduce((sum, b) => {
        const diff = (new Date(b.endAt) - new Date(b.startAt)) / 3600000;
        return sum + (diff > 0 ? diff : 0);
      }, 0)
  );

  // Cancel booking inline
  const handleCancel = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await bookingApi.cancel(id);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel.");
    }
  };

  // User info
  const getInitials = name =>
    name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const firstName   = user?.name?.split(" ")[0] || "there";
  const roles       = user?.roles || [];
  const isLecturer  = roles.includes("ROLE_LECTURER");
  const roleLabel   = isLecturer ? "Faculty" : "Student";
  const greeting    = isLecturer
    ? `Good morning, ${firstName}! 🎓`
    : `Good morning, ${firstName}! 👋`;
  const subText     = `You have ${upcomingCount} upcoming booking${upcomingCount !== 1 ? "s" : ""} and ${openIncidents} open incident${openIncidents !== 1 ? "s" : ""}.`;

  return (
    <div style={{ padding: "32px", minHeight: "calc(100vh - 60px)" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* ── Welcome Banner ── */}
      <div className="welcome-banner fade-in">
        <div className="welcome-avatar">
          {user?.picture
            ? <img src={user.picture} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            : getInitials(user?.name)}
        </div>
        <div className="welcome-text">
          <div className="role-tag">● {roleLabel}</div>
          <div className="welcome-greeting">{greeting}</div>
          <div className="welcome-sub">{subText}</div>
        </div>
        <div className="welcome-actions">
          <button className="btn-ghost" onClick={() => navigate("/dashboard/incidents")}>
            🔧 My Incidents
          </button>
          <button className="btn-primary" onClick={() => navigate("/dashboard/bookings")}>
            ＋ Book a Room
          </button>
        </div>
      </div>

      {/* ── KPI Row — all live ── */}
      <div className="kpi-grid">
        {[
          {
            icon: "📅", label: "Total Bookings",
            value: bookingsLoading ? "…" : totalBookings,
            change: "This semester", up: null, sub: "All reservations",
            onClick: () => navigate("/dashboard/bookings"),
          },
          {
            icon: "⏰", label: "Upcoming",
            value: bookingsLoading ? "…" : upcomingCount,
            change: "Next 7 days", up: null, sub: "Confirmed + pending",
            onClick: () => navigate("/dashboard/bookings"),
          },
          {
            icon: "🔧", label: "Open Incidents",
            value: ticketsLoading ? "…" : openIncidents,
            change: openIncidents > 0 ? `${openIncidents} active` : "All clear",
            up: openIncidents > 0 ? false : null,
            sub: "Submitted reports",
            onClick: () => navigate("/dashboard/incidents"),
          },
          {
            icon: "🏛️", label: "Hours Booked",
            value: bookingsLoading ? "…" : hoursBooked,
            change: "Approved slots", up: true, sub: "Facility hours used",
            onClick: () => navigate("/dashboard/bookings"),
          },
        ].map((k, i) => (
          <div className={`kpi-card fade-in-${i + 1}`} key={k.label} onClick={k.onClick}>
            <div className="kpi-card-top">
              <div className="kpi-icon">{k.icon}</div>
              <div className={`kpi-change ${k.up === null ? "neutral" : k.up ? "up" : "down"}`}>
                {k.change}
              </div>
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Row 1: Upcoming Bookings + Notifications ── */}
      <div className="content-grid fade-in-2">

        {/* Upcoming Bookings with real calendar */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span>📅</span> Upcoming Bookings</div>
              <div className="card-subtitle">Your confirmed & pending reservations</div>
            </div>
            <button className="card-action" onClick={() => navigate("/dashboard/bookings")}>
              All bookings →
            </button>
          </div>

          {/* Calendar strip — marks days that have bookings */}
          <div style={{ padding: "16px 22px 12px" }}>
            <div className="calendar-strip">
              {calDays.map(d => (
                <div key={d.num}
                  className={`cal-day${d.hasBooking ? " has-booking" : ""}${d.today ? " today" : ""}`}>
                  <div className="cal-day-name">{d.name}</div>
                  <div className="cal-day-num">{d.num}</div>
                  {d.hasBooking && <div className="cal-day-dot" />}
                </div>
              ))}
            </div>
          </div>

          {/* Booking list */}
          {bookingsLoading ? (
            <div className="empty-state">Loading bookings…</div>
          ) : upcomingBookings.length === 0 ? (
            <div className="empty-state">No upcoming bookings. <span style={{ color:"var(--status-teal)", cursor:"pointer" }} onClick={() => navigate("/dashboard/bookings")}>Book a room →</span></div>
          ) : (
            <div className="booking-list">
              {upcomingBookings.map(b => {
                const color = b.status === "APPROVED" ? "#4ade80" : "#fbbf24";
                return (
                  <div className="booking-item" key={b.id}
                    onClick={() => navigate("/dashboard/bookings")}>
                    <div className="booking-time-col">
                      <div className="booking-time">{fmtTime(b.startAt)}</div>
                      <div className="booking-date">{fmtDate(b.startAt)}</div>
                    </div>
                    <div className="booking-bar" style={{ background: color }} />
                    <div className="booking-body">
                      <div className="booking-title">
                        {b.facilityName} {b.purpose ? `— ${b.purpose}` : ""}
                      </div>
                      <div className="booking-meta">
                        {b.facilityType?.replace("_", " ")} · {b.location}
                        {b.expectedAttendees ? ` · ${b.expectedAttendees} attendees` : ""}
                      </div>
                    </div>
                    <div className="booking-status-col">
                      <span className={`badge ${b.status}`}>
                        <span className="badge-dot" style={{ background: color }} />
                        {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications — static for now */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span>🔔</span> Notifications</div>
              <div className="card-subtitle">Platform updates</div>
            </div>
          </div>
          <div className="notif-list">
            {staticNotifications.map((n, i) => (
              <div className={`notif-item${n.unread ? " unread" : ""}`} key={i}>
                <div className="notif-icon-wrap" style={{ background: n.bg }}>{n.icon}</div>
                <div className="notif-body">
                  <div className="notif-text">{n.text}</div>
                  <div className="notif-time">{n.time}</div>
                </div>
                {n.unread && <div className="unread-pip" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Available Rooms + My Incidents ── */}
      <div className="content-grid fade-in-3">

        {/* Available rooms — live from API */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span>🏛️</span> Available Right Now</div>
              <div className="card-subtitle">
                {facilitiesLoading ? "Loading…" : `${facilities.length} active facilities`}
              </div>
            </div>
            <button className="card-action" onClick={() => navigate("/dashboard/bookings")}>
              Book one →
            </button>
          </div>
          {facilitiesLoading ? (
            <div className="empty-state">Loading facilities…</div>
          ) : facilities.length === 0 ? (
            <div className="empty-state">No active facilities found.</div>
          ) : (
            <div className="room-grid">
              {facilities.slice(0, 6).map(f => (
                <div className="room-card" key={f.id}
                  onClick={() => navigate("/dashboard/bookings")}>
                  <div className="room-icon">
                    {FACILITY_TYPE_ICON[f.type] || "🏢"}
                  </div>
                  <div className="room-name">{f.name}</div>
                  <div className="room-cap">
                    {f.type === "EQUIPMENT"
                      ? f.type.replace("_", " ")
                      : f.capacity ? `👥 ${f.capacity} seats` : f.location}
                  </div>
                  <div className="room-avail free">Available</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Incidents — live from API */}
        <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title"><span>🔧</span> My Incident Reports</div>
                <div className="card-subtitle">
                  {ticketsLoading ? "Loading…" : `${tickets.length} submitted ticket${tickets.length !== 1 ? "s" : ""}`}
                </div>
              </div>
              <button className="card-action" onClick={() => navigate("/dashboard/incidents")}>
                View all →
              </button>
            </div>
            {ticketsLoading ? (
              <div className="empty-state">Loading…</div>
            ) : tickets.length === 0 ? (
              <div className="empty-state">
                No tickets yet. <span style={{ color:"var(--status-teal)", cursor:"pointer" }}
                  onClick={() => navigate("/dashboard/incidents")}>Report an issue →</span>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Location</th><th>Status</th></tr></thead>
                  <tbody>
                    {recentTickets.map(t => (
                      <tr key={t.id} onClick={() => navigate("/dashboard/incidents")}>
                        <td style={{ fontFamily:"var(--font-mono)", fontSize:11 }}>#{t.id}</td>
                        <td style={{ fontSize:12 }}>{t.resourceLocation}</td>
                        <td>
                          <span className={`badge ${t.status}`}>
                            {TICKET_STATUS_LABEL[t.status] || t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick actions card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><span>⚡</span> Quick Actions</div>
            </div>
            <div style={{ padding:"16px 22px", display:"flex", flexDirection:"column", gap:10 }}>
              <button className="btn-primary" onClick={() => navigate("/dashboard/bookings")}>
                📅 New Booking
              </button>
              <button className="btn-ghost" onClick={() => navigate("/dashboard/incidents")}>
                🔧 Report an Issue
              </button>
              <button className="btn-ghost" onClick={() => navigate("/dashboard/bookings")}>
                🗂️ View All Bookings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Booking History — live ── */}
      <div className="card fade-in-4" style={{ marginBottom:"40px" }}>
        <div className="card-header">
          <div>
            <div className="card-title"><span>🗂️</span> Booking History</div>
            <div className="card-subtitle">
              {bookingsLoading ? "Loading…" : `${bookings.length} total booking${bookings.length !== 1 ? "s" : ""}`}
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-ghost" onClick={fetchAll}>↻ Refresh</button>
            <button className="btn-primary" onClick={() => navigate("/dashboard/bookings")}>
              ＋ New Booking
            </button>
          </div>
        </div>

        {bookingsLoading ? (
          <div className="empty-state">Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">No bookings yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Facility</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 8).map(b => (
                  <tr key={b.id} onClick={() => navigate("/dashboard/bookings")}>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>#{b.id}</td>
                    <td>
                      <div style={{ fontWeight:600 }}>{b.facilityName}</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)" }}>
                        {b.facilityType?.replace("_"," ")} · {b.location}
                      </div>
                    </td>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-muted)" }}>
                      {fmtDate(b.startAt)} {fmtTime(b.startAt)}
                    </td>
                    <td style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--text-muted)" }}>
                      {fmtTime(b.endAt)}
                    </td>
                    <td style={{ color:"var(--text-muted)", fontSize:12, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {b.purpose || "—"}
                    </td>
                    <td>
                      <span className={`badge ${b.status}`}>
                        <span className="badge-dot" style={{ background: STATUS_DOT_COLOR[b.status] }} />
                        {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {(b.status === "PENDING" || b.status === "APPROVED") ? (
                        <button
                          style={{
                            padding:"4px 10px", fontSize:11, cursor:"pointer",
                            borderRadius:"var(--radius-sm)", border:"1px solid rgba(248,113,113,0.3)",
                            background:"var(--status-red-bg)", color:"var(--status-red)",
                            fontFamily:"var(--font-mono)",
                          }}
                          onClick={e => handleCancel(b.id, e)}>
                          Cancel
                        </button>
                      ) : (
                        <button className="card-action" style={{ fontSize:11 }}
                          onClick={() => navigate("/dashboard/bookings")}>
                          View →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length > 8 && (
              <div style={{ padding:"12px 22px", textAlign:"center" }}>
                <button className="card-action" onClick={() => navigate("/dashboard/bookings")}>
                  View all {bookings.length} bookings →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}