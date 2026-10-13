import Icon from "../components/Icon.jsx";
import { CtaBand, PageHero, Process, Testimonials } from "../components/Sections.jsx";
import { COMPANY, STATS } from "../data/site.js";

const VALUES = [
  ["trending", "Results over activity", "We're measured on leads, revenue and saved hours — not on how busy we look."],
  ["users", "One accountable team", "Strategy, design, marketing and engineering under one roof, with one point of contact."],
  ["spark", "Practical AI", "We use AI where it clearly pays off, and keep people in charge of the decisions that matter."],
  ["check", "Radical transparency", "Clear pricing, shared dashboards and accounts you always own."],
];

const TEAM = [
  ["Daniel Reyes", "Founder & CEO"],
  ["Aisha Khan", "Head of Growth Marketing"],
  ["Marcus Lee", "Director of Engineering"],
  ["Sofia Novak", "AI Solutions Lead"],
];

export default function About() {
  return (
    <>
      <PageHero eyebrow={`About ${COMPANY.legalName}`} title="We help businesses grow smarter">
        {COMPANY.legalName} is a digital growth and AI company. We combine marketing, design and engineering to help small and mid-sized businesses compete — and win — online.
      </PageHero>

      <section className="section tight">
        <div className="container">
          <div className="outcomes">
            {STATS.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split top">
          <div>
            <p className="eyebrow">Our story</p>
            <h2>Built for businesses that are ready to grow</h2>
            <p className="lead">
              Ubenkis started with a simple observation: great local and mid-market businesses were losing ground to competitors with bigger budgets and better technology.
              We built a team that brings enterprise-grade marketing, software and AI to companies that need results, not jargon.
            </p>
          </div>
          <div className="value-grid">
            {VALUES.map(([icon, title, text]) => (
              <div className="tile stacked" key={title}>
                <span className="ico"><Icon name={icon} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <p className="eyebrow center">Leadership</p>
          <h2 className="center">The team behind your growth</h2>
          <div className="team-grid">
            {TEAM.map(([name, role]) => (
              <div className="team-card" key={name}>
                <div className="avatar large">{name.split(" ").map((p) => p[0]).join("")}</div>
                <strong>{name}</strong>
                <span className="muted small">{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow center">How we work</p>
          <h2 className="center">Our process</h2>
          <Process />
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2 className="center">What clients say</h2>
          <Testimonials />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
