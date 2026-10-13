import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import LeadForm from "../components/LeadForm.jsx";
import { PageHero } from "../components/Sections.jsx";
import { serviceBySlug } from "../data/site.js";

const INCLUDED = [
  "Website speed, SEO and conversion review",
  "Google & Meta ads account audit",
  "Local search and reputation check",
  "AI automation opportunities in your workflow",
  "A prioritized action plan with expected impact",
];

export default function FreeAnalysis() {
  const [params] = useSearchParams();
  const service = serviceBySlug(params.get("service"))?.slug || "";

  return (
    <>
      <PageHero eyebrow="Free business analysis" title="See where your growth is hiding">
        Share a few details and our strategists will send a personalized analysis of your online presence within 2 business days. Free, with no obligation.
      </PageHero>
      <section className="section tight">
        <div className="container split top">
          <div>
            <h2 className="sub">What you'll get</h2>
            <ul className="check-grid single">
              {INCLUDED.map((item) => <li key={item}><Icon name="check" size={18} /> {item}</li>)}
            </ul>
            <p className="muted small" style={{ marginTop: "1.5rem" }}>We'll never share your information. You'll hear from a real strategist, not a sales robot.</p>
          </div>
          <LeadForm source="analysis" initialService={service} />
        </div>
      </section>
    </>
  );
}
