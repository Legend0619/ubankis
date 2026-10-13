import { Link } from "react-router-dom";
import { PROCESS, TESTIMONIALS } from "../data/site.js";

export function PageHero({ eyebrow, title, children }) {
  return (
    <section className="page-hero">
      <div className="container">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {children && <p className="lead">{children}</p>}
      </div>
    </section>
  );
}

export function CtaBand({
  title = "Ready to embark on your digital journey?",
  text = "Tell us where you want to grow. We'll show you how to get there.",
  cta = "Contact Us",
  to = "/contact",
}) {
  return (
    <section className="cta-band">
      <div className="container cta-inner">
        <h2>{title}</h2>
        <p>{text}</p>
        <Link to={to} className="btn btn-gold">{cta}</Link>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <div className="steps four">
      {PROCESS.map(([title, text], i) => (
        <div className="step" key={title}>
          <span className="num">{String(i + 1).padStart(2, "0")}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <div className="reviews">
      {TESTIMONIALS.map((r) => (
        <div className="review" key={r.name}>
          <div className="stars">★★★★★</div>
          <blockquote>“{r.text}”</blockquote>
          <div className="who">
            <div className="avatar">{r.name[0]}</div>
            <div>{r.name}<span>{r.role}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}
