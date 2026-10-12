import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, useApi } from "../api.js";
import { useToast } from "../context/ToastContext.jsx";
import { StatusPill } from "../components/OrderStatus.jsx";
import { ErrorState, Loading } from "../components/States.jsx";
import { formatDate, money, STATUS_LABELS } from "../format.js";

const TABS = [["dashboard", "Dashboard"], ["orders", "Orders"], ["products", "Products"], ["customers", "Customers"], ["intakes", "Assessments & intakes"], ["messages", "Messages"]];

export default function Admin() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "dashboard";
  return (
    <section className="section tight">
      <div className="container">
        <h1 className="admin-title">Admin</h1>
        <div className="filters admin-tabs">
          {TABS.map(([k, label]) => (
            <button key={k} className={tab === k ? "active" : ""} onClick={() => setParams({ tab: k })}>{label}</button>
          ))}
        </div>
        {tab === "dashboard" && <Dashboard />}
        {tab === "orders" && <Orders />}
        {tab === "products" && <Products />}
        {tab === "customers" && <Customers />}
        {tab === "intakes" && <Consultations />}
        {tab === "messages" && <Messages />}
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
            <div className="card"><span className="muted small">Revenue</span><h3>{money(s.revenueCents)}</h3></div>
            <div className="card"><span className="muted small">Paid orders</span><h3>{s.orders}</h3></div>
            <div className="card"><span className="muted small">Awaiting provider review</span><h3>{s.inReview}</h3></div>
            <div className="card"><span className="muted small">Customers · members</span><h3>{s.customers} · {s.members}</h3></div>
          </div>
          <div className="split-2">
            <div className="card">
              <h3>Recent orders</h3>
              <table className="table">
                <tbody>
                  {s.recent.map((o) => (
                    <tr key={o.id}><td>{o.number}</td><td>{o.customer.name}</td><td><StatusPill status={o.status} /></td><td className="num">{money(o.totalCents)}</td></tr>
                  ))}
                </tbody>
              </table>
              {!s.recent.length && <p className="muted">No orders yet.</p>}
            </div>
            <div className="card">
              <h3>Top products</h3>
              <table className="table">
                <tbody>
                  {s.topProducts.map((p) => (
                    <tr key={p.name}><td>{p.name}</td><td className="num">{p.units} sold</td><td className="num">{money(p.revenueCents)}</td></tr>
                  ))}
                </tbody>
              </table>
              {!s.topProducts.length && <p className="muted">No sales yet.</p>}
            </div>
          </div>
        </>
      )}
    </Guard>
  );
}

function Orders() {
  const [status, setStatus] = useState("");
  const q = useApi(`/admin/orders${status ? `?status=${status}` : ""}`);
  const [openId, setOpenId] = useState(null);
  return (
    <>
      <div className="toolbar">
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).filter(([k]) => k !== "paid").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <Guard q={q}>
        {(d) => (
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Status</th><th className="num">Total</th><th /></tr></thead>
              <tbody>
                {d.orders.map((o) => (
                  <OrderRow key={o.id} order={o} open={openId === o.id} onToggle={() => setOpenId(openId === o.id ? null : o.id)} onChange={q.reload} />
                ))}
              </tbody>
            </table>
            {!d.orders.length && <p className="muted">No orders.</p>}
          </div>
        )}
      </Guard>
    </>
  );
}

const NEXT_STATUSES = ["in_review", "processing", "shipped", "delivered", "cancelled"];

function OrderRow({ order: o, open, onToggle, onChange }) {
  const toast = useToast();
  const detail = useApi(open ? `/admin/orders/${o.id}` : null);
  const [note, setNote] = useState("");

  async function setStatus(status) {
    try {
      await api(`/admin/orders/${o.id}`, { method: "PATCH", body: { status, note } });
      toast(`${o.number} → ${STATUS_LABELS[status]}`);
      setNote("");
      onChange();
    } catch (err) {
      toast(err.message, "error");
    }
  }

  return (
    <>
      <tr>
        <td><strong>{o.number}</strong></td>
        <td>{formatDate(o.createdAt)}</td>
        <td>{o.customer.name}<br /><span className="muted small">{o.customer.email}</span></td>
        <td className="small">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</td>
        <td><StatusPill status={o.status} /></td>
        <td className="num">{money(o.totalCents)}</td>
        <td><button className="btn btn-ghost btn-sm" onClick={onToggle}>{open ? "Close" : "Manage"}</button></td>
      </tr>
      {open && (
        <tr className="detail-row">
          <td colSpan={7}>
            {!detail.data ? <Loading /> : (
              <div className="split-2">
                <div>
                  <h4>Update status</h4>
                  {o.status === "pending_payment" ? <p className="muted">Awaiting payment — no actions available.</p> : (
                    <>
                      <input className="input" placeholder="Note to include in history (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                      <div className="btn-row">
                        {NEXT_STATUSES.filter((s) => s !== o.status).map((s) => (
                          <button key={s} className={`btn btn-sm ${s === "cancelled" ? "btn-ghost" : "btn-gold"}`} onClick={() => setStatus(s)}>
                            {s === "processing" && o.status === "in_review" ? "Approve" : STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {o.shippingAddress && (
                    <p className="small" style={{ marginTop: "1rem" }}>
                      <strong>Ship to:</strong> {o.shippingAddress.firstName} {o.shippingAddress.lastName}, {o.shippingAddress.line1}{o.shippingAddress.line2 && `, ${o.shippingAddress.line2}`}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zip} · {o.shippingAddress.phone}
                    </p>
                  )}
                </div>
                <div>
                  <h4>Medical intake</h4>
                  {detail.data.intake ? (
                    <dl className="kv">
                      <div><dt>DOB</dt><dd>{detail.data.intake.dob}</dd></div>
                      <div><dt>Sex</dt><dd>{detail.data.intake.sex}</dd></div>
                      <div><dt>Height / weight</dt><dd>{detail.data.intake.heightIn || "—"} in · {detail.data.intake.weightLb || "—"} lb</dd></div>
                      <div><dt>Conditions</dt><dd>{detail.data.intake.conditions}</dd></div>
                      <div><dt>Medications</dt><dd>{detail.data.intake.medications}</dd></div>
                      <div><dt>Allergies</dt><dd>{detail.data.intake.allergies}</dd></div>
                    </dl>
                  ) : <p className="muted">No prescription items — intake not required.</p>}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

const EMPTY_PRODUCT = { name: "", slug: "", categorySlug: "", shortDesc: "", description: "", priceCents: 0, unit: "mo", rx: true, bestSeller: false, form: "bottle", imageUrl: "", benefits: [], usage: "", active: true };

function Products() {
  const q = useApi("/admin/products");
  const cats = useApi("/categories");
  const [editing, setEditing] = useState(null);
  return (
    <>
      <div className="toolbar">
        <button className="btn btn-gold btn-sm" onClick={() => setEditing(EMPTY_PRODUCT)}>+ New product</button>
      </div>
      {editing && (
        <ProductForm
          product={editing}
          categories={cats.data?.categories || []}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); q.reload(); }}
        />
      )}
      <Guard q={q}>
        {(d) => (
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Product</th><th>Category</th><th>Type</th><th className="num">Price</th><th>Status</th><th /></tr></thead>
              <tbody>
                {d.products.map((p) => (
                  <tr key={p.id} className={p.active ? "" : "inactive"}>
                    <td><strong>{p.name}</strong><br /><span className="muted small">/{p.slug}</span></td>
                    <td>{p.categoryName || (p.kind === "membership" ? "Membership" : "—")}</td>
                    <td>{p.rx ? "Rx" : "OTC"}{p.bestSeller ? " · ★" : ""}</td>
                    <td className="num">{money(p.priceCents)}</td>
                    <td>{p.active ? "Active" : "Hidden"}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Guard>
    </>
  );
}

function ProductForm({ product, categories, onClose, onSaved }) {
  const toast = useToast();
  const isNew = !product.id;
  const [f, setF] = useState({ ...product, price: (product.priceCents / 100).toFixed(2), benefitsText: product.benefits.join("\n") });
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    const body = {
      name: f.name, slug: f.slug, categorySlug: f.categorySlug || null, shortDesc: f.shortDesc, description: f.description,
      priceCents: Math.round(Number(f.price) * 100), unit: f.unit, rx: f.rx, bestSeller: f.bestSeller, form: f.form,
      imageUrl: f.imageUrl, usage: f.usage, active: f.active, benefits: f.benefitsText.split("\n"),
    };
    try {
      await api(isNew ? "/admin/products" : `/admin/products/${product.id}`, { method: isNew ? "POST" : "PATCH", body });
      toast(isNew ? "Product created" : "Product saved");
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card form product-form" onSubmit={submit}>
      <h3>{isNew ? "New product" : `Edit ${product.name}`}</h3>
      <div className="row2">
        <label>Name<input className="input" value={f.name} onChange={set("name")} required /></label>
        <label>Slug<input className="input" value={f.slug} onChange={set("slug")} pattern="[a-z0-9-]+" required /></label>
      </div>
      <div className="row3">
        {product.kind !== "membership" && (
          <label>Category
            <select className="input" value={f.categorySlug || ""} onChange={set("categorySlug")} required>
              <option value="">—</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
        )}
        <label>Price (USD)<input className="input" type="number" step="0.01" min="0" value={f.price} onChange={set("price")} required /></label>
        <label>Billing
          <select className="input" value={f.unit} onChange={set("unit")}>
            <option value="mo">Monthly</option><option value="one-time">One-time</option><option value="yr">Yearly</option>
          </select>
        </label>
        {product.kind !== "membership" && (
          <label>Packaging art
            <select className="input" value={f.form} onChange={set("form")}>
              <option value="vial">Vial</option><option value="bottle">Bottle</option><option value="box">Box</option><option value="kit">Kit</option>
            </select>
          </label>
        )}
      </div>
      <label>Short description<input className="input" value={f.shortDesc} onChange={set("shortDesc")} required /></label>
      <label>Description<textarea className="input" rows={3} value={f.description} onChange={set("description")} /></label>
      <label>Benefits (one per line)<textarea className="input" rows={3} value={f.benefitsText} onChange={set("benefitsText")} /></label>
      <label>How to use<input className="input" value={f.usage} onChange={set("usage")} /></label>
      <label>Image URL (optional — replaces generated art)<input className="input" value={f.imageUrl || ""} onChange={set("imageUrl")} placeholder="/images/my-product.jpg" /></label>
      <div className="btn-row">
        <label className="checkbox"><input type="checkbox" checked={f.rx} onChange={set("rx")} /> <span>Prescription</span></label>
        <label className="checkbox"><input type="checkbox" checked={f.bestSeller} onChange={set("bestSeller")} /> <span>Best seller</span></label>
        <label className="checkbox"><input type="checkbox" checked={f.active} onChange={set("active")} /> <span>Visible in store</span></label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button className="btn btn-gold">{isNew ? "Create product" : "Save changes"}</button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

function Customers() {
  const q = useApi("/admin/customers");
  return (
    <Guard q={q}>
      {(d) => (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Membership</th><th className="num">Orders</th><th className="num">Spent</th><th>Joined</th></tr></thead>
            <tbody>
              {d.customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.firstName} {c.lastName}</td><td>{c.email}</td><td>{c.role}</td><td>{c.membership || "—"}</td>
                  <td className="num">{c.orderCount}</td><td className="num">{money(c.spentCents)}</td><td>{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Guard>
  );
}

function Consultations() {
  const q = useApi("/admin/consultations");
  return (
    <Guard q={q}>
      {(d) => (
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Date</th><th>Type</th><th>Email</th><th>Details</th><th>Status</th></tr></thead>
            <tbody>
              {d.consultations.map((c) => (
                <tr key={c.id}>
                  <td>{formatDate(c.createdAt, true)}</td>
                  <td>{c.type === "intake" ? `Intake · order #${c.orderId}` : "Assessment"}</td>
                  <td>{c.email || <span className="muted">anonymous</span>}</td>
                  <td className="small">
                    {c.type === "assessment"
                      ? <>→ <strong>{c.recommendedCategory}</strong> · {Object.entries(c.answers).map(([k, v]) => `${k}: ${[].concat(v).join("/")}`).join(" · ")}</>
                      : <>DOB {c.answers.dob} · {c.answers.sex} · meds: {c.answers.medications}</>}
                  </td>
                  <td>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!d.consultations.length && <p className="muted">Nothing yet.</p>}
        </div>
      )}
    </Guard>
  );
}

function Messages() {
  const q = useApi("/admin/messages");
  return (
    <Guard q={q}>
      {(d) => (
        <div className="split-2">
          <div className="card">
            <h3>Contact messages</h3>
            {d.messages.length ? d.messages.map((m) => (
              <div className="review-row" key={m.id}>
                <h4>{m.subject}</h4>
                <p>{m.body}</p>
                <span className="muted small">{m.name} · {m.email} · {formatDate(m.created_at, true)}</span>
              </div>
            )) : <p className="muted">No messages.</p>}
          </div>
          <div className="card">
            <h3>Newsletter subscribers ({d.subscribers.length})</h3>
            <ul className="plain-list">
              {d.subscribers.map((s) => <li key={s.email}>{s.email} <span className="muted small">{formatDate(s.created_at)}</span></li>)}
            </ul>
          </div>
        </div>
      )}
    </Guard>
  );
}
