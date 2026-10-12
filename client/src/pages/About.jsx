import { CtaBand, PageHero, Testimonials } from "../components/Sections.jsx";

export default function About() {
  return (
    <>
      <PageHero eyebrow="About Ubankis" title="Healthcare built for performance">
        We started Ubankis because getting proactive care shouldn't mean months of waiting, vague answers and a one-size-fits-all prescription.
      </PageHero>
      <section className="section tight">
        <div className="container split">
          <div>
            <h2>Our mission</h2>
            <p className="lead">Make evidence-based optimization — hormones, metabolism, recovery and longevity — accessible to everyone, guided by real physicians and real data.</p>
          </div>
          <ul className="feature-list">
            <li><strong>50,000+</strong><span>patients treated across the U.S.</span></li>
            <li><strong>120+</strong><span>licensed physicians and nurse practitioners</span></li>
            <li><strong>2,000+</strong><span>partner lab locations</span></li>
            <li><strong>4.9 / 5</strong><span>average patient rating</span></li>
          </ul>
        </div>
      </section>
      <section className="section alt">
        <div className="container">
          <h2 className="center">What patients say</h2>
          <Testimonials />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
