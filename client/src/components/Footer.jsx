import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../context/ToastContext.jsx";
import { COMPANY, SERVICES } from "../data/site.js";
import Icon from "./Icon.jsx";
import Logo from "./Logo.jsx";

export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState("");

  async function subscribe(e) {
    e.preventDefault();
    try {
      await api("/newsletter", { method: "POST", body: { email } });
      setEmail("");
      toast("Thanks for subscribing!");
    } catch (err) {
      toast(err.message, "error");
    }
  }

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="muted">Web, marketing and AI solutions that help growing businesses work smarter and win more customers.</p>
          <form className="newsletter" onSubmit={subscribe}>
            <input type="email" placeholder="Get growth tips by email" required aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn btn-gold btn-sm">Subscribe</button>
          </form>
          <div className="socials">
            <span className="muted small">Follow us</span>
            {COMPANY.socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer">{name}</a>)}
          </div>
        </div>
        <div>
          <h4>Services</h4>
          {SERVICES.map((s) => <Link key={s.slug} to={`/services/${s.slug}`}>{s.short}</Link>)}
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/#industries">Industries</Link>
          <Link to="/free-analysis">Free Analysis</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <a href={`tel:${COMPANY.phone.replace(/\D/g, "")}`}><Icon name="phone" size={16} /> {COMPANY.phone}</a>
          <a href={`mailto:${COMPANY.email}`}><Icon name="mail" size={16} /> {COMPANY.email}</a>
          <address><Icon name="pin" size={16} /> <span>{COMPANY.address.join(", ")}</span></address>
        </div>
      </div>
      <div className="container disclaimer">
        <p>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
