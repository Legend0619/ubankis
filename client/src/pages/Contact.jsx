import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHero } from "../components/Sections.jsx";

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ busy: false, error: "", sent: false });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setStatus({ busy: true, error: "", sent: false });
    try {
      await api("/contact", { method: "POST", body: form });
      setStatus({ busy: false, error: "", sent: true });
    } catch (err) {
      setStatus({ busy: false, error: err.message, sent: false });
    }
  }

  return (
    <>
      <PageHero eyebrow="Contact" title="We're here to help">
        Questions about a treatment, an order or your account? Our care team replies within one business day.
      </PageHero>
      <section className="section tight">
        <div className="container split">
          <div className="contact-info">
            <div><h4>Email</h4><p><a href="mailto:support@ubankis.com" className="gold">support@ubankis.com</a></p></div>
            <div>
              <h4>Address</h4>
              <address>Ubankis Health, Inc.<br />1200 Wellness Way, Suite 400<br />Austin, TX 78701</address>
            </div>
            <div><h4>Phone</h4><p>(800) 555-0142 · Mon–Fri, 8am–6pm CT</p></div>
            <div><h4>Existing patients</h4><p>Sign in to your account to view orders and treatment status.</p></div>
          </div>
          {status.sent ? (
            <div className="card center">
              <h3>Message sent</h3>
              <p className="muted">Thanks, {form.name.split(" ")[0]}. We'll get back to you at {form.email}.</p>
            </div>
          ) : (
            <form className="card form" onSubmit={submit}>
              <div className="row2">
                <label>Name<input className="input" value={form.name} onChange={set("name")} required /></label>
                <label>Email<input className="input" type="email" value={form.email} onChange={set("email")} required /></label>
              </div>
              <label>Subject<input className="input" value={form.subject} onChange={set("subject")} required /></label>
              <label>Message<textarea className="input" rows={5} value={form.message} onChange={set("message")} required minLength={10} /></label>
              {status.error && <p className="form-error">{status.error}</p>}
              <button className="btn btn-gold" disabled={status.busy}>{status.busy ? "Sending…" : "Send message"}</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
