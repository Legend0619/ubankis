import { CtaBand, PageHero, Steps } from "../components/Sections.jsx";

const DETAILS = [
  ["Tell us about you", "Our assessment covers your goals, symptoms and medical history. If you order a prescription treatment, you'll complete a short medical intake at checkout."],
  ["Get your labs", "For hormone and longevity programs we start with bloodwork. Visit one of 2,000+ partner labs or use an at-home kit — results are usually back in 3–5 days."],
  ["Meet your provider", "A board-certified physician or nurse practitioner reviews your intake and labs, and connects with you by video or secure message to build your plan."],
  ["Receive your treatment", "Approved prescriptions are filled by licensed U.S. pharmacies and shipped discreetly, with everything you need and step-by-step instructions."],
  ["Ongoing optimization", "Follow-up labs and check-ins keep your plan dialed in. Message your care team anytime and manage refills from your account."],
];

export default function HowItWorks() {
  return (
    <>
      <PageHero eyebrow="How it works" title="Expert care without the waiting room">
        From your first question to your doorstep, everything happens online.
      </PageHero>
      <section className="section tight">
        <div className="container">
          <Steps />
        </div>
      </section>
      <section className="section alt">
        <div className="container narrow">
          <ol className="timeline">
            {DETAILS.map(([title, text]) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
