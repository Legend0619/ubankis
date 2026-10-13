import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { CtaBand, PageHero, Process } from "../components/Sections.jsx";
import { SERVICES } from "../data/site.js";

export default function Services() {
  return (
    <>
      <PageHero eyebrow="Services" title="Everything you need to grow online">
        One team for your website, marketing, AI automation and custom software — working from the same plan and measured on the same numbers.
      </PageHero>
      <section className="section tight">
        <div className="container service-list">
          {SERVICES.map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`} className="service-row">
              <span className="ico"><Icon name={s.icon} size={28} /></span>
              <div className="grow">
                <h3>{s.name}</h3>
                <p>{s.description}</p>
              </div>
              <span className="link">Learn more <Icon name="arrow" size={16} /></span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section alt">
        <div className="container">
          <p className="eyebrow center">How we work</p>
          <h2 className="center">A clear process, from first call to results</h2>
          <Process />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
