import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { SERVICES } from "../data/site.js";
import Icon from "./Icon.jsx";
import Logo from "./Logo.jsx";

export default function Header() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo />
        <nav className={`nav-links ${menuOpen ? "open" : ""}`} aria-label="Main">
          <div className="dropdown">
            <NavLink to="/services" className="dropdown-trigger">Services ▾</NavLink>
            <div className="dropdown-menu">
              {SERVICES.map((s) => (
                <Link key={s.slug} to={`/services/${s.slug}`}>
                  <span className="dd-icon"><Icon name={s.icon} size={20} /></span>
                  <span><strong>{s.name}</strong><small>{s.tagline}</small></span>
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/free-analysis">Free Analysis</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>
          {user && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="nav-actions">
          <Link to="/contact" className="btn btn-gold btn-sm hide-mobile">Get in Touch</Link>
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded={menuOpen}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
