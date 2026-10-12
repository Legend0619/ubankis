import { useState } from "react";

const formatNumber = (v) => v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
const formatExp = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

/** Demo-mode card form. The server validates the card; nothing is actually charged. */
export default function CardForm({ onSubmit, busy, error, submitLabel }) {
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvc: "" });

  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); onSubmit(card); }}>
      <label>Name on card<input className="input" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} autoComplete="cc-name" required /></label>
      <label>Card number
        <input className="input" inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234"
          value={card.number} onChange={(e) => setCard({ ...card, number: formatNumber(e.target.value) })} required />
      </label>
      <div className="row2">
        <label>Expiry<input className="input" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: formatExp(e.target.value) })} required /></label>
        <label>CVC<input className="input" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} required /></label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-gold btn-block" disabled={busy}>{busy ? "Processing…" : submitLabel}</button>
      <p className="muted small center">🔒 Payments are encrypted and processed securely.</p>
    </form>
  );
}
