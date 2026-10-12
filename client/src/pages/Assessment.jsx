import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import ProductArt from "../components/ProductArt.jsx";
import { money, unitLabel } from "../format.js";

const QUESTIONS = [
  { key: "goal", q: "What's your main goal?", options: [
    ["energy", "More energy, strength & drive"], ["weight", "Lose weight"], ["recovery", "Recovery, sleep & performance"],
    ["performance", "Sexual performance"], ["hair", "Fuller hair"], ["aging", "Healthy aging & longevity"],
  ] },
  { key: "sex", q: "What was your sex assigned at birth?", options: [["male", "Male"], ["female", "Female"]] },
  { key: "age", q: "What's your age range?", options: [["18-29", "18–29"], ["30-39", "30–39"], ["40-49", "40–49"], ["50+", "50+"]] },
  { key: "symptoms", q: "Which of these do you experience?", multi: true, options: [
    ["fatigue", "Low energy or fatigue"], ["libido", "Low libido"], ["weight", "Stubborn weight gain"], ["sleep", "Poor sleep"],
    ["focus", "Brain fog"], ["recovery", "Slow recovery"], ["mood", "Low mood or irritability"], ["none", "None of these"],
  ] },
  { key: "labs", q: "Have you had blood work in the last 6 months?", options: [["yes", "Yes"], ["no", "No"], ["unsure", "Not sure"]] },
  { key: "timeline", q: "How soon do you want to start?", options: [["asap", "As soon as possible"], ["month", "Within a month"], ["exploring", "Just exploring"]] },
];

export default function Assessment() {
  const { user } = useAuth();
  const { add } = useCart();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ symptoms: [] });
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const total = QUESTIONS.length + (user ? 0 : 1);
  const q = QUESTIONS[step];

  function pick(value) {
    if (q.multi) {
      const cur = answers[q.key];
      const next = value === "none" ? ["none"] : cur.includes(value) ? cur.filter((v) => v !== value) : [...cur.filter((v) => v !== "none"), value];
      setAnswers({ ...answers, [q.key]: next });
      return;
    }
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (step + 1 < QUESTIONS.length || !user) setStep(step + 1);
    else submit(next);
  }

  async function submit(final = answers) {
    setBusy(true);
    setError("");
    try {
      setResult(await api("/assessments", { method: "POST", body: { answers: final, email: email || undefined } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <section className="section">
        <div className="container narrow">
          <div className="quiz-result">
            <div className="check">✓</div>
            <p className="eyebrow">Your recommendation</p>
            <h1>You may be a great fit for {result.category.name}</h1>
            <p className="lead">{result.category.tagline} Here's where most patients with your goals start. A licensed provider confirms your plan after a short medical intake at checkout.</p>
          </div>
          <div className="rec-list">
            {result.labPanel && <Rec product={result.labPanel} badge="Recommended first step" onAdd={() => add(result.labPanel)} />}
            {result.products.map((p) => <Rec key={p.id} product={p} onAdd={() => add(p)} />)}
          </div>
          <p className="center" style={{ marginTop: "2rem" }}>
            <Link to={`/treatments/${result.category.slug}`} className="gold">Learn more about {result.category.name} →</Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container quiz">
        <div className="progress"><i style={{ width: `${(step / total) * 100}%` }} /></div>
        <p className="eyebrow">Question {step + 1} of {total}</p>

        {q ? (
          <>
            <h2>{q.q}</h2>
            {q.multi && <p className="muted">Select all that apply.</p>}
            <div className="quiz-opts">
              {q.options.map(([value, label]) => {
                const picked = q.multi ? answers[q.key].includes(value) : answers[q.key] === value;
                return <button key={value} className={picked ? "picked" : ""} onClick={() => pick(value)} disabled={busy}>{label}</button>;
              })}
            </div>
            {q.multi && (
              <button className="btn btn-gold" style={{ marginTop: "1.2rem" }} disabled={!answers[q.key].length}
                onClick={() => setStep(step + 1)}>Continue</button>
            )}
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <h2>Where should we send your results?</h2>
            <p className="muted">We'll email your personalized recommendation. Optional — you can skip this.</p>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ margin: "1.2rem 0" }} />
            <button className="btn btn-gold" disabled={busy}>{busy ? "Analyzing…" : "See my results"}</button>
          </form>
        )}
        {error && <p className="form-error">{error}</p>}
        {step > 0 && <button className="quiz-back" onClick={() => setStep(step - 1)}>← Back</button>}
      </div>
    </section>
  );
}

function Rec({ product, badge, onAdd }) {
  return (
    <div className="rec">
      <ProductArt product={product} className="thumb" />
      <div className="grow">
        {badge && <span className="pill">{badge}</span>}
        <h4><Link to={`/products/${product.slug}`}>{product.name}</Link></h4>
        <p className="muted small">{product.shortDesc}</p>
      </div>
      <div className="rec-buy">
        <strong>{money(product.priceCents)}<small className="muted"> {unitLabel(product.unit)}</small></strong>
        <button className="btn btn-gold btn-sm" onClick={onAdd}>Add</button>
      </div>
    </div>
  );
}
