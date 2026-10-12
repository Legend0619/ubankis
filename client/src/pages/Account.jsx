import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, useApi } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { StatusPill } from "../components/OrderStatus.jsx";
import { ErrorState, Loading } from "../components/States.jsx";
import { formatDate, money, US_STATES } from "../format.js";

const TABS = [["overview", "Overview"], ["orders", "Orders"], ["profile", "Profile"], ["security", "Security"]];

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "overview";
  const orders = useApi("/orders");

  return (
    <section className="section tight">
      <div className="container account">
        <aside className="account-nav">
          <div className="account-user">
            <div className="avatar">{user.firstName[0]}</div>
            <div><strong>{user.firstName} {user.lastName}</strong><span className="muted small">{user.email}</span></div>
          </div>
          {TABS.map(([key, label]) => (
            <button key={key} className={tab === key ? "active" : ""} onClick={() => setParams({ tab: key })}>{label}</button>
          ))}
          {user.role === "admin" && <Link to="/admin">Admin dashboard</Link>}
          <button onClick={() => { logout(); navigate("/"); }}>Sign out</button>
        </aside>
        <div className="account-main">
          {tab === "overview" && <Overview user={user} orders={orders} />}
          {tab === "orders" && <OrderList orders={orders} />}
          {tab === "profile" && <Profile />}
          {tab === "security" && <Security />}
        </div>
      </div>
    </section>
  );
}

function Overview({ user, orders }) {
  const active = orders.data?.orders.filter((o) => !["delivered", "cancelled", "pending_payment"].includes(o.status)) || [];
  return (
    <>
      <h1>Hi, {user.firstName}</h1>
      <div className="stat-grid">
        <div className="card">
          <span className="muted small">Membership</span>
          <h3>{user.membership ? `${user.membership[0].toUpperCase()}${user.membership.slice(1)}` : "None"}</h3>
          {!user.membership && <Link to="/membership" className="gold small">Explore plans →</Link>}
        </div>
        <div className="card">
          <span className="muted small">Active orders</span>
          <h3>{active.length}</h3>
        </div>
        <div className="card">
          <span className="muted small">Next step</span>
          <h3 className="small-h">{active.some((o) => o.status === "in_review") ? "Provider reviewing your intake" : active.length ? "Watch for shipping updates" : "Take the free assessment"}</h3>
          {!active.length && <Link to="/assessment" className="gold small">Start →</Link>}
        </div>
      </div>
      <h2 className="sub">Recent orders</h2>
      <OrderList orders={orders} limit={3} />
    </>
  );
}

function OrderList({ orders, limit }) {
  if (orders.loading && !orders.data) return <Loading />;
  if (orders.error) return <ErrorState error={orders.error} onRetry={orders.reload} />;
  const list = limit ? orders.data.orders.slice(0, limit) : orders.data.orders;
  if (!list.length) return <div className="card"><p className="muted">No orders yet. <Link to="/shop" className="gold">Shop treatments →</Link></p></div>;
  return (
    <div className="order-list">
      {list.map((o) => (
        <Link to={`/account/orders/${o.id}`} className="card order-row" key={o.id}>
          <div>
            <strong>{o.number}</strong>
            <span className="muted small">{formatDate(o.createdAt)} · {o.items.map((i) => i.name).join(", ")}</span>
          </div>
          <StatusPill status={o.status} />
          <strong>{money(o.totalCents)}</strong>
        </Link>
      ))}
    </div>
  );
}

function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    firstName: user.firstName, lastName: user.lastName, phone: user.phone,
    address: { firstName: "", lastName: "", line1: "", line2: "", city: "", state: "", zip: "", phone: "", ...(user.address || {}) },
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setAddr = (k) => (e) => setForm({ ...form, address: { ...form.address, [k]: e.target.value } });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const address = { ...form.address, firstName: form.address.firstName || form.firstName, lastName: form.address.lastName || form.lastName, phone: form.address.phone || form.phone };
      await updateProfile({ ...form, address: form.address.line1 ? address : null });
      toast("Profile saved");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Profile</h2>
      <div className="row2">
        <label>First name<input className="input" value={form.firstName} onChange={set("firstName")} required /></label>
        <label>Last name<input className="input" value={form.lastName} onChange={set("lastName")} required /></label>
      </div>
      <label>Phone<input className="input" type="tel" value={form.phone} onChange={set("phone")} /></label>
      <h3>Default shipping address</h3>
      <label>Street address<input className="input" value={form.address.line1} onChange={setAddr("line1")} /></label>
      <label>Apartment, suite<input className="input" value={form.address.line2} onChange={setAddr("line2")} /></label>
      <div className="row3">
        <label>City<input className="input" value={form.address.city} onChange={setAddr("city")} /></label>
        <label>State
          <select className="input" value={form.address.state} onChange={setAddr("state")}>
            <option value="">—</option>
            {US_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>ZIP<input className="input" value={form.address.zip} onChange={setAddr("zip")} /></label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-gold" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

function Security() {
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/auth/password", { method: "POST", body: form });
      setForm({ currentPassword: "", newPassword: "" });
      toast("Password updated");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Change password</h2>
      <label>Current password<input className="input" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required /></label>
      <label>New password<input className="input" type="password" autoComplete="new-password" minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required /></label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-gold">Update password</button>
    </form>
  );
}
