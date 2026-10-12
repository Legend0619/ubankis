import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useApi } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Logo from "./Logo.jsx";

export default function Header() {
  const { user } = useAuth();
  const { count, openCart } = useCart();
  const { data } = useApi("/categories");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="announce">
        Free consultation on every plan · Use code <strong>START20</strong> for 20% off your first order
      </div>
      <header className="nav">
        <div className="container nav-inner">
          <Logo />
          <nav className={`nav-links ${menuOpen ? "open" : ""}`} aria-label="Main">
            <div className="dropdown">
              <NavLink to="/shop" className="dropdown-trigger">Treatments ▾</NavLink>
              <div className="dropdown-menu">
                {data?.categories.map((c) => (
                  <Link key={c.slug} to={`/treatments/${c.slug}`}>
                    <span className="dd-icon">{c.icon}</span>
                    <span><strong>{c.name}</strong><small>{c.tagline}</small></span>
                  </Link>
                ))}
              </div>
            </div>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/membership">Membership</NavLink>
            <NavLink to="/how-it-works">How It Works</NavLink>
            <NavLink to="/faq">FAQ</NavLink>
            {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          </nav>
          <div className="nav-actions">
            <Link to={user ? "/account" : "/login"} className="icon-btn" aria-label={user ? "My account" : "Sign in"} title={user ? `Signed in as ${user.firstName}` : "Sign in"}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
            </Link>
            <button className="icon-btn" onClick={openCart} aria-label={`Open cart, ${count} items`}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 7h12l-1 13H7z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
              {count > 0 && <span className="badge">{count}</span>}
            </button>
            <Link to="/assessment" className="btn btn-gold btn-sm hide-mobile">Get Started</Link>
            <button className="icon-btn menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded={menuOpen}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
