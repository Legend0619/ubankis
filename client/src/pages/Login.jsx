import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function safeNext(params) {
  const next = params.get("next") || "";
  // Only same-origin paths; browsers treat "//" and "/\" as protocol-relative URLs.
  return /^\/(?![/\\])/.test(next) && !next.includes("\\") ? next : "/account";
}

export default function Login() {
  const { user, login } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const next = safeNext(params);

  if (user) return <Navigate to={next} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <section className="section auth">
      <form className="card form auth-card" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to your Ubankis account.</p>
        <label>Email<input className="input" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        <label>Password<input className="input" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-gold btn-block" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="muted small center">New to Ubankis? <Link className="gold" to={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link></p>
        <p className="demo-note small">Demo accounts: <code>demo@ubankis.com</code> / <code>demo1234</code> · admin: <code>admin@ubankis.com</code> / <code>admin1234</code></p>
      </form>
    </section>
  );
}
