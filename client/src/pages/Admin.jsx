import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, useApi } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { ErrorState, Loading } from "../components/States.jsx";
import { serviceBySlug } from "../data/site.js";
import { formatDate } from "../format.js";

const TABS = [["dashboard", "Dashboard"], ["leads", "Leads"], ["subscribers", "Subscribers"]];
const STATUS_LABELS = { new: "New", contacted: "Contacted", qualified: "Qualified", won: "Won", lost: "Lost" };
const serviceName = (slug) => serviceBySlug(slug)?.short || slug;

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "dashboard";

  return (
    <section className="section tight">
      <div className="container">
        <div className="admin-head">
          <h1 className="admin-title">Admin</h1>
          <div className="btn-row">
            <span className="muted small">{user.email}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/"); }}>Sign out</button>
          </div>
        </div>
        <div className="filters admin-tabs">
          {TABS.map(([k, label]) => (
            <button key={k} className={tab === k ? "active" : ""} onClick={() => setParams({ tab: k })}>{label}</button>
          ))}
        </div>
        {tab === "dashboard" && <Dashboard />}
        {tab === "leads" && <Leads />}
        {tab === "subscribers" && <Subscribers />}
      </div>
    </section>
  );
}

function Guard({ q, children }) {
  if (q.loading && !q.data) return <Loading />;
  if (q.error) return <ErrorState error={q.error} onRetry={q.reload} />;
  return children(q.data);
}

function Dashboard() {
  const q = useApi("/admin/stats");
  return (
    <Guard q={q}>
      {(s) => (
        <>
          <div className="stat-grid four">
            <div className="card"><span className="muted small">New leads</span><h3>{s.new}</h3></div>
            <div className="card"><span className="muted small">Leads this week</span><h3>{s.lastWeek}</h3></div>
            <div className="card"><span className="muted small">Total leads · won</span><h3>{s.total} · {s.won}</h3></div>
            <div className="card"><span className="muted small">Subscribers</span><h3>{s.subscribers}</h3></div>
          </div>
          <div className="split-2">
            <div className="card">
              <h3>By source</h3>
              <table className="table"><tbody>
                <tr><td>Free analysis requests</td><td className="num">{s.bySource.analysis}</td></tr>
                <tr><td>Contact form</td><td className="num">{s.bySource.contact}</td></tr>
              </tbody></table>
            </div>
            <div className="card">
              <h3>Services requested</h3>
              <table className="table"><tbody>
                {Object.entries(s.byService).sort((a, b) => b[1] - a[1]).map(([slug, n]) => (
                  <tr key={slug}><td>{serviceName(slug)}</td><td className="num">{n}</td></tr>
                ))}
              </tbody></table>
              {!Object.keys(s.byService).length && <p className="muted">No leads yet.</p>}
            </div>
          </div>
        </>
      )}
    </Guard>
  );
}

function Leads() {
  const [status, setStatus] = useState("");
  const q = useApi(`/admin/leads${status ? `?status=${status}` : ""}`);
  const [openId, setOpenId] = useState(null);
  return (
    <>
      <div className="toolbar">
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <Guard q={q}>
        {(d) => (
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Date</th><th>Name</th><th>Company</th><th>Source</th><th>Services</th><th>Status</th><th /></tr></thead>
              <tbody>
                {d.leads.map((l) => (
                  <LeadRow key={l.id} lead={l} open={openId === l.id} onToggle={() => setOpenId(openId === l.id ? null : l.id)} onChange={q.reload} />
                ))}
              </tbody>
            </table>
            {!d.leads.length && <p className="muted" style={{ padding: "1rem" }}>No leads.</p>}
          </div>
        )}
      </Guard>
    </>
  );
}

function LeadRow({ lead: l, open, onToggle, onChange }) {
  const toast = useToast();

  async function setStatus(status) {
    try {
      await api(`/admin/leads/${l.id}`, { method: "PATCH", body: { status } });
      toast(`${l.name} → ${STATUS_LABELS[status]}`);
      onChange();
    } catch (err) {
      toast(err.message, "error");
    }
  }

  return (
    <>
      <tr>
        <td>{formatDate(l.createdAt)}</td>
        <td><strong>{l.name}</strong><br /><span className="muted small">{l.email}</span></td>
        <td>{l.company || "—"}</td>
        <td>{l.source === "analysis" ? "Free analysis" : "Contact"}</td>
        <td className="small">{l.services.map(serviceName).join(", ") || "—"}</td>
        <td>
          <select className="input status-select" value={l.status} onChange={(e) => setStatus(e.target.value)} aria-label="Lead status">
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </td>
        <td><button className="btn btn-ghost btn-sm" onClick={onToggle}>{open ? "Close" : "View"}</button></td>
      </tr>
      {open && (
        <tr className="detail-row">
          <td colSpan={7}>
            <dl className="kv">
              <div><dt>Email</dt><dd><a className="gold" href={`mailto:${l.email}`}>{l.email}</a></dd></div>
              {l.phone && <div><dt>Phone</dt><dd><a href={`tel:${l.phone.replace(/\D/g, "")}`}>{l.phone}</a></dd></div>}
              {l.website && <div><dt>Website</dt><dd><a className="gold" href={l.website} target="_blank" rel="noreferrer">{l.website}</a></dd></div>}
              {l.budget && <div><dt>Budget</dt><dd>{l.budget}</dd></div>}
              <div><dt>Received</dt><dd>{formatDate(l.createdAt, true)}</dd></div>
              <div><dt>Message</dt><dd className="pre">{l.message || "—"}</dd></div>
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}

function Subscribers() {
  const q = useApi("/admin/subscribers");
  return (
    <Guard q={q}>
      {(d) => (
        <div className="card">
          <h3>Newsletter subscribers ({d.subscribers.length})</h3>
          <ul className="plain-list">
            {d.subscribers.map((s) => <li key={s.email}>{s.email} <span className="muted small">{formatDate(s.created_at)}</span></li>)}
          </ul>
          {!d.subscribers.length && <p className="muted">No subscribers yet.</p>}
        </div>
      )}
    </Guard>
  );
}
