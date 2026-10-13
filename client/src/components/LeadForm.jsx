import { useState } from "react";
import { api } from "../api.js";
import { BUDGETS, SERVICES } from "../data/site.js";
import Icon from "./Icon.jsx";

/**
 * Inquiry form. "contact" is a short message form; "analysis" asks for the
 * website, services and budget needed to prepare a free business analysis.
 */
export default function LeadForm({ source = "contact", initialService = "" }) {
  const isAnalysis = source === "analysis";
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", website: "",
    services: initialService ? [initialService] : [], budget: "", message: "",
  });
  const [status, setStatus] = useState({ busy: false, error: "", sent: false });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleService = (slug) =>
    setForm({ ...form, services: form.services.includes(slug) ? form.services.filter((s) => s !== slug) : [...form.services, slug] });

  async function submit(e) {
    e.preventDefault();
    setStatus({ busy: true, error: "", sent: false });
    try {
      await api("/leads", { method: "POST", body: { ...form, source } });
      setStatus({ busy: false, error: "", sent: true });
    } catch (err) {
      setStatus({ busy: false, error: err.message, sent: false });
    }
  }

  if (status.sent) {
    return (
      <div className="card center sent">
        <div className="check"><Icon name="check" size={28} /></div>
        <h3>{isAnalysis ? "Request received" : "Message sent"}</h3>
        <p className="muted">
          Thanks, {form.name.split(" ")[0]}.{" "}
          {isAnalysis
            ? "A strategist will review your business and send your free analysis within 2 business days."
            : `We'll get back to you at ${form.email} within one business day.`}
        </p>
      </div>
    );
  }

  return (
    <form className="card form" onSubmit={submit}>
      <div className="row2">
        <label>Full name<input className="input" value={form.name} onChange={set("name")} autoComplete="name" required /></label>
        <label>Email<input className="input" type="email" value={form.email} onChange={set("email")} autoComplete="email" required /></label>
      </div>
      <div className="row2">
        <label>Phone {isAnalysis ? "" : "(optional)"}<input className="input" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" /></label>
        <label>Company {isAnalysis ? "" : "(optional)"}<input className="input" value={form.company} onChange={set("company")} autoComplete="organization" required={isAnalysis} /></label>
      </div>
      {isAnalysis && (
        <label>Website<input className="input" value={form.website} onChange={set("website")} placeholder="yourbusiness.com" autoComplete="url" required /></label>
      )}
      <fieldset className="chips">
        <legend>{isAnalysis ? "What should we analyze?" : "What can we help with? (optional)"}</legend>
        {SERVICES.map((s) => (
          <label key={s.slug} className={`chip ${form.services.includes(s.slug) ? "on" : ""}`}>
            <input type="checkbox" checked={form.services.includes(s.slug)} onChange={() => toggleService(s.slug)} />
            {s.short}
          </label>
        ))}
      </fieldset>
      {isAnalysis && (
        <label>Monthly marketing budget
          <select className="input" value={form.budget} onChange={set("budget")}>
            <option value="">Select a range (optional)</option>
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
      )}
      <label>{isAnalysis ? "Your goals (optional)" : "Message"}
        <textarea className="input" rows={4} value={form.message} onChange={set("message")} required={!isAnalysis} minLength={isAnalysis ? undefined : 10}
          placeholder={isAnalysis ? "e.g. more booked appointments, lower cost per lead…" : "Tell us about your project"} />
      </label>
      {status.error && <p className="form-error">{status.error}</p>}
      <button className="btn btn-gold btn-block" disabled={status.busy || (isAnalysis && !form.services.length)}>
        {status.busy ? "Sending…" : isAnalysis ? "Get My Free Analysis" : "Send Message"}
      </button>
    </form>
  );
}
