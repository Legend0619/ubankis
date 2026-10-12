export function money(cents) {
  const dollars = cents / 100;
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
  });
}

export const unitLabel = (unit) => ({ mo: "/mo", yr: "/yr", "one-time": "one-time" })[unit] || "";

export const STATUS_LABELS = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  in_review: "Provider review",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function formatDate(sqlDate, withTime = false) {
  // SQLite CURRENT_TIMESTAMP is UTC without a zone marker.
  const d = new Date(sqlDate.includes("T") ? sqlDate : `${sqlDate.replace(" ", "T")}Z`);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];
