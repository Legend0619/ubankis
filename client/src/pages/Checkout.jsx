import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, useApi } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import CardForm from "../components/CardForm.jsx";
import { Totals } from "../components/CartDrawer.jsx";
import ProductArt from "../components/ProductArt.jsx";
import { Loading } from "../components/States.jsx";
import { money, US_STATES } from "../format.js";

export default function Checkout() {
  const { user } = useAuth();
  const { items, quote, clear } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const health = useApi("/health");

  const [address, setAddress] = useState(() => ({
    firstName: user.firstName, lastName: user.lastName, line1: "", line2: "", city: "", state: "", zip: "", phone: user.phone || "",
    ...(user.address || {}),
  }));
  const [intake, setIntake] = useState({ dob: "", sex: "", heightIn: "", weightLb: "", conditions: "", medications: "", allergies: "", consent: false });
  const [stepIndex, setStepIndex] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // A changed cart invalidates any order created for the previous contents.
  useEffect(() => {
    setOrderId(null);
  }, [items]);

  if (!items.length) {
    return (
      <section className="section">
        <div className="container center">
          <h1>Your cart is empty</h1>
          <p className="lead" style={{ margin: "1rem auto 2rem" }}>Add a treatment to get started.</p>
          <Link to="/shop" className="btn btn-gold">Shop treatments</Link>
        </div>
      </section>
    );
  }
  if (!quote || !health.data) return <Loading />;

  const steps = [
    quote.hasPhysical && "shipping",
    quote.requiresReview && "intake",
    "payment",
  ].filter(Boolean);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const mode = health.data.paymentMode;

  const next = (e) => {
    e.preventDefault();
    setError("");
    setStepIndex((i) => i + 1);
  };

  async function ensureOrder() {
    if (orderId) return { id: orderId };
    const { order, payment } = await api("/orders", {
      method: "POST",
      body: {
        items: items.map(({ productId, qty }) => ({ productId, qty })),
        promoCode: quote.promo?.code || "",
        shipping: quote.hasPhysical ? address : undefined,
        intake: quote.requiresReview ? { ...intake, heightIn: Number(intake.heightIn) || null, weightLb: Number(intake.weightLb) || null } : undefined,
      },
    });
    setOrderId(order.id);
    if (payment.mode === "stripe") {
      window.location.assign(payment.url);
      return null;
    }
    return order;
  }

  async function pay(card) {
    setBusy(true);
    setError("");
    try {
      const order = await ensureOrder();
      if (!order) return; // Redirecting to Stripe.
      await api(`/orders/${order.id}/pay`, { method: "POST", body: { card } });
      clear();
      navigate(`/checkout/success/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const setA = (k) => (e) => setAddress({ ...address, [k]: e.target.value });
  const setI = (k) => (e) => setIntake({ ...intake, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <section className="section tight">
      <div className="container checkout">
        <div>
          <h1 className="checkout-title">Checkout</h1>
          {params.get("cancelled") && <p className="notice">Payment was cancelled. You can try again below.</p>}
          <ol className="stepper">
            {steps.map((s, i) => (
              <li key={s} className={i === steps.indexOf(step) ? "current" : i < steps.indexOf(step) ? "done" : ""}>
                <button type="button" disabled={i > steps.indexOf(step)} onClick={() => setStepIndex(i)}>
                  {{ shipping: "Shipping", intake: "Medical intake", payment: "Payment" }[s]}
                </button>
              </li>
            ))}
          </ol>

          {step === "shipping" && (
            <form className="card form" onSubmit={next}>
              <h3>Shipping address</h3>
              <div className="row2">
                <label>First name<input className="input" value={address.firstName} onChange={setA("firstName")} required /></label>
                <label>Last name<input className="input" value={address.lastName} onChange={setA("lastName")} required /></label>
              </div>
              <label>Street address<input className="input" value={address.line1} onChange={setA("line1")} autoComplete="address-line1" required /></label>
              <label>Apartment, suite (optional)<input className="input" value={address.line2} onChange={setA("line2")} autoComplete="address-line2" /></label>
              <div className="row3">
                <label>City<input className="input" value={address.city} onChange={setA("city")} required /></label>
                <label>State
                  <select className="input" value={address.state} onChange={setA("state")} required>
                    <option value="">—</option>
                    {US_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label>ZIP<input className="input" value={address.zip} onChange={setA("zip")} inputMode="numeric" pattern="\d{5}(-\d{4})?" required /></label>
              </div>
              <label>Phone<input className="input" type="tel" value={address.phone} onChange={setA("phone")} required /></label>
              <button className="btn btn-gold">Continue</button>
            </form>
          )}

          {step === "intake" && (
            <form className="card form" onSubmit={next}>
              <h3>Medical intake</h3>
              <p className="muted small">Your cart includes prescription treatments. A licensed provider reviews this information before anything is dispensed. It's confidential and protected under HIPAA.</p>
              <div className="row2">
                <label>Date of birth<input className="input" type="date" value={intake.dob} onChange={setI("dob")} required /></label>
                <label>Sex assigned at birth
                  <select className="input" value={intake.sex} onChange={setI("sex")} required>
                    <option value="">—</option><option>Male</option><option>Female</option>
                  </select>
                </label>
              </div>
              <div className="row2">
                <label>Height (inches)<input className="input" type="number" min="36" max="96" value={intake.heightIn} onChange={setI("heightIn")} /></label>
                <label>Weight (lb)<input className="input" type="number" min="60" max="700" value={intake.weightLb} onChange={setI("weightLb")} /></label>
              </div>
              <label>Medical conditions<textarea className="input" rows={2} placeholder="e.g. high blood pressure, diabetes — or “none”" value={intake.conditions} onChange={setI("conditions")} /></label>
              <label>Current medications & supplements<textarea className="input" rows={2} value={intake.medications} onChange={setI("medications")} /></label>
              <label>Allergies<input className="input" value={intake.allergies} onChange={setI("allergies")} /></label>
              <label className="checkbox">
                <input type="checkbox" checked={intake.consent} onChange={setI("consent")} required />
                <span>I confirm this information is accurate and consent to a telehealth evaluation. I understand a provider may decline to prescribe, in which case I'll be refunded for that item.</span>
              </label>
              <button className="btn btn-gold">Continue to payment</button>
            </form>
          )}

          {step === "payment" && (
            <div className="card">
              <h3>Payment</h3>
              {mode === "stripe" ? (
                <div className="form">
                  <p className="muted">You'll be redirected to Stripe's secure checkout to complete payment.</p>
                  {error && <p className="form-error">{error}</p>}
                  <button className="btn btn-gold btn-block" disabled={busy} onClick={() => pay()}>{busy ? "Redirecting…" : `Pay ${money(quote.totalCents)}`}</button>
                </div>
              ) : (
                <CardForm onSubmit={pay} busy={busy} error={error} submitLabel={`Pay ${money(quote.totalCents)}`} />
              )}
            </div>
          )}
        </div>

        <aside className="card summary">
          <h3>Order summary</h3>
          {quote.lines.map((l) => {
            const item = items.find((i) => i.productId === l.productId) || l;
            return (
              <div className="summary-line" key={l.productId}>
                <ProductArt product={item} className="thumb" />
                <div className="grow">
                  <strong>{l.name}</strong>
                  <span className="muted small">Qty {l.qty}{l.rx ? " · Rx" : ""}</span>
                </div>
                <span>{money(l.lineTotalCents)}</span>
              </div>
            );
          })}
          <Totals quote={quote} />
          {quote.promoError && <p className="form-error small">{quote.promoError} — remove it from your cart to continue.</p>}
        </aside>
      </div>
    </section>
  );
}
