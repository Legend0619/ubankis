import { STATUS_LABELS } from "../format.js";

export function StatusPill({ status }) {
  return <span className={`status status-${status}`}>{STATUS_LABELS[status] || status}</span>;
}

const FLOW = ["pending_payment", "in_review", "processing", "shipped", "delivered"];

export function StatusTracker({ order }) {
  if (order.status === "cancelled") return <p className="notice">This order was cancelled.</p>;
  const flow = order.requiresReview ? FLOW : FLOW.filter((s) => s !== "in_review");
  const current = flow.indexOf(order.status);
  return (
    <ol className="tracker">
      {flow.map((s, i) => (
        <li key={s} className={i < current ? "done" : i === current ? "current" : ""}>
          <span className="dot" />
          {s === "pending_payment" ? (i < current ? "Paid" : "Awaiting payment") : STATUS_LABELS[s]}
        </li>
      ))}
    </ol>
  );
}
