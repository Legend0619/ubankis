import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { ErrorState, Loading } from "../components/States.jsx";
import { money } from "../format.js";

export default function OrderSuccess() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear } = useCart();
  const [state, setState] = useState({ order: null, error: null });

  useEffect(() => {
    const req = sessionId
      ? api(`/orders/${id}/confirm`, { method: "POST", body: { sessionId } })
      : api(`/orders/${id}`);
    req
      .then(({ order }) => {
        if (sessionId && order.status !== "pending_payment") clear();
        setState({ order, error: null });
      })
      .catch((error) => setState({ order: null, error }));
  }, [id, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.error) return <ErrorState error={state.error} />;
  if (!state.order) return <Loading label="Confirming your order…" />;
  const o = state.order;

  return (
    <section className="section">
      <div className="container narrow center">
        <div className="quiz-result">
          <div className="check">✓</div>
          <p className="eyebrow">Order {o.number}</p>
          <h1>Thank you, {o.customer.name.split(" ")[0]}!</h1>
          <p className="lead" style={{ margin: "1rem auto 2rem" }}>
            We've received your payment of <strong>{money(o.totalCents)}</strong>.{" "}
            {o.requiresReview
              ? "A licensed provider will review your medical intake within 24 hours. We'll ship your treatment as soon as it's approved."
              : "Your order is being prepared and will ship within 1–2 business days."}
          </p>
        </div>
        <div className="hero-cta center-row">
          <Link to={`/account/orders/${o.id}`} className="btn btn-gold">Track my order</Link>
          <Link to="/shop" className="btn btn-ghost">Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}
