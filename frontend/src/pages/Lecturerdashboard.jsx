import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const styles = `
  .welcome-banner {
    background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%);
    border: 1px solid var(--border); border-left: 4px solid var(--status-violet);
    border-radius: var(--radius-lg); padding: 24px 28px;
    display: flex; align-items: center; gap: 20px;
    margin-bottom: 28px; position: relative; overflow: hidden;
  }
  .welcome-banner::before {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 180px; height: 180px; border-radius: 50%;
    background: var(--status-violet-bg); pointer-events: none;
  }
  .welcome-avatar {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--status-violet);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 20px; font-weight: 800;
    color: #fff; flex-shrink: 0; position: relative; z-index: 1; overflow: hidden;
  }
  .welcome-text { flex: 1; position: relative; z-index: 1; }
  .welcome-greeting { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
  .welcome-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
  .welcome-actions { display: flex; gap: 10px; flex-shrink: 0; position: relative; z-index: 1; }

  .btn-ghost {
    padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { border-color: rgba(167,139,250,0.4); color: var(--text-primary); background: var(--status-violet-bg); }
  .btn-primary {
    padding: 8px 18px; border: none; border-radius: var(--radius-sm);
    background: var(--status-violet); color: #fff;
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
  .btn-accent {
    padding: 8px 18px; border: none; border-radius: var(--radius-sm);
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-accent:hover { background: var(--accent-hover); transform: translateY(-1px); }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .kpi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px 22px;
    cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
  }
  .kpi-card::before { content: ''; position: absolute; inset: 0; background: var(--status-violet-bg); opacity: 0; transition: opacity 0.3s; }
  .kpi-card:hover { border-color: rgba(167,139,250,0.35); transform: translateY(-2px); box-shadow: var(--shadow-card); }
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
  .card-action { font-family: var(--font-mono); font-size: 11px; color: var(--status-violet); cursor: pointer; transition: color 0.2s; display: flex; align-items: center; gap: 4px; border: none; background: none; padding: 0; }
  .card-action:hover { color: var(--accent); }

  .badge { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 10px; font-weight: 500; padding: 3px 10px; border-radius: 100px; white-space: nowrap; }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .badge.pending   { background: var(--status-amber-bg);  color: var(--status-amber); }
  .badge.approved  { background: var(--status-green-bg);  color: var(--status-green); }
  .badge.rejected  { background: var(--status-red-bg);    color: var(--status-red); }
  .badge.cancelled { background: var(--bg-elevated);      color: var(--text-muted); }
  .badge.open      { background: var(--status-red-bg);    color: var(--status-red); }
  .badge.progress  { background: var(--status-amber-bg);  color: var(--status-amber); }
  .badge.resolved  { background: var(--status-green-bg);  color: var(--status-green); }
  .badge.lecture   { background: var(--status-violet-bg); color: var(--status-violet); }
  .badge.exam      { background: var(--status-red-bg);    color: var(--status-red); }
  .badge.lab       { background: var(--status-blue-bg);   color: var(--status-blue); }

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

  .timeline { display: flex; flex-direction: column; padding: 0 22px 22px; }
  .timeline-day { margin-bottom: 18px; }
  .timeline-day-label { font-family: var(--font-mono); font-size: 10px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .timeline-day-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .timeline-events { display: flex; flex-direction: column; gap: 6px; }
  .timeline-event { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-md); border-left: 3px solid; cursor: pointer; transition: all 0.15s; }
  .timeline-event:hover { filter: brightness(0.95); transform: translateX(2px); }
  .event-time  { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); min-width: 52px; }
  .event-body  { flex: 1; min-width: 0; }
  .event-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .event-meta  { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .event-badge { flex-shrink: 0; }

  .resource-search { display: flex; gap: 8px; padding: 0 22px 16px; flex-wrap: wrap; }
  .filter-chip { padding: 6px 14px; border-radius: 100px; border: 1px solid var(--border); background: var(--bg-elevated); font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
  .filter-chip:hover, .filter-chip.active { border-color: rgba(167,139,250,0.5); color: var(--status-violet); background: var(--status-violet-bg); }
  .resource-list { display: flex; flex-direction: column; }
  .resource-item { display: flex; align-items: center; gap: 14px; padding: 13px 22px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
  .resource-item:last-child { border-bottom: none; }
  .resource-item:hover { background: var(--bg-elevated); }
  .resource-icon { width: 38px; height: 38px; border-radius: var(--radius-sm); background: var(--bg-elevated); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .resource-body { flex: 1; min-width: 0; }
  .resource-name    { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .resource-details { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .resource-status  { flex-shrink: 0; display: flex; align-items: center; gap: 8px; }
  .avail-pill { font-family: var(--font-mono); font-size: 10px; padding: 3px 10px; border-radius: 100px; }
  .avail-pill.free { background: var(--status-green-bg); color: var(--status-green); }
  .avail-pill.busy { background: var(--status-red-bg);   color: var(--status-red); }
  .book-btn { padding: 5px 12px; border-radius: var(--radius-sm); background: var(--status-violet-bg); color: var(--status-violet); border: 1px solid rgba(167,139,250,0.3); font-family: var(--font-mono); font-size: 11px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .book-btn:hover { background: var(--status-violet); color: #fff; }
  .book-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .notif-list { display: flex; flex-direction: column; }
  .notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 22px; border-bottom: 1px solid var(--border); transition: background 0.15s; cursor: pointer; }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: var(--bg-elevated); }
  .notif-item.unread { background: var(--status-violet-bg); }
  .notif-icon-wrap { width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; }
  .notif-body { flex: 1; }
  .notif-text { font-size: 13px; color: var(--text-secondary); line-height: 1.4; }
  .notif-text strong { color: var(--text-primary); }
  .notif-time { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 3px; }
  .unread-pip { width: 7px; height: 7px; border-radius: 50%; background: var(--status-violet); flex-shrink: 0; margin-top: 6px; }

  .mini-bar-row { display: flex; align-items: center; gap: 10px; padding: 8px 22px; border-bottom: 1px solid var(--border); }
  .mini-bar-row:last-child { border-bottom: none; }
  .mini-bar-label { font-size: 12px; color: var(--text-secondary); min-width: 120px; }
  .mini-bar-track { flex: 1; height: 6px; background: var(--bg-elevated); border-radius: 100px; overflow: hidden; }
  .mini-bar-fill  { height: 100%; border-radius: 100px; transition: width 1s cubic-bezier(0.34,1.56,0.64,1); }
  .mini-bar-val   { font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); font-weight: 500; min-width: 32px; text-align: right; }

  .report-form { display: flex; flex-direction: column; gap: 12px; padding: 0 22px 22px; }
  .form-field  { display: flex; flex-direction: column; gap: 5px; }
  .form-label  { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .form-input, .form-select, .form-textarea {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 9px 12px;
    font-family: var(--font-body); font-size: 13px; color: var(--text-primary);
    transition: border-color 0.2s; width: 100%; outline: none;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: rgba(167,139,250,0.5); }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-select option { background: var(--bg-surface); }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in   { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }
  .fade-in-3 { animation: fadeInUp 0.5s 0.15s ease both; }
  .fade-in-4 { animation: fadeInUp 0.5s 0.20s ease both; }

  @media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2,1fr); } .content-grid { grid-template-columns: 1fr; } }
  @media (max-width: 768px)  { .kpi-grid { grid-template-columns: 1fr 1fr; } .content-grid-equal, .form-row { grid-template-columns: 1fr; } }
`;

const schedule = [
  {
    dayLabel: "Today — Tuesday, 8 Apr",
    events: [
      { time: "08:00–10:00", title: "IT3040 — Software Architecture Lecture", meta: "Lecture Hall B · 80 students", type: "lecture", color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
      { time: "11:00–13:00", title: "IT3030 — PAF Lab Session",              meta: "Computer Lab 2 · 40 students", type: "lab",     color: "#60a5fa", bg: "rgba(96,165,250,0.08)"  },
      { time: "14:00–15:00", title: "IT3020 — Database Systems Tutorial",    meta: "Seminar Room A · 25 students", type: "lecture", color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
    ],
  },
  {
    dayLabel: "Tomorrow — Wednesday, 9 Apr",
    events: [
      { time: "09:00–11:00", title: "IT3040 — Software Architecture Lab", meta: "Computer Lab 1 · 35 students", type: "lab",  color: "#60a5fa", bg: "rgba(96,165,250,0.08)"  },
      { time: "14:00–15:30", title: "IT3030 — PAF Mid-Semester Exam",     meta: "Exam Hall 1 · 120 students",   type: "exam", color: "#f87171", bg: "rgba(248,113,113,0.08)" },
    ],
  },
];

const resources = [
  { icon: "🏛️", name: "Lecture Hall A",  details: "Capacity 120 · Projector · AC · Block A", avail: true  },
  { icon: "🏛️", name: "Lecture Hall B",  details: "Capacity 80 · Projector · AC · Block B",  avail: false },
  { icon: "💻",  name: "Computer Lab 1",  details: "Capacity 40 · 40 PCs · AC · Block C",     avail: true  },
  { icon: "💻",  name: "Computer Lab 2",  details: "Capacity 40 · 40 PCs · AC · Block C",     avail: false },
  { icon: "🎙️", name: "Seminar Room A",  details: "Capacity 25 · Projector · Block A",        avail: true  },
  { icon: "🔬",  name: "Bio Lab 2",       details: "Capacity 24 · Equipment · Block D",        avail: true  },
];

const myBookings = [
  { id: "BK-1041", resource: "Lecture Hall B", date: "8 Apr",  time: "08:00–10:00", module: "IT3040", status: "approved" },
  { id: "BK-1042", resource: "Computer Lab 2", date: "8 Apr",  time: "11:00–13:00", module: "IT3030", status: "approved" },
  { id: "BK-1043", resource: "Seminar Room A", date: "8 Apr",  time: "14:00–15:00", module: "IT3020", status: "approved" },
  { id: "BK-1046", resource: "Lecture Hall A", date: "15 Apr", time: "09:00–11:00", module: "IT3040", status: "pending"  },
  { id: "BK-1047", resource: "Exam Hall 1",    date: "9 Apr",  time: "14:00–15:30", module: "IT3030", status: "approved" },
  { id: "BK-1038", resource: "Lecture Hall C", date: "5 Apr",  time: "08:00–10:00", module: "IT3020", status: "rejected" },
];

const myIncidents = [
  { id: "INC-088", title: "Projector flickering — Lecture Hall B", priority: "High",   status: "progress" },
  { id: "INC-082", title: "AC not cooling — Computer Lab 2",       priority: "Medium", status: "resolved" },
  { id: "INC-074", title: "Chair damage — Seminar Room A",         priority: "Low",    status: "resolved" },
];

const notifications = [
  { icon: "✅", bg: "var(--status-green-bg)",  text: <><strong>Booking Approved</strong> — Lecture Hall B on Tue 8 Apr confirmed</>,                    time: "10 min ago", unread: true  },
  { icon: "⏰", bg: "var(--status-violet-bg)", text: <><strong>Class Reminder</strong> — IT3030 PAF Lab starts in <strong>45 minutes</strong> (Lab 2)</>, time: "45 min ago", unread: true  },
  { icon: "🔧", bg: "var(--status-amber-bg)",  text: <><strong>Ticket Update</strong> — Technician assigned to ticket <strong>#INC-088</strong></>,       time: "2 hr ago",   unread: false },
  { icon: "❌", bg: "var(--status-red-bg)",    text: <><strong>Booking Rejected</strong> — Lecture Hall C on 5 Apr rejected: already booked</>,           time: "Yesterday",  unread: false },
];

const moduleLoad = [
  { name: "IT3040 — Soft. Arch.", hours: 42, color: "#a78bfa" },
  { name: "IT3030 — PAF",        hours: 36, color: "#60a5fa" },
  { name: "IT3020 — Databases",  hours: 28, color: "#34d399" },
];
const maxHours = Math.max(...moduleLoad.map(m => m.hours));

function useCounter(targets, duration = 1400) {
  const [vals, setVals] = useState(() => Object.fromEntries(Object.keys(targets).map(k => [k, 0])));
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVals(Object.fromEntries(Object.entries(targets).map(([k, v]) => [k, Math.round(v * ease)])));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);
  return vals;
}

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [reportForm, setReportForm] = useState({ title: "", location: "", module: "", priority: "Medium", desc: "" });
  const kpi = useCounter({ sessions: 18, students: 320, bookings: 24, incidents: 3 });

  const getInitials = (name) =>
    name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  const firstName = user?.name?.split(" ")[0] || "Lecturer";

  const filters = ["All", "Lecture Halls", "Computer Labs", "Seminar Rooms", "Labs"];
  const filteredResources = activeFilter === "All" ? resources : resources.filter(r => {
    if (activeFilter === "Lecture Halls") return r.name.includes("Lecture");
    if (activeFilter === "Computer Labs") return r.name.includes("Computer");
    if (activeFilter === "Seminar Rooms") return r.name.includes("Seminar");
    if (activeFilter === "Labs")          return r.name.includes("Lab");
    return true;
  });

  return (
    <div style={{ padding: "32px", minHeight: "calc(100vh - 60px)" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Welcome Banner */}
      <div className="welcome-banner fade-in">
        <div className="welcome-avatar">
          {user?.picture
            ? <img src={user.picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : getInitials(user?.name)}
        </div>
        <div className="welcome-text">
          <div className="welcome-greeting">Good morning, {firstName}! 🎓</div>
          <div className="welcome-sub">You have <strong>3 sessions today</strong> across 2 modules. Your next class starts at <strong>08:00 — Lecture Hall B</strong>.</div>
        </div>
        <div className="welcome-actions">
          <button className="btn-ghost">📅 Full Schedule</button>
          <button className="btn-primary">🏛️ Book a Room</button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        {[
          { icon: "📖", label: "Sessions This Sem", value: kpi.sessions,  change: "3 today",       up: null,  sub: "Teaching sessions" },
          { icon: "🧑‍🎓", label: "Students Taught",  value: kpi.students,  change: "+8 this week",  up: true,  sub: "Across all modules" },
          { icon: "📅", label: "Room Bookings",     value: kpi.bookings,  change: "This semester", up: null,  sub: "All booked facilities" },
          { icon: "🔧", label: "Open Incidents",    value: kpi.incidents, change: "1 open",        up: false, sub: "Submitted fault reports" },
        ].map((k, i) => (
          <div className={`kpi-card fade-in-${i + 1}`} key={k.label}>
            <div className="kpi-card-top">
              <div className="kpi-icon">{k.icon}</div>
              <div className={`kpi-change ${k.up === null ? "neutral" : k.up ? "up" : "down"}`}>{k.change}</div>
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Schedule + Notifications */}
      <div className="content-grid fade-in-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span>🗓️</span> Teaching Schedule</div>
              <div className="card-subtitle">Today & tomorrow's sessions</div>
            </div>
            <button className="card-action">Full schedule →</button>
          </div>
          <div className="timeline">
            {schedule.map(day => (
              <div className="timeline-day" key={day.dayLabel}>
                <div className="timeline-day-label">{day.dayLabel}</div>
                <div className="timeline-events">
                  {day.events.map((ev, i) => (
                    <div key={i} className="timeline-event" style={{ borderLeftColor: ev.color, background: ev.bg }}>
                      <div className="event-time">{ev.time}</div>
                      <div className="event-body">
                        <div className="event-title">{ev.title}</div>
                        <div className="event-meta">{ev.meta}</div>
                      </div>
                      <div className="event-badge">
                        <span className={`badge ${ev.type}`}>{ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title"><span>🔔</span> Notifications</div>
                <div className="card-subtitle">2 unread</div>
              </div>
              <button className="card-action">Mark all read</button>
            </div>
            <div className="notif-list">
              {notifications.map((n, i) => (
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

          <div className="card">
            <div className="card-header">
              <div className="card-title"><span>📈</span> Teaching Load</div>
            </div>
            {moduleLoad.map(m => (
              <div className="mini-bar-row" key={m.name}>
                <div className="mini-bar-label">{m.name}</div>
                <div className="mini-bar-track">
                  <div className="mini-bar-fill" style={{ width: `${(m.hours / maxHours) * 100}%`, background: m.color }} />
                </div>
                <div className="mini-bar-val">{m.hours}h</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Browse Resources */}
      <div className="card fade-in-3" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div>
            <div className="card-title"><span>🏛️</span> Browse & Book Resources</div>
            <div className="card-subtitle">Available facilities for your sessions</div>
          </div>
          <button className="btn-accent">＋ Quick Book</button>
        </div>
        <div className="resource-search">
          {filters.map(f => (
            <div key={f} className={`filter-chip${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>
              {f}
            </div>
          ))}
        </div>
        <div className="resource-list">
          {filteredResources.map(r => (
            <div className="resource-item" key={r.name}>
              <div className="resource-icon">{r.icon}</div>
              <div className="resource-body">
                <div className="resource-name">{r.name}</div>
                <div className="resource-details">{r.details}</div>
              </div>
              <div className="resource-status">
                <span className={`avail-pill ${r.avail ? "free" : "busy"}`}>{r.avail ? "Available" : "Occupied"}</span>
                <button className="book-btn" disabled={!r.avail}>{r.avail ? "Book →" : "Occupied"}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Bookings + Incidents */}
      <div className="content-grid-equal fade-in-4">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span>📋</span> My Bookings</div>
              <div className="card-subtitle">Recent room reservations</div>
            </div>
            <button className="card-action">View all →</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Resource</th><th>Date / Time</th><th>Module</th><th>Status</th></tr></thead>
              <tbody>
                {myBookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{b.id}</td>
                    <td style={{ fontSize: 12 }}>{b.resource}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>{b.date}<br />{b.time}</td>
                    <td><span className="badge lecture">{b.module}</span></td>
                    <td>
                      <span className={`badge ${b.status}`}>
                        <span className="badge-dot" style={{ background: b.status === "approved" ? "var(--status-green)" : b.status === "pending" ? "var(--status-amber)" : "var(--status-red)" }} />
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title"><span>🔧</span> My Incident Reports</div>
                <div className="card-subtitle">Submitted maintenance tickets</div>
              </div>
              <button className="card-action">View all →</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Issue</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                  {myIncidents.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{t.id}</td>
                      <td style={{ fontSize: 12 }}>{t.title}</td>
                      <td><span className={`badge ${t.priority === "High" ? "open" : t.priority === "Medium" ? "progress" : "cancelled"}`}>{t.priority}</span></td>
                      <td><span className={`badge ${t.status}`}>{t.status === "progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title"><span>📝</span> Report a Fault</div>
            </div>
            <div className="report-form">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Issue Title</label>
                  <input className="form-input" placeholder="e.g. Projector flickering" value={reportForm.title} onChange={e => setReportForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Module</label>
                  <input className="form-input" placeholder="e.g. IT3030" value={reportForm.module} onChange={e => setReportForm(f => ({ ...f, module: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder="e.g. Lecture Hall B" value={reportForm.location} onChange={e => setReportForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={reportForm.priority} onChange={e => setReportForm(f => ({ ...f, priority: e.target.value }))}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe the issue…" value={reportForm.desc} onChange={e => setReportForm(f => ({ ...f, desc: e.target.value }))} />
              </div>
              <button className="btn-primary" style={{ alignSelf: "flex-start" }}>Submit Report →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}