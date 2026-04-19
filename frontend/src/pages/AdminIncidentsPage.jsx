import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api, { ticketApi } from "../services/api";
import {
  AssignModal,
  StatusModal,
  TicketDetailPanel,
  adminTicketModalStyles,
  STATUS_BG,
  STATUS_CLR,
  STATUS_DOT,
  STATUS_LABEL,
  PRIO_BG,
  PRIO_CLR,
  TICKET_STATUSES,
  TICKET_CATEGORIES,
  formatCategory,
} from "../components/admin/AdminTicketModals";

const pageStyles = `
  .inc-page { padding: 32px; min-height: calc(100vh - 60px); }
  .inc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
  .inc-title { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
  .inc-sub { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
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
    cursor: pointer; transition: all 0.2s;
  }
  .btn-primary:hover { background: var(--accent-hover); }
  .inc-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 24px;
  }
  .inc-card-h {
    padding: 18px 22px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  }
  .inc-card-t { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); }
  .inc-card-s { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px; }
  .inc-major-tabs { display: flex; gap: 4px; padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg-elevated); flex-wrap: wrap; }
  .inc-major-tab {
    padding: 8px 16px; border-radius: var(--radius-sm); border: 1px solid transparent;
    font-family: var(--font-mono); font-size: 11px; font-weight: 500; cursor: pointer;
    color: var(--text-muted); background: transparent; transition: all 0.15s;
  }
  .inc-major-tab:hover { color: var(--text-primary); }
  .inc-major-tab.on { background: var(--bg-surface); color: var(--accent); border-color: var(--border); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .inc-subtabs { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 22px; border-bottom: 1px solid var(--border); align-items: center; }
  .inc-subtab {
    padding: 6px 12px; border-radius: 100px; border: 1px solid var(--border);
    font-family: var(--font-mono); font-size: 10px; font-weight: 500; cursor: pointer;
    color: var(--text-secondary); background: var(--bg-elevated); transition: all 0.15s;
  }
  .inc-subtab:hover { border-color: var(--accent-border); color: var(--text-primary); }
  .inc-subtab.on { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }
  .inc-subtab .n { opacity: 0.85; font-weight: 600; margin-left: 4px; }
  .inc-table-wrap { overflow-x: auto; }
  .inc-table-wrap table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .inc-table-wrap thead tr { border-bottom: 1px solid var(--border); }
  .inc-table-wrap th {
    font-family: var(--font-mono); font-size: 9px; font-weight: 500;
    color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;
    padding: 10px 12px; text-align: left; white-space: nowrap;
  }
  .inc-table-wrap th:first-child { padding-left: 22px; }
  .inc-table-wrap th:last-child { padding-right: 22px; }
  .inc-table-wrap tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  .inc-table-wrap tbody tr:hover { background: var(--bg-elevated); }
  .inc-table-wrap td { padding: 12px 12px; color: var(--text-secondary); vertical-align: middle; }
  .inc-table-wrap td:first-child { padding-left: 22px; color: var(--text-primary); font-weight: 500; }
  .inc-table-wrap td:last-child { padding-right: 22px; }
  .inc-empty { padding: 32px; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; }
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    padding: 3px 10px; border-radius: 100px; white-space: nowrap;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
`;

function countByStatus(tickets) {
  const o = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0, REJECTED: 0 };
  for (const t of tickets) {
    if (o[t.status] !== undefined) o[t.status] += 1;
  }
  return o;
}

function countByCategory(tickets) {
  const m = {};
  for (const c of TICKET_CATEGORIES) m[c] = 0;
  for (const t of tickets) {
    const k = t.category || "OTHER";
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}

export default function AdminIncidentsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [groupBy, setGroupBy] = useState("status");
  const [filterKey, setFilterKey] = useState("ALL");
  const [assigning, setAssigning] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketApi.fetchAll();
      setTickets(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/api/admin/users");
      setAllUsers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, [fetchTickets, fetchUsers]);

  const statusCounts = useMemo(() => countByStatus(tickets), [tickets]);
  const categoryCounts = useMemo(() => countByCategory(tickets), [tickets]);

  const filtered = useMemo(() => {
    if (groupBy === "status") {
      if (filterKey === "ALL") return tickets;
      return tickets.filter((t) => t.status === filterKey);
    }
    if (filterKey === "ALL") return tickets;
    return tickets.filter((t) => (t.category || "OTHER") === filterKey);
  }, [tickets, groupBy, filterKey]);

  useEffect(() => {
    setFilterKey("ALL");
  }, [groupBy]);

  const technicians = allUsers.filter((u) => u.roles?.some((r) => typeof r === "string" && r.toUpperCase().includes("TECHNICIAN")));

  const openDetail = async (t) => {
    try {
      const res = await ticketApi.getById(t.id);
      setSelectedTicket(res.data);
    } catch {
      setSelectedTicket(t);
    }
  };

  const handleRemoveTicket = async (t) => {
    if (t.status !== "CLOSED" && t.status !== "REJECTED") return;
    if (
      !window.confirm(
        `Permanently delete ticket #${t.id} (${t.status.toLowerCase().replace("_", " ")})? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await ticketApi.delete(t.id);
      if (selectedTicket?.id === t.id) setSelectedTicket(null);
      await fetchTickets();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="inc-page fade-in">
      <style dangerouslySetInnerHTML={{ __html: adminTicketModalStyles + pageStyles }} />

      <div className="inc-head">
        <div>
          <div className="inc-title">Incidents</div>
          <div className="inc-sub">Review tickets by status or category, open details for comments and images, assign technicians, and update status.</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn-ghost" onClick={() => navigate("/admin")}>
            ← Dashboard
          </button>
          <button type="button" className="btn-primary" onClick={fetchTickets}>
            ↺ Refresh
          </button>
        </div>
      </div>

      <div className="inc-card">
        <div className="inc-card-h">
          <div>
            <div className="inc-card-t">🔧 All tickets</div>
            <div className="inc-card-s">{tickets.length} total · filter below</div>
          </div>
        </div>

        <div className="inc-major-tabs">
          <button type="button" className={`inc-major-tab${groupBy === "status" ? " on" : ""}`} onClick={() => setGroupBy("status")}>
            By status
          </button>
          <button type="button" className={`inc-major-tab${groupBy === "category" ? " on" : ""}`} onClick={() => setGroupBy("category")}>
            By category
          </button>
        </div>

        <div className="inc-subtabs" role="tablist" aria-label={groupBy === "status" ? "Status filters" : "Category filters"}>
          {groupBy === "status" && (
            <>
              <button type="button" className={`inc-subtab${filterKey === "ALL" ? " on" : ""}`} onClick={() => setFilterKey("ALL")}>
                All<span className="n">({tickets.length})</span>
              </button>
              {TICKET_STATUSES.map((s) => (
                <button key={s} type="button" className={`inc-subtab${filterKey === s ? " on" : ""}`} onClick={() => setFilterKey(s)}>
                  {STATUS_LABEL[s]}
                  <span className="n">({statusCounts[s] ?? 0})</span>
                </button>
              ))}
            </>
          )}
          {groupBy === "category" && (
            <>
              <button type="button" className={`inc-subtab${filterKey === "ALL" ? " on" : ""}`} onClick={() => setFilterKey("ALL")}>
                All<span className="n">({tickets.length})</span>
              </button>
              {TICKET_CATEGORIES.map((c) => (
                <button key={c} type="button" className={`inc-subtab${filterKey === c ? " on" : ""}`} onClick={() => setFilterKey(c)}>
                  {formatCategory(c)}
                  <span className="n">({categoryCounts[c] ?? 0})</span>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="inc-table-wrap">
          {loading ? (
            <div className="inc-empty">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="inc-empty">No tickets in this view.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reporter</th>
                  <th>Assigned</th>
                  <th>Comments</th>
                  <th>Images</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>#{t.id}</td>
                    <td>{t.resourceLocation}</td>
                    <td>{formatCategory(t.category)}</td>
                    <td>
                      <span className="badge" style={{ background: PRIO_BG[t.priority], color: PRIO_CLR[t.priority] }}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: STATUS_BG[t.status], color: STATUS_CLR[t.status] }}>
                        <span className="badge-dot" style={{ background: STATUS_DOT[t.status] }} />
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{t.createdBy}</td>
                    <td style={{ fontSize: 12, color: t.assignedTo ? "var(--text-secondary)" : "var(--status-amber)" }}>{t.assignedTo || "—"}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{t.comments?.length ?? 0}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{t.attachments?.length ?? 0}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="adm-row-actions">
                        <button type="button" className="adm-action-btn" onClick={() => openDetail(t)}>
                          View
                        </button>
                        <button type="button" className="adm-action-btn assign" onClick={() => setAssigning(t)}>
                          Assign
                        </button>
                        <button
                          type="button"
                          className="adm-action-btn"
                          onClick={() => setStatusUpdating(t)}
                          disabled={t.status === "CLOSED" || t.status === "REJECTED"}
                        >
                          Status
                        </button>
                        {(t.status === "CLOSED" || t.status === "REJECTED") && (
                          <button
                            type="button"
                            className="adm-action-btn danger"
                            onClick={() => handleRemoveTicket(t)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {assigning && (
        <AssignModal
          ticket={assigning}
          technicians={technicians}
          onClose={() => setAssigning(null)}
          onDone={() => {
            setAssigning(null);
            fetchTickets();
          }}
        />
      )}

      {statusUpdating && (
        <StatusModal
          ticket={statusUpdating}
          onClose={() => setStatusUpdating(null)}
          onDone={() => {
            setStatusUpdating(null);
            fetchTickets();
          }}
        />
      )}

      {selectedTicket && (
        <TicketDetailPanel
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onRefresh={fetchTickets}
          onTicketDeleted={() => fetchTickets()}
        />
      )}
    </div>
  );
}
