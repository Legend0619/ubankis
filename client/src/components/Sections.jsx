import { Link } from "react-router-dom";

export function Steps() {
  return (
    <div className="steps">
      <div className="step">
        <span className="num">01</span>
        <h3>Online assessment</h3>
        <p>Tell us about your goals and health history. It takes about two minutes and it's always free.</p>
      </div>
      <div className="step">
        <span className="num">02</span>
        <h3>Labs &amp; consult</h3>
        <p>Get bloodwork at 2,000+ partner labs or at home, then review your results with a licensed physician.</p>
      </div>
      <div className="step">
        <span className="num">03</span>
        <h3>Treatment delivered</h3>
        <p>Your personalized protocol ships discreetly within 48 hours, with ongoing care and refills included.</p>
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  { name: "Marcus T.", meta: "Testosterone · Texas", text: "I didn't realize how low my energy had been until I started. Labs, consult and meds were all handled online — I feel ten years younger.", result: "Energy ↑ in 6 weeks" },
  { name: "Jenna R.", meta: "Weight loss · Florida", text: "The provider actually listened and adjusted my dose. Down 34 lbs and the monthly check-ins keep me on track.", result: "−34 lbs in 5 months" },
  { name: "David K.", meta: "Peptides · California", text: "Recovery after training is night and day. Shipping is fast, packaging is discreet, and support replies within hours.", result: "Better sleep & recovery" },
];

export function Testimonials() {
  return (
    <div className="reviews">
      {TESTIMONIALS.map((r) => (
        <div className="review" key={r.name}>
          <div className="stars">★★★★★</div>
          <blockquote>“{r.text}”</blockquote>
          <div className="who">
            <div className="avatar">{r.name[0]}</div>
            <div>{r.name}<span>{r.meta}</span></div>
          </div>
          <span className="result">{r.result}</span>
        </div>
      ))}
    </div>
  );
}

export function CtaBand({ title = "Ready to feel like yourself again?", text = "Your free assessment takes 2 minutes. No commitment." }) {
  return (
    <section className="cta-band">
      <div className="container cta-inner">
        <h2>{title}</h2>
        <p>{text}</p>
        <Link to="/assessment" className="btn btn-gold">Start My Assessment</Link>
      </div>
    </section>
  );
}

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
