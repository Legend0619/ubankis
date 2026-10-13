import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { CtaBand, Testimonials } from "../components/Sections.jsx";
import { AI_DEV_ITEMS, CLIENTS, INDUSTRIES, MARKETING_CHANNELS, SERVICES, STATS } from "../data/site.js";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Ubenkis LLC · Digital growth &amp; AI</p>
            <h1>Smart solutions that <span className="gold">drive growth.</span></h1>
            <p className="lead">
              Websites, marketing and AI automation built around your business — so you win more customers and spend less time on busywork.
            </p>
            <div className="hero-cta">
              <Link to="/free-analysis" className="btn btn-gold">Get a Free Analysis</Link>
              <Link to="/services" className="btn btn-ghost">Explore Services</Link>
            </div>
            <ul className="trust">
              {STATS.slice(0, 3).map(([value, label]) => <li key={label}><strong>{value}</strong><span>{label}</span></li>)}
            </ul>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orb" />
            <div className="dash-card">
              <p className="vc-label">Growth dashboard</p>
              <div className="dash-metrics">
                <div><strong>+38%</strong><span>qualified leads</span></div>
                <div><strong>−24%</strong><span>cost per lead</span></div>
              </div>
              <div className="dash-chart">
                {[38, 46, 42, 58, 64, 61, 76, 88].map((h, i) => <i key={i} style={{ "--h": `${h}%` }} />)}
              </div>
            </div>
            <div className="float-chip chip-1"><Icon name="cpu" size={16} /> AI agent booked 12 calls today</div>
            <div className="float-chip chip-2"><Icon name="trending" size={16} /> ROAS 3.4×</div>
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <p className="eyebrow center">What we do</p>
          <h2 className="center">Services built to grow your business</h2>
          <div className="service-grid">
            {SERVICES.map((s) => (
              <Link key={s.slug} to={`/services/${s.slug}`} className="service-card">
                <span className="ico"><Icon name={s.icon} size={26} /></span>
                <h3>{s.name}</h3>
                <p>{s.summary}</p>
                <span className="link">Explore more <Icon name="arrow" size={16} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="logos" id="clients">
        <div className="container">
          <p className="eyebrow center">We've worked with</p>
          <div className="client-grid">
            {CLIENTS.map(([name, style]) => <span key={name} className={`client client-${style}`}>{name}</span>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <p className="eyebrow">Efficiency</p>
            <h2>Do more with the team you already have</h2>
            <p className="lead">
              Most businesses still run on manual work. Our clients hand repetitive tasks to AI and automation, freeing their people for the work that grows revenue.
            </p>
          </div>
          <div className="card compare">
            <Compare label="Average business" ai={12} />
            <Compare label="Ubenkis clients" ai={40} highlight />
            <div className="compare-legend">
              <span><i className="ai" /> AI &amp; automation</span>
              <span><i className="manual" /> Manual work</span>
            </div>
          </div>
        </div>
      </section>

      <section className="promo-band">
        <div className="container promo-inner">
          <div>
            <h2>Grow revenue and cut costs with AI automation</h2>
            <p>Clients average 12% more revenue and 18% lower operating costs within their first year.</p>
          </div>
          <Link to="/free-analysis" className="btn btn-dark">Apply Now</Link>
        </div>
      </section>

      <section className="section alt" id="digital-marketing">
        <div className="container">
          <div className="shop-head">
            <div>
              <p className="eyebrow">Digital marketing</p>
              <h2>Every channel, one accountable team</h2>
            </div>
            <Link to="/services/digital-marketing" className="btn btn-ghost btn-sm">View all <Icon name="arrow" size={16} /></Link>
          </div>
          <div className="tile-grid three">
            {MARKETING_CHANNELS.map((c) => (
              <Link key={c.name} to={`/services/${c.to}`} className="tile">
                <span className="ico"><Icon name={c.icon} /></span>
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.text}</p>
                  <span className="link">View <Icon name="arrow" size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="analysis-band">
            <div>
              <p className="eyebrow">Free · No obligation</p>
              <h2>Get a free analysis for your business</h2>
              <p className="lead">We'll review your website, ads and online presence and send you a prioritized list of opportunities within 2 business days.</p>
            </div>
            <Link to="/free-analysis" className="btn btn-gold">Try Now</Link>
          </div>
        </div>
      </section>

      <section className="section alt" id="ai-development">
        <div className="container">
          <p className="eyebrow center">AI workforce &amp; development</p>
          <h2 className="center">Technology that works as hard as you do</h2>
          <div className="tile-grid four">
            {AI_DEV_ITEMS.map((c) => (
              <Link key={c.name} to={`/services/${c.to}`} className="tile stacked">
                <span className="ico"><Icon name={c.icon} /></span>
                <h3>{c.name}</h3>
                <p>{c.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow center">Client results</p>
          <h2 className="center">What our clients say</h2>
          <Testimonials />
        </div>
      </section>

      <CtaBand />

      <section className="section" id="industries">
        <div className="container">
          <p className="eyebrow center">Industries</p>
          <h2 className="center">Industries we serve</h2>
          <div className="tile-grid three">
            {INDUSTRIES.map((ind) => (
              <div key={ind.name} className="tile">
                <span className="ico"><Icon name={ind.icon} /></span>
                <div>
                  <h3>{ind.name}</h3>
                  <p>{ind.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Compare({ label, ai, highlight = false }) {
  return (
    <div className={`compare-row ${highlight ? "highlight" : ""}`}>
      <div className="compare-head"><strong>{label}</strong><span>{ai}% AI · {100 - ai}% manual</span></div>
      <div className="compare-bar">
        <i className="ai" style={{ width: `${ai}%` }} />
        <i className="manual" style={{ width: `${100 - ai}%` }} />
      </div>
    </div>
  );
}
