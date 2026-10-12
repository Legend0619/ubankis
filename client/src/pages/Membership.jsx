import { useState } from "react";
import { useApi } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import FaqList from "../components/FaqList.jsx";
import { PageHero } from "../components/Sections.jsx";
import { ErrorState, Loading } from "../components/States.jsx";
import { money } from "../format.js";

const MEMBERSHIP_FAQS = [
  ["Do I need a membership to buy treatments?", "No. Memberships add ongoing care, more frequent labs and savings on treatments, but you can order any treatment on its own."],
  ["When do member discounts apply?", "Immediately — add a membership to your cart and the discount is applied to every treatment in the same order, and to all future orders."],
  ["Can I switch or cancel?", "Yes. Change plans or cancel anytime from your account. Annual plans are refunded on a prorated basis."],
];

export default function Membership() {
  const { data, loading, error, reload } = useApi("/plans");
  const { user } = useAuth();
  const { add } = useCart();
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <PageHero eyebrow="Membership" title="Care that keeps up with you">
        Ongoing physician care, regular labs and member-only pricing on every treatment.
      </PageHero>
      <section className="section tight">
        <div className="container">
          <div className="billing-toggle">
            <span className={!annual ? "on" : ""}>Monthly</span>
            <button className="switch" role="switch" aria-checked={annual} aria-label="Bill annually" onClick={() => setAnnual((a) => !a)}><i /></button>
            <span className={annual ? "on" : ""}>Annual <em>Save 20%</em></span>
          </div>
          {loading && !data ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : (
            <div className="plans">
              {data.plans.map((plan) => {
                const option = annual ? plan.annual : plan.monthly;
                const current = user?.membership === plan.key;
                return (
                  <div className={`plan ${plan.featured ? "featured" : ""}`} key={plan.key}>
                    {plan.featured && <span className="ribbon">Most popular</span>}
                    <h3>{plan.name}</h3>
                    <p className="plan-desc">{plan.description}</p>
                    <div className="amount">
                      {money(annual ? Math.round(option.priceCents / 12) : option.priceCents)}
                      <small> /mo{annual ? `, ${money(option.priceCents)} billed yearly` : ""}</small>
                    </div>
                    <ul>{plan.perks.map((x) => <li key={x}>{x}</li>)}</ul>
                    <button
                      className={`btn ${plan.featured ? "btn-gold" : "btn-ghost"} btn-block`}
                      disabled={current}
                      onClick={() => add({ ...option, id: option.productId, kind: "membership", form: "card", rx: false })}
                    >
                      {current ? "Your current plan" : `Choose ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <section className="section alt">
        <div className="container narrow">
          <h2 className="center">Membership FAQ</h2>
          <FaqList items={MEMBERSHIP_FAQS} />
        </div>
      </section>
    </>
  );
}
