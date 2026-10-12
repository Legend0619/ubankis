import { Link } from "react-router-dom";
import { useApi } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import FaqList from "../components/FaqList.jsx";
import { CtaBand, Steps, Testimonials } from "../components/Sections.jsx";
import { HOME_FAQS } from "./FaqPage.jsx";

export default function Home() {
  const cats = useApi("/categories");
  const best = useApi("/products?sort=popular");

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Physician-led · 100% online · Delivered</p>
            <h1>Reclaim your <span className="gold">edge.</span></h1>
            <p className="lead">
              Hormone optimization, medical weight loss, peptides and longevity care — prescribed by licensed physicians and shipped to your door in days.
            </p>
            <div className="hero-cta">
              <Link to="/assessment" className="btn btn-gold">Take the 2-Minute Assessment</Link>
              <Link to="/shop" className="btn btn-ghost">Shop Treatments</Link>
            </div>
            <ul className="trust">
              <li><strong>50k+</strong><span>patients treated</span></li>
              <li><strong>4.9★</strong><span>average rating</span></li>
              <li><strong>48h</strong><span>to your door</span></li>
            </ul>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orb" />
            <div className="vial-card">
              <div className="vial" />
              <div>
                <p className="vc-label">Your plan</p>
                <p className="vc-title">TRT + Enclomiphene</p>
                <div className="vc-bars">
                  <div><span>Energy</span><i style={{ "--w": "88%" }} /></div>
                  <div><span>Focus</span><i style={{ "--w": "76%" }} /></div>
                  <div><span>Libido</span><i style={{ "--w": "92%" }} /></div>
                </div>
              </div>
            </div>
            <div className="float-chip chip-1">✓ Labs reviewed by Dr. Patel</div>
            <div className="float-chip chip-2">📦 Ships in 48 hours</div>
          </div>
        </div>
      </section>

      <div className="logos">
        <div className="container logos-inner">
          <span>Trusted care</span>
          <b>LICENSED IN 50 STATES</b><b>U.S. PHARMACIES</b><b>BOARD-CERTIFIED MDs</b><b>HIPAA SECURE</b>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <p className="eyebrow center">What we treat</p>
          <h2 className="center">Programs built around you</h2>
          <div className="cat-grid">
            {cats.data?.categories.map((c) => (
              <Link key={c.slug} to={`/treatments/${c.slug}`} className="cat" style={{ "--tint": c.tint }}>
                <span className="ico">{c.icon}</span>
                <h3>{c.name}</h3>
                <p>{c.tagline}</p>
                <span className="link">Explore {c.productCount} treatments →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="shop-head">
            <div>
              <p className="eyebrow">Best sellers</p>
              <h2>Most-prescribed treatments</h2>
            </div>
            <Link to="/shop" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div className="product-grid">
            {best.data?.products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow center">How it works</p>
          <h2 className="center">From assessment to doorstep in 3 steps</h2>
          <Steps />
        </div>
      </section>

      <section className="section alt">
        <div className="container split">
          <div>
            <p className="eyebrow">Why Ubankis</p>
            <h2>Real doctors. Real labs. Real results.</h2>
            <p className="lead">We don't do one-size-fits-all. Every plan starts with your bloodwork and a conversation with a licensed physician, and gets adjusted as your numbers change.</p>
            <Link to="/membership" className="btn btn-gold">See Membership Plans</Link>
          </div>
          <ul className="feature-list">
            <li><strong>Lab-guided dosing</strong><span>Comprehensive panels before and during treatment.</span></li>
            <li><strong>Licensed U.S. pharmacies</strong><span>Medications from 503A/503B compounding and retail pharmacies.</span></li>
            <li><strong>Unlimited messaging</strong><span>Reach your care team any time, with replies within one business day.</span></li>
            <li><strong>Transparent pricing</strong><span>No insurance hassles, no hidden fees. Cancel anytime.</span></li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow center">Real results</p>
          <h2 className="center">Trusted by thousands</h2>
          <Testimonials />
        </div>
      </section>

      <section className="section alt">
        <div className="container narrow">
          <p className="eyebrow center">FAQ</p>
          <h2 className="center">Questions, answered</h2>
          <FaqList items={HOME_FAQS} />
          <p className="center" style={{ marginTop: "2rem" }}><Link to="/faq" className="gold">See all FAQs →</Link></p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
