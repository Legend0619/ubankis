import { useState } from "react";
import { Link } from "react-router-dom";
import { api, useApi } from "../api.js";
import { useToast } from "../context/ToastContext.jsx";
import Logo from "./Logo.jsx";

export default function Footer() {
  const { data } = useApi("/categories");
  const toast = useToast();
  const [email, setEmail] = useState("");

  async function subscribe(e) {
    e.preventDefault();
    try {
      await api("/newsletter", { method: "POST", body: { email } });
      setEmail("");
      toast("You're on the list. Welcome to Ubankis!");
    } catch (err) {
      toast(err.message, "error");
    }
  }

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="muted">Modern healthcare, delivered. Physician-guided treatment for the way you want to live.</p>
          <form className="newsletter" onSubmit={subscribe}>
            <input type="email" placeholder="Email address" required aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn btn-gold btn-sm">Join</button>
          </form>
        </div>
        <div>
          <h4>Treatments</h4>
          {data?.categories.map((c) => <Link key={c.slug} to={`/treatments/${c.slug}`}>{c.name}</Link>)}
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/membership">Membership</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <div>
          <h4>Support</h4>
          <Link to="/contact">Contact Us</Link>
          <Link to="/account">Patient Portal</Link>
          <Link to="/assessment">Free Assessment</Link>
          <Link to="/shop">Shop All</Link>
        </div>
      </div>
      <div className="container disclaimer">
        <p>
          Ubankis is a demonstration storefront. Prescription products require an evaluation by a licensed provider, and not everyone qualifies.
          Statements on this site have not been evaluated by the FDA. Compounded medications are not FDA-approved. Individual results vary.
        </p>
        <p>© {new Date().getFullYear()} Ubankis Health, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
