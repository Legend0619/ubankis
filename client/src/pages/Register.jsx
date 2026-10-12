import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { safeNext } from "./Login.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const next = safeNext(params);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (user) return <Navigate to={next} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(form);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <section className="section auth">
      <form className="card form auth-card" onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="muted">Start your personalized treatment plan.</p>
        <div className="row2">
          <label>First name<input className="input" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} required /></label>
          <label>Last name<input className="input" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} required /></label>
        </div>
        <label>Email<input className="input" type="email" autoComplete="email" value={form.email} onChange={set("email")} required /></label>
        <label>Password<input className="input" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={set("password")} required /></label>
        <p className="muted small">At least 8 characters.</p>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-gold btn-block" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
        <p className="muted small center">Already have an account? <Link className="gold" to={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></p>
      </form>
    </section>
  );
}
