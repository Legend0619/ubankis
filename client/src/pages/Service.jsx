import { Link, useParams } from "react-router-dom";
import FaqList from "../components/FaqList.jsx";
import Icon from "../components/Icon.jsx";
import { CtaBand, Process } from "../components/Sections.jsx";
import { SERVICES, serviceBySlug } from "../data/site.js";
import NotFound from "./NotFound.jsx";

export default function Service() {
  const { slug } = useParams();
  const s = serviceBySlug(slug);
  if (!s) return <NotFound />;
  const others = SERVICES.filter((o) => o.slug !== s.slug);

  return (
    <>
      <section className="hero service-hero">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/services">Services</Link> / <span>{s.name}</span>
          </nav>
          <span className="hero-icon"><Icon name={s.icon} size={34} /></span>
          <h1>{s.name}</h1>
          <p className="lead">{s.tagline} {s.description}</p>
          <div className="hero-cta">
            <Link to={`/free-analysis?service=${s.slug}`} className="btn btn-gold">Get a Free Analysis</Link>
            <Link to="/contact" className="btn btn-ghost">Talk to an Expert</Link>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="outcomes">
            {s.outcomes.map(([value, label]) => (
              <div key={label}><strong>{value}</strong><span>{label}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split top">
          <div>
            <p className="eyebrow">What's included</p>
            <h2>Everything handled, end to end</h2>
            <p className="lead">Pick the pieces you need or let us run the whole program. Every engagement includes a dedicated lead and transparent reporting.</p>
          </div>
          <ul className="check-grid">
            {s.includes.map((item) => (
              <li key={item}><Icon name="check" size={18} /> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <p className="eyebrow center">Our process</p>
          <h2 className="center">How we deliver</h2>
          <Process />
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <p className="eyebrow center">FAQ</p>
          <h2 className="center">{s.short} questions</h2>
          <FaqList items={s.faqs} />
        </div>
      </section>

      <section className="section alt tight">
        <div className="container">
          <h2>Explore other services</h2>
          <div className="tile-grid four">
            {others.map((o) => (
              <Link key={o.slug} to={`/services/${o.slug}`} className="tile stacked">
                <span className="ico"><Icon name={o.icon} /></span>
                <h3>{o.name}</h3>
                <p>{o.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={`Let's talk ${s.short.toLowerCase()}`} text="Book a free consultation and get a plan tailored to your goals." />
    </>
  );
}
