import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, useApi } from "../api.js";
import { useToast } from "../context/ToastContext.jsx";
import CardForm from "../components/CardForm.jsx";
import { StatusPill, StatusTracker } from "../components/OrderStatus.jsx";
import { ErrorState, Loading } from "../components/States.jsx";
import { formatDate, money, STATUS_LABELS, unitLabel } from "../format.js";

export default function OrderDetail() {
  const { id } = useParams();
  const { data, loading, error, reload } = useApi(`/orders/${id}`);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState("");

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const { order: o, paymentMode } = data;
  const cancellable = ["pending_payment", "in_review", "processing"].includes(o.status);

  async function cancel() {
    if (!window.confirm(`Cancel order ${o.number}?${o.paidAt ? " You'll be refunded in full." : ""}`)) return;
    setBusy(true);
    try {
      await api(`/orders/${o.id}/cancel`, { method: "POST" });
      toast("Order cancelled");
      reload();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function pay(card) {
    setBusy(true);
    setPayError("");
    try {
      await api(`/orders/${o.id}/pay`, { method: "POST", body: { card } });
      toast("Payment received");
      reload();
    } catch (err) {
      setPayError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section tight">
      <div className="container narrow">
        <Link to="/account?tab=orders" className="muted small">← All orders</Link>
        <div className="order-head">
          <div>
            <h1>Order {o.number}</h1>
            <p className="muted">Placed {formatDate(o.createdAt, true)}</p>
          </div>
          <StatusPill status={o.status} />
        </div>

        <StatusTracker order={o} />

        {o.status === "pending_payment" && paymentMode === "demo" && (
          <div className="card">
            <h3>Complete payment</h3>
            <CardForm onSubmit={pay} busy={busy} error={payError} submitLabel={`Pay ${money(o.totalCents)}`} />
          </div>
        )}

        <div className="card">
          <h3>Items</h3>
          {o.items.map((i) => (
            <div className="summary-line" key={i.slug}>
              <div className="grow">
                <strong>{i.kind === "membership" ? i.name : <Link to={`/products/${i.slug}`}>{i.name}</Link>}</strong>
                <span className="muted small">{money(i.unitPriceCents)} {unitLabel(i.unit)} × {i.qty}{i.rx ? " · Rx" : ""}</span>
              </div>
              <span>{money(i.unitPriceCents * i.qty)}</span>
            </div>
          ))}
          <dl className="totals">
            <div><dt>Subtotal</dt><dd>{money(o.subtotalCents)}</dd></div>
            {o.memberDiscountCents > 0 && <div className="discount"><dt>Member savings</dt><dd>−{money(o.memberDiscountCents)}</dd></div>}
            {o.promoDiscountCents > 0 && <div className="discount"><dt>{o.promoCode}</dt><dd>−{money(o.promoDiscountCents)}</dd></div>}
            <div><dt>Shipping</dt><dd>{o.shippingCents ? money(o.shippingCents) : "Free"}</dd></div>
            <div className="grand"><dt>Total</dt><dd>{money(o.totalCents)}</dd></div>
          </dl>
        </div>

        <div className="split-2">
          {o.shippingAddress && (
            <div className="card">
              <h3>Shipping to</h3>
              <p>
                {o.shippingAddress.firstName} {o.shippingAddress.lastName}<br />
                {o.shippingAddress.line1}{o.shippingAddress.line2 && <>, {o.shippingAddress.line2}</>}<br />
                {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zip}
              </p>
            </div>
          )}
          <div className="card">
            <h3>History</h3>
            <ul className="events">
              {[...o.events].reverse().map((e, i) => (
                <li key={i}>
                  <strong>{STATUS_LABELS[e.status] || e.status}</strong>
                  {e.note && <span>{e.note}</span>}
                  <span className="muted small">{formatDate(e.at, true)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {cancellable && (
          <button className="btn btn-ghost btn-sm" onClick={cancel} disabled={busy}>Cancel order</button>
        )}
      </div>
    </section>
  );
}
