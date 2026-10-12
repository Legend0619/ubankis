import FaqList from "../components/FaqList.jsx";
import { CtaBand, PageHero } from "../components/Sections.jsx";

export const HOME_FAQS = [
  ["Do I need a prescription?", "No — our licensed providers evaluate you online and, if appropriate, write a prescription. Not everyone qualifies for every treatment."],
  ["How do lab tests work?", "Visit one of 2,000+ partner labs or use an at-home kit. Results are reviewed with your physician."],
  ["How is my medication shipped?", "Orders ship from licensed U.S. pharmacies in discreet, temperature-controlled packaging, typically within 48 hours of approval."],
  ["Can I cancel anytime?", "Yes. Memberships and subscriptions can be paused or cancelled anytime from your account."],
];

const SECTIONS = [
  ["Getting started", [
    ...HOME_FAQS.slice(0, 2),
    ["Is Ubankis available in my state?", "We serve patients in all 50 states, though some medications have state-specific restrictions. We'll let you know during your intake."],
    ["How old do I need to be?", "You must be 18 or older for all treatments."],
  ]],
  ["Orders & shipping", [
    HOME_FAQS[2],
    ["When am I charged?", "Your card is charged at checkout. If a provider determines a prescription isn't right for you, that item is refunded in full."],
    ["Do you offer free shipping?", "Orders over $75 ship free, and Optimize and Elite members always get free 2-day shipping."],
    ["Can I track my order?", "Yes. Every status update — provider review, processing, shipped and delivered — appears in your account."],
  ]],
  ["Billing", [
    HOME_FAQS[3],
    ["Do you accept insurance or HSA/FSA?", "We're a cash-pay service with transparent pricing. Most HSA/FSA cards are accepted."],
    ["Do you have promo codes?", "New patients can use START20 for 20% off their first order."],
  ]],
];

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="FAQ" title="Frequently asked questions" />
      <section className="section tight">
        <div className="container narrow">
          {SECTIONS.map(([title, items]) => (
            <div key={title} className="faq-section">
              <h2>{title}</h2>
              <FaqList items={items} />
            </div>
          ))}
        </div>
      </section>
      <CtaBand title="Still have questions?" text="Take the free assessment or reach out to our care team." />
    </>
  );
}
