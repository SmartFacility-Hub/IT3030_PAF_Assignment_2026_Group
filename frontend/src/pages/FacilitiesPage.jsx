import { useState, useEffect, useCallback } from "react";
import facilityService from "../services/facilityService";

// ─── Page-specific styles only (no sidebar/topbar/themes) ─────────────────────
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
  .badge.active            { background: var(--status-green-bg);  color: var(--status-green); }
  .badge.out_of_service    { background: var(--status-red-bg);    color: var(--status-red); }
  .badge.under_maintenance { background: var(--status-amber-bg);  color: var(--status-amber); }
  .badge.type              { background: var(--status-blue-bg);   color: var(--status-blue); }

  .empty-state { padding: 60px 22px; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; }
  .empty-state-icon { font-size: 40px; margin-bottom: 12px; }
  .loading-row td { text-align: center; padding: 40px; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .modal {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-xl); width: 100%; max-width: 540px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    animation: fadeInUp 0.25s ease both;
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
  .modal-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); }
  .modal-close {
    width: 32px; height: 32px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg-elevated);
    cursor: pointer; font-size: 16px; color: var(--text-muted);
    display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  }
  .modal-close:hover { border-color: var(--status-red-bg); color: var(--status-red); }
  .modal-body   { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
  .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }

  .form-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-field { display: flex; flex-direction: column; gap: 5px; }
  .form-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .form-input, .form-select, .form-textarea {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 9px 12px;
    font-family: var(--font-body); font-size: 13px; color: var(--text-primary);
    transition: border-color 0.2s; width: 100%; outline: none;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--accent-border); }
  .form-textarea { resize: vertical; min-height: 72px; }
  .form-select option { background: var(--bg-surface); }

  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 200;
    padding: 12px 18px; border-radius: var(--radius-md);
    font-family: var(--font-mono); font-size: 12px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    animation: fadeInUp 0.3s ease both;
  }
  .toast.success { background: var(--status-green-bg); color: var(--status-green); border: 1px solid var(--status-green); }
  .toast.error   { background: var(--status-red-bg);   color: var(--status-red);   border: 1px solid var(--status-red); }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in   { animation: fadeInUp 0.5s ease both; }
  .fade-in-1 { animation: fadeInUp 0.5s 0.05s ease both; }
  .fade-in-2 { animation: fadeInUp 0.5s 0.10s ease both; }

  @media (max-width: 768px) {
    .kpi-grid { grid-template-columns: 1fr 1fr; }
    .form-row { grid-template-columns: 1fr; }
  }
`;

const FACILITY_TYPES    = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const FACILITY_STATUSES = ["ACTIVE", "OUT_OF_SERVICE", "UNDER_MAINTENANCE"];
const typeIcons = { LECTURE_HALL: "🏛️", LAB: "🔬", MEETING_ROOM: "🎙️", EQUIPMENT: "🖥️" };
const EMPTY_FORM = { name: "", type: "LECTURE_HALL", capacity: "", location: "", description: "", status: "ACTIVE", availabilityStart: "08:00", availabilityEnd: "18:00" };

export default function FacilitiesPage() {
  const [facilities,  setFacilities]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filterType,     setFilterType]     = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFacilities = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await facilityService.getAll({
        type:     filterType     || undefined,
        status:   filterStatus   || undefined,
        location: filterLocation || undefined,
      });
      setFacilities(res.data);
    } catch {
      setError("Failed to load facilities. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterLocation]);

  useEffect(() => { fetchFacilities(); }, [fetchFacilities]);

  const total       = facilities.length;
  const active      = facilities.filter(f => f.status === "ACTIVE").length;
  const outOfSvc    = facilities.filter(f => f.status === "OUT_OF_SERVICE").length;
  const maintenance = facilities.filter(f => f.status === "UNDER_MAINTENANCE").length;

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormError(""); setModalOpen(true); };
  const openEdit   = (f)  => {
    setEditTarget(f);
    setForm({
      name: f.name || "", type: f.type || "LECTURE_HALL", capacity: f.capacity || "",
      location: f.location || "", description: f.description || "",
      status: f.status || "ACTIVE",
      availabilityStart: f.availabilityStart || "08:00",
      availabilityEnd:   f.availabilityEnd   || "18:00",
    });
    setFormError(""); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim())     return setFormError("Name is required.");
    if (!form.location.trim()) return setFormError("Location is required.");
    if (form.capacity && isNaN(Number(form.capacity))) return setFormError("Capacity must be a number.");
    setSaving(true); setFormError("");
    try {
      const payload = { ...form, capacity: form.capacity ? Number(form.capacity) : null };
      if (editTarget) {
        await facilityService.update(editTarget.id, payload);
        showToast("Facility updated successfully ✓");
      } else {
        await facilityService.create(payload);
        showToast("Facility created successfully ✓");
      }
      setModalOpen(false); fetchFacilities();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await facilityService.delete(deleteTarget.id);
      showToast("Facility deleted ✓");
      setDeleteTarget(null); fetchFacilities();
    } catch { showToast("Failed to delete facility.", "error"); }
    finally { setDeleting(false); }
  };

  const statusBadgeClass = (s) => s ? s.toLowerCase() : "";

  return (
    <div style={{ padding: "32px", minHeight: "calc(100vh - 60px)" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Page Header */}
      <div className="page-header fade-in">
        <div>
          <div className="page-label">Module A</div>
          <div className="page-title">Facilities & Assets Catalogue</div>
          <div className="page-subtitle">Manage bookable resources — lecture halls, labs, meeting rooms, and equipment</div>
        </div>
        <div className="page-header-right">
          <button className="btn-ghost" onClick={fetchFacilities}>↻ Refresh</button>
          <button className="btn-primary" onClick={openCreate}>＋ Add Facility</button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="kpi-grid fade-in-1">
        {[
          { icon: "🏛️", label: "Total Resources",  value: total },
          { icon: "✅",  label: "Active",            value: active },
          { icon: "🚫",  label: "Out of Service",    value: outOfSvc },
          { icon: "🔧",  label: "Under Maintenance", value: maintenance },
        ].map(k => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-icon">{k.icon}</div>
            <div className="kpi-value">{loading ? "—" : k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar fade-in-1">
        <span className="filter-label">Filter:</span>
        <input className="filter-input" placeholder="Search by location…"
          value={filterLocation} onChange={e => setFilterLocation(e.target.value)} />
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {FACILITY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {FACILITY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <div className="filter-spacer" />
        <button className="btn-ghost" onClick={() => { setFilterType(""); setFilterStatus(""); setFilterLocation(""); }}>
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="card fade-in-2">
        <div className="card-header">
          <div>
            <div className="card-title"><span>🏛️</span> All Facilities</div>
            <div className="card-subtitle">{loading ? "Loading…" : `${facilities.length} resource${facilities.length !== 1 ? "s" : ""} found`}</div>
          </div>
        </div>
        {error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div>{error}</div>
            <button className="btn-ghost" style={{ margin: "12px auto 0", display: "flex" }} onClick={fetchFacilities}>Try again</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>Capacity</th><th>Location</th><th>Availability</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row"><td colSpan={7}>Loading facilities…</td></tr>
                ) : facilities.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      No facilities found. Click "＋ Add Facility" to create one.
                    </td>
                  </tr>
                ) : facilities.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{typeIcons[f.type] || "🏛️"}</span>
                        {f.name}
                      </div>
                    </td>
                    <td><span className="badge type">{f.type?.replace(/_/g, " ")}</span></td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{f.capacity ? `${f.capacity} seats` : "—"}</td>
                    <td>{f.location}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                      {f.availabilityStart && f.availabilityEnd ? `${f.availabilityStart} – ${f.availabilityEnd}` : "—"}
                    </td>
                    <td>
                      <span className={`badge ${statusBadgeClass(f.status)}`}>
                        <span className="badge-dot" style={{
                          background: f.status === "ACTIVE" ? "var(--status-green)" : f.status === "OUT_OF_SERVICE" ? "var(--status-red)" : "var(--status-amber)"
                        }} />
                        {f.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn-edit"   onClick={() => openEdit(f)}>✏ Edit</button>
                        <button className="btn-danger" onClick={() => setDeleteTarget(f)}>✕ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editTarget ? "Edit Facility" : "Add New Facility"}</div>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {formError && (
                <div style={{ background: "var(--status-red-bg)", color: "var(--status-red)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  ⚠ {formError}
                </div>
              )}
              <div className="form-row">
                <div className="form-field" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Facility Name *</label>
                  <input className="form-input" placeholder="e.g. Computer Lab 01"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Type *</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {FACILITY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Status *</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {FACILITY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Location *</label>
                  <input className="form-input" placeholder="e.g. Block A, Floor 2"
                    value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Capacity</label>
                  <input className="form-input" type="number" placeholder="e.g. 40"
                    value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Available From</label>
                  <input className="form-input" type="time" value={form.availabilityStart}
                    onChange={e => setForm(f => ({ ...f, availabilityStart: e.target.value }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Available Until</label>
                  <input className="form-input" type="time" value={form.availabilityEnd}
                    onChange={e => setForm(f => ({ ...f, availabilityEnd: e.target.value }))} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Optional description…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Create Facility"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Delete Facility</div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>{deleteTarget.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" style={{ padding: "8px 18px", fontSize: 13 }} onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? "✓" : "⚠"} {toast.msg}
        </div>
      )}
    </div>
  );
}