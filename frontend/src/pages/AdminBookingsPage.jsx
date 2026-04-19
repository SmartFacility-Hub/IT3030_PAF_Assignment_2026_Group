import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { approveBooking, getAllBookings, rejectBooking, deleteBooking } from '../services/bookingService';
import RejectModal from '../components/RejectModal';
import BookingDetailModal from '../components/BookingDetailModal';

const styles = `
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; gap: 16px; }
  .page-label {
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
  }
  .page-label::before { content: ''; display: block; width: 18px; height: 1px; background: var(--accent); }
  .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.025em; line-height: 1.1; }
  .page-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
  .page-header-right { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

  .btn-ghost {
    padding: 7px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { border-color: var(--accent-border); color: var(--text-primary); background: var(--accent-glow); }
  .btn-primary {
    padding: 7px 18px; border: none; border-radius: var(--radius-sm);
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
  .btn-danger {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-red-bg); color: var(--status-red);
    border: 1px solid var(--status-red-bg);
    font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.15s;
  }
  .btn-danger:hover { filter: brightness(1.2); }
  .btn-success {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-green-bg); color: var(--status-green);
    border: 1px solid var(--status-green-bg);
    font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.15s;
  }
  .btn-success:hover { filter: brightness(1.2); }
  .btn-edit {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--accent-glow); color: var(--accent);
    border: 1px solid var(--accent-border);
    font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.15s;
  }
  .btn-edit:hover { filter: brightness(1.2); }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .kpi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 18px 20px; position: relative; overflow: hidden; transition: all 0.2s;
  }
  .kpi-card:hover { border-color: var(--accent-border); transform: translateY(-2px); box-shadow: var(--shadow-card); }
  .kpi-icon  { font-size: 22px; margin-bottom: 10px; }
  .kpi-value { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.03em; }
  .kpi-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; }

  .filter-bar {
    display: flex; align-items: center; gap: 10px;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 14px 20px; margin-bottom: 20px; flex-wrap: wrap;
  }
  .filter-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .filter-input {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 7px 12px;
    font-family: var(--font-body); font-size: 13px; color: var(--text-primary);
    outline: none; transition: border-color 0.2s; min-width: 160px;
  }
  .filter-input:focus { border-color: var(--accent-border); }
  .filter-select {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 7px 12px;
    font-family: var(--font-body); font-size: 13px; color: var(--text-primary);
    outline: none; cursor: pointer; transition: border-color 0.2s;
  }
  .filter-select:focus { border-color: var(--accent-border); }
  .filter-select option { background: var(--bg-surface); }
  .filter-spacer { flex: 1; }

  .card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); }
  .card-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
  .card-subtitle { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th { font-family: var(--font-mono); font-size: 9.5px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; padding: 10px 16px; text-align: left; }
  th:first-child { padding-left: 22px; }
  th:last-child  { padding-right: 22px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--bg-elevated); }
  td { padding: 12px 16px; color: var(--text-secondary); vertical-align: middle; }
  td:first-child { padding-left: 22px; color: var(--text-primary); font-weight: 500; }
  td:last-child  { padding-right: 22px; }

  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    padding: 3px 10px; border-radius: 100px; white-space: nowrap;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .badge.pending  { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.approved { background: var(--status-green-bg); color: var(--status-green); }
  .badge.rejected { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.cancelled { background: var(--bg-elevated); color: var(--text-muted); }

  .empty-state { padding: 60px 22px; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; }
  .empty-state-icon { font-size: 40px; margin-bottom: 12px; }
  .loading-row td { text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in   { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }

  @media (max-width: 768px) {
    .kpi-grid { grid-template-columns: 1fr 1fr; }
  }
`;

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.bookings ?? data?.items ?? [];
}

function extractMessage(err) {
  const d = err?.response?.data;
  if (typeof d === 'string') return d;
  if (d?.message) return Array.isArray(d.message) ? d.message.join(' ') : d.message;
  return err?.message || 'Request failed.';
}

const BookingCalendar = ({ bookings, handleApprove, setRejectForId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  
  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get bookings for a specific date
  const getBookingsForDate = (day) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return bookings.filter(b => b.bookingDate === dateStr);
  };
  
  // Get dot color based on status
  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return '#F97316';    // orange
      case 'APPROVED': return '#16A34A';   // green
      case 'REJECTED': return '#DC2626';   // red
      case 'CANCELLED': return '#78716C';  // grey
      default: return '#78716C';
    }
  };

  const statusBadgeClass = (s) => s ? s.toLowerCase() : "";

  return (
    <div style={{background:'white', borderRadius:'12px', padding:'24px', 
                 boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}} className="fade-in-2">
      
      {/* Calendar Header */}
      <div style={{display:'flex', justifyContent:'space-between', 
                   alignItems:'center', marginBottom:'20px'}}>
        <button className="btn-ghost" onClick={() => setCurrentDate(new Date(year, month-1, 1))}>
          ← Prev
        </button>
        <h3 style={{margin:0, fontSize:'18px', fontWeight:'600', fontFamily: 'var(--font-display)'}}>
          {monthNames[month]} {year}
        </h3>
        <button className="btn-ghost" onClick={() => setCurrentDate(new Date(year, month+1, 1))}>
          Next →
        </button>
      </div>
      
      {/* Day headers */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', 
                   gap:'4px', marginBottom:'8px'}}>
        {dayNames.map(d => (
          <div key={d} style={{textAlign:'center', fontSize:'12px', 
                               fontWeight:'600', color:'#78716C', padding:'8px'}}>
            {d}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'4px'}}>
        
        {/* Empty cells for first week */}
        {Array.from({length: firstDay}).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        
        {/* Day cells */}
        {Array.from({length: daysInMonth}).map((_, i) => {
          const day = i + 1;
          const dayBookings = getBookingsForDate(day);
          const isSelected = selectedDate === day;
          const isToday = new Date().getDate() === day && 
                          new Date().getMonth() === month && 
                          new Date().getFullYear() === year;
          
          return (
            <div
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : day)}
              style={{
                minHeight: '70px',
                padding: '6px',
                borderRadius: '8px',
                border: isSelected ? '2px solid #F97316' : '1px solid #E7E5E4',
                background: isSelected ? '#FFF7ED' : 
                            isToday ? '#FED7AA' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                fontSize: '13px', 
                fontWeight: isToday ? '700' : '400',
                color: isToday ? '#F97316' : '#1C1917',
                marginBottom: '4px'
              }}>
                {day}
              </div>
              
              {/* Status dots for bookings on this day */}
              <div style={{display:'flex', flexWrap:'wrap', gap:'2px'}}>
                {dayBookings.slice(0, 3).map((b, idx) => (
                  <div
                    key={idx}
                    title={`${b.resourceName} - ${b.userName} (${b.status})`}
                    style={{
                      width: '8px', height: '8px',
                      borderRadius: '50%',
                      background: getStatusColor(b.status)
                    }}
                  />
                ))}
                {dayBookings.length > 3 && (
                  <span style={{fontSize:'10px', color:'#78716C'}}>
                    +{dayBookings.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Selected date booking details panel */}
      {selectedDate && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#FFF7ED',
          borderRadius: '8px',
          border: '1px solid #FED7AA'
        }}>
          <h4 style={{margin:'0 0 12px 0', color:'#1C1917', fontFamily: 'var(--font-display)'}}>
            📅 Bookings for {monthNames[month]} {selectedDate}, {year}
          </h4>
          
          {getBookingsForDate(selectedDate).length === 0 ? (
            <p style={{color:'#78716C', margin:0}}>
              No bookings for this date
            </p>
          ) : (
            getBookingsForDate(selectedDate).map(booking => {
              const st = (booking.status || '').toString().toUpperCase();
              return (
              <div key={booking.id} style={{
                background: 'white',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
                border: '1px solid #E7E5E4',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{margin:'0 0 4px 0', fontWeight:'600', 
                             fontSize:'14px'}}>
                    {booking.resourceName}
                  </p>
                  <p style={{margin:'0 0 2px 0', fontSize:'13px', 
                             color:'#78716C'}}>
                    👤 {booking.userName}
                  </p>
                  <p style={{margin:0, fontSize:'13px', color:'#78716C'}}>
                    ⏰ {booking.startTime} – {booking.endTime}
                  </p>
                  <p style={{margin:'4px 0 0 0', fontSize:'13px', 
                             color:'#78716C'}}>
                    📝 {booking.purpose}
                  </p>
                </div>
                <div style={{display:'flex', flexDirection:'column', 
                             gap:'6px', alignItems:'flex-end'}}>
                  <span className={`badge ${statusBadgeClass(st)}`}>
                    <span className="badge-dot" style={{
                      background: st === "APPROVED" ? "var(--status-green)" : st === "REJECTED" ? "var(--status-red)" : st === "PENDING" ? "var(--status-amber)" : "var(--text-muted)"
                    }} />
                    {st}
                  </span>
                  {booking.status === 'PENDING' && (
                    <div style={{display:'flex', gap:'4px'}}>
                      <button
                        onClick={() => handleApprove(booking.id)}
                        style={{background:'#16A34A', color:'white',
                                border:'none', borderRadius:'6px',
                                padding:'4px 10px', cursor:'pointer',
                                fontSize:'12px'}}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => setRejectForId(booking.id)}
                        style={{background:'#DC2626', color:'white',
                                border:'none', borderRadius:'6px',
                                padding:'4px 10px', cursor:'pointer',
                                fontSize:'12px'}}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )})
          )}
        </div>
      )}
      
      {/* Legend */}
      <div style={{display:'flex', gap:'16px', marginTop:'16px', 
                   flexWrap:'wrap'}}>
        {[
          {color:'#F97316', label:'Pending'},
          {color:'#16A34A', label:'Approved'},
          {color:'#DC2626', label:'Rejected'},
          {color:'#78716C', label:'Cancelled'}
        ].map(item => (
          <div key={item.label} style={{display:'flex', alignItems:'center', 
                                        gap:'6px'}}>
            <div style={{width:'10px', height:'10px', borderRadius:'50%',
                         background: item.color}} />
            <span style={{fontSize:'12px', color:'#78716C'}}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AdminBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Action states
  const [conflictMessage, setConflictMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [rejectForId, setRejectForId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllBookings({}); // Fetch all for client-side filter
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

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const sTerm = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        (booking.userName?.toLowerCase() || '').includes(sTerm) ||
        (booking.resourceName?.toLowerCase() || '').includes(sTerm);
      
      const matchesStatus = !statusFilter || booking.status === statusFilter;
      const matchesDate = !dateFilter || booking.bookingDate === dateFilter;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const setBusy = (id, action) => {
    setBusyId(id);
    setBusyAction(action);
  };

  const handleApprove = async (id) => {
    setActionError(null);
    setConflictMessage(null);
    setBusy(id, 'approve');
    try {
      await approveBooking(id);
      await load();
    } catch (err) {
      if (err?.response?.status === 409) {
        setConflictMessage(extractMessage(err) || 'Conflict: booking could not be approved.');
      } else {
        setActionError(extractMessage(err));
      }
    } finally {
      setBusy(null, '');
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectForId) return;
    setActionError(null);
    setConflictMessage(null);
    setBusy(rejectForId, 'reject');
    try {
      await rejectBooking(rejectForId, reason);
      setRejectForId(null);
      await load();
    } catch (err) {
      if (err?.response?.status === 409) {
        setConflictMessage(extractMessage(err) || 'Conflict: booking could not be rejected.');
      } else {
        setActionError(extractMessage(err));
      }
    } finally {
      setBusy(null, '');
    }
  };

  const handleAdminDelete = async (bookingId) => {
    if (!window.confirm(
      'Permanently delete this cancelled booking? This cannot be undone.'
    )) return;
    
    try {
      // BACKEND: DELETE /api/bookings/{id}
      await deleteBooking(bookingId);
      load(); // refresh list
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete booking';
      alert(msg);
    }
  };

  // Stats
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const approvedCount = bookings.filter(b => b.status === 'APPROVED').length;
  const rejectedCount = bookings.filter(b => b.status === 'REJECTED').length;

  const statusBadgeClass = (s) => s ? s.toLowerCase() : "";

  return (
    <div style={{ padding: "32px", minHeight: "calc(100vh - 60px)" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="page-header fade-in">
        <div>
          <div className="page-title">Bookings Management</div>
          <div className="page-subtitle">Review and manage all facility booking requests across the campus</div>
        </div>
        <div className="page-header-right">
          <div style={{display:'flex', gap:'8px'}}>
            <button 
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#F97316' : 'white',
                color: viewMode === 'table' ? 'white' : '#78716C',
                border: '1px solid #E7E5E4',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              ☰ Table
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                background: viewMode === 'calendar' ? '#F97316' : 'white',
                color: viewMode === 'calendar' ? 'white' : '#78716C',
                border: '1px solid #E7E5E4',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              📅 Calendar
            </button>
            <button className="btn-ghost" onClick={load}>↻ Refresh</button>
          </div>
        </div>
      </div>

      <div className="kpi-grid fade-in-1">
        {[
          { icon: "📅", label: "Total Bookings",   value: totalBookings },
          { icon: "⏰", label: "Pending Approval", value: pendingCount },
          { icon: "✅", label: "Approved",         value: approvedCount },
          { icon: "❌", label: "Rejected",         value: rejectedCount },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-icon">{k.icon}</div>
            <div className="kpi-value">{loading ? "—" : k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {error && <div style={{ color: "var(--status-red)", marginBottom: 16 }}>{error}</div>}
      {actionError && <div style={{ color: "var(--status-red)", marginBottom: 16 }}>{actionError}</div>}
      {conflictMessage && <div style={{ color: "var(--status-amber)", marginBottom: 16 }}>{conflictMessage}</div>}

      <div className="filter-bar fade-in-1">
        <span className="filter-label">Filter:</span>
        <input className="filter-input" placeholder="Search user or resource…"
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <input className="filter-input" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        <div className="filter-spacer" />
        <button className="btn-ghost" onClick={() => { setSearchTerm(""); setStatusFilter(""); setDateFilter(""); }}>
          Clear Filters
        </button>
      </div>

      {viewMode === 'table' ? (
        <div className="card fade-in-2">
          <div className="card-header">
            <div>
              <div className="card-title"><span>📅</span> All Bookings</div>
              <div className="card-subtitle">{loading ? "Loading…" : `${filteredBookings.length} booking${filteredBookings.length !== 1 ? "s" : ""} found`}</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>User</th><th>Resource</th><th>Date</th><th>Time</th><th>Purpose</th><th>Attendees</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row"><td colSpan={8}>Loading bookings…</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      No bookings found.
                    </td>
                  </tr>
                ) : filteredBookings.map(b => {
                  const id = b.id;
                  const st = (b.status || '').toString().toUpperCase();
                  let purpose = b.purpose ?? '—';
                  if (purpose.length > 30) purpose = purpose.substring(0, 30) + '...';

                  return (
                  <tr key={b.id} onDoubleClick={() => setSelectedBooking(b)} style={{ cursor: 'pointer' }}>
                    <td>{b.userName ?? '—'}</td>
                    <td><span className="badge type" style={{background: 'var(--bg-elevated)', color: 'var(--text-primary)'}}>{b.resourceName ?? '—'}</span></td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{b.bookingDate ?? '—'}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                      {b.startTime ?? '—'} – {b.endTime ?? '—'}
                    </td>
                    <td title={b.purpose}>{purpose}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{b.expectedAttendees ?? '—'}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(st)}`}>
                        <span className="badge-dot" style={{
                          background: st === "APPROVED" ? "var(--status-green)" : st === "REJECTED" ? "var(--status-red)" : st === "PENDING" ? "var(--status-amber)" : "var(--text-muted)"
                        }} />
                        {st}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {st === "PENDING" && (
                          <>
                            <button className="btn-success" onClick={() => handleApprove(id)} disabled={busyId === id}>
                              ✓ Approve
                            </button>
                            <button className="btn-danger" onClick={() => setRejectForId(id)} disabled={busyId === id}>
                              ✕ Reject
                            </button>
                          </>
                        )}
                        {st === 'CANCELLED' && (
                          <button
                            onClick={() => handleAdminDelete(b.id)}
                            style={{
                              background: "transparent",
                              border: "1px solid #DC2626",
                              color: "#DC2626",
                              borderRadius: "8px",
                              padding: "5px 12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            🗑 Delete
                          </button>
                        )}
                        <button className="btn-edit" onClick={() => setSelectedBooking(b)}>ℹ Details</button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <BookingCalendar bookings={bookings} handleApprove={handleApprove} setRejectForId={setRejectForId} />
      )}

      <RejectModal
        open={rejectForId != null}
        title="Reject booking"
        busy={busyId != null && busyAction === 'reject'}
        onClose={() => !busyId && setRejectForId(null)}
        onConfirm={handleRejectConfirm}
      />
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onRefresh={load}
        />
      )}
    </div>
  );
}
