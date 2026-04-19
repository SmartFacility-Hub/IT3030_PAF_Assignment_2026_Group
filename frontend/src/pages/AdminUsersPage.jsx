import { useState, useEffect, useCallback } from "react";
import api, { adminApi } from "../services/api";

const styles = `
  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; gap: 16px;
  }
  .page-header-left {}
  .page-label {
    font-family: var(--font-mono);
    font-size: 10px; font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 6px;
    display: flex; align-items: center; gap: 8px;
  }
  .page-label::before {
    content: ''; display: block; width: 18px; height: 1px; background: var(--accent);
  }
  .page-title {
    font-family: var(--font-display);
    font-size: 28px; font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.025em; line-height: 1.1;
  }
  .page-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
  .page-header-right { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

  .btn-ghost {
    padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);
    background: transparent; color: var(--text-secondary);
    font-family: var(--font-body); font-size: 13px; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { border-color: var(--accent-border); color: var(--text-primary); background: var(--accent-glow); }

  .btn-primary {
    padding: 8px 18px; border: none; border-radius: var(--radius-sm);
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 14px var(--accent-glow); }

  .card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); transition: var(--transition-theme); overflow: hidden;
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px; border-bottom: 1px solid var(--border);
  }
  .card-title {
    font-family: var(--font-display); font-size: 15px; font-weight: 700;
    color: var(--text-primary); display: flex; align-items: center; gap: 8px;
  }
  .card-title-icon { font-size: 16px; }
  .card-subtitle {
    font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px;
  }
  .card-action {
    font-family: var(--font-mono); font-size: 11px; color: var(--accent);
    cursor: pointer; transition: color 0.2s;
    display: flex; align-items: center; gap: 4px;
    border: none; background: none; padding: 0;
  }
  .card-action:hover { color: var(--accent-hover); }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 1px solid var(--border); }
  th {
    font-family: var(--font-mono); font-size: 9.5px; font-weight: 500;
    color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;
    padding: 10px 16px; text-align: left;
  }
  th:first-child { padding-left: 22px; }
  th:last-child  { padding-right: 22px; }
  tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; cursor: pointer; }
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
  .badge.open     { background: var(--status-red-bg);   color: var(--status-red); }
  .badge.progress { background: var(--status-amber-bg); color: var(--status-amber); }
  .badge.active   { background: var(--status-green-bg); color: var(--status-green); }

  .approve-btn {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-green-bg); color: var(--status-green);
    border: 1px solid var(--status-green-bg);
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .approve-btn:hover { filter: brightness(1.2); }
  .reject-btn {
    padding: 5px 12px; border-radius: var(--radius-sm);
    background: var(--status-red-bg); color: var(--status-red);
    border: 1px solid var(--status-red-bg);
    font-family: var(--font-mono); font-size: 11px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .reject-btn:hover { filter: brightness(1.2); }

  .adm-modal-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: var(--bg-overlay); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; z-index: 100;
  }
  .adm-modal {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); width: 100%; max-width: 440px;
    padding: 24px; box-shadow: var(--shadow-card);
  }
  .adm-modal-title {
    font-family: var(--font-display); font-size: 18px; font-weight: 700;
    margin-bottom: 20px;
  }
`;

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const valError = validate();
    if (valError) return setError(valError);

    setLoading(true);
    try {
      await adminApi.createUser(form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create user.");
    } finally { setLoading(false); }
  };

  return (
    <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal-title">👤 Create User</div>
        {error && <div className="adm-error" style={{ color: "var(--status-red)", marginBottom: 10, fontSize: 13 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="adm-form-group">
            <label className="adm-label" style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Name</label>
            <input className="adm-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} 
              style={{ width: "100%", padding: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)" }}/>
          </div>
          <div className="adm-form-group" style={{ marginTop: 10 }}>
            <label className="adm-label" style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Email</label>
            <input className="adm-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} 
              style={{ width: "100%", padding: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)" }}/>
          </div>
          <div className="adm-form-group" style={{ marginTop: 10 }}>
            <label className="adm-label" style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Password</label>
            <input className="adm-input" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} 
              style={{ width: "100%", padding: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)" }}/>
          </div>
          <div className="adm-modal-footer" style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, password: "" });
  const [roles, setRoles] = useState(user.roles || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email address.";
    if (form.password && form.password.length < 6) return "Password must be at least 6 characters.";
    if (roles.length === 0) return "At least one role must be selected.";
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const valError = validate();
    if (valError) return setError(valError);

    setLoading(true);
    try {
      await adminApi.updateUser(user.id, form);
      // Update roles if changed
      const oldRoles = [...(user.roles || [])].sort().join();
      const newRoles = [...roles].sort().join();
      if (oldRoles !== newRoles) {
        await adminApi.updateRoles(user.id, roles);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user.");
    } finally { setLoading(false); }
  };

  const toggleRole = (role) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  return (
    <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal-title">✏️ Edit User</div>
        {error && <div className="adm-error" style={{ color: "var(--status-red)", marginBottom: 10, fontSize: 13 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="adm-form-group">
            <label className="adm-label" style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Name</label>
            <input className="adm-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} 
              style={{ width: "100%", padding: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)" }}/>
          </div>
          <div className="adm-form-group" style={{ marginTop: 10 }}>
            <label className="adm-label" style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Email</label>
            <input className="adm-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} 
              style={{ width: "100%", padding: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)" }}/>
          </div>
          <div className="adm-form-group" style={{ marginTop: 10 }}>
            <label className="adm-label" style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Roles</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
              {["ROLE_USER", "ROLE_TECHNICIAN", "ROLE_ADMIN"].map(r => (
                <label key={r} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={roles.includes(r)} onChange={() => toggleRole(r)} />
                  {r.replace("ROLE_", "")}
                </label>
              ))}
            </div>
          </div>
          <div className="adm-form-group" style={{ marginTop: 10 }}>
            <label className="adm-label" style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>Password (Leave blank to keep current)</label>
            <input className="adm-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} 
              style={{ width: "100%", padding: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)" }}/>
          </div>
          <div className="adm-modal-footer" style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ user, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal" style={{ maxWidth: 400 }}>
        <div className="adm-modal-title" style={{ color: "var(--status-red)" }}>⚠️ Delete User</div>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
          Are you sure you want to delete the user <strong>{user.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="reject-btn" onClick={handleConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/api/admin/users');
      setAllUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await adminApi.deleteUser(deletingUser.id);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user: " + (err.response?.data?.error || err.message));
    }
  };

  const getInitials = (name) =>
    name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div style={{ padding: "32px", minHeight: "calc(100vh - 60px)" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="page-header" style={{ animation: "fadeInUp 0.5s ease both" }}>
        <div className="page-header-left">
          <div className="page-label">Admin Management</div>
          <div className="page-title">Users & Roles</div>
          <div className="page-subtitle">Manage platform users, passwords, and their permissions</div>
        </div>
        <div className="page-header-right">
          <button className="btn-primary" onClick={() => setShowCreateUser(true)}>
            + Create User
          </button>
        </div>
      </div>

      <div className="card" style={{ animation: "fadeInUp 0.5s 0.1s ease both" }}>
        <div className="card-header">
          <div>
            <div className="card-title"><span className="card-title-icon">👥</span> All Users</div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="card-action" onClick={fetchUsers}>Refresh →</button>
          </div>
        </div>
        
        {usersLoading ? (
          <div style={{ padding: "32px 22px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
            Loading users...
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Roles</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "30px", height: "30px", borderRadius: "50%",
                          background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-display)", fontSize: "10px", fontWeight: 700, color: "var(--accent-fg)",
                          overflow: "hidden", flexShrink: 0,
                        }}>
                          {u.picture
                            ? <img src={u.picture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : getInitials(u.name)}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{u.email}</td>
                    <td>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {u.roles?.map(r => (
                          <span key={r} className={`badge ${r === "ROLE_ADMIN" ? "open" : r === "ROLE_TECHNICIAN" ? "progress" : "active"}`}>
                            {r.replace("ROLE_", "")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button className="approve-btn" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", borderColor: "var(--border)" }} onClick={() => setEditingUser(u)}>Edit</button>
                        <button className="reject-btn" onClick={() => setDeletingUser(u)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateUser && (
        <CreateUserModal
          onClose={() => setShowCreateUser(false)}
          onCreated={() => { setShowCreateUser(false); fetchUsers(); }}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => { setEditingUser(null); fetchUsers(); }}
        />
      )}
      {deletingUser && (
        <DeleteConfirmModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}
