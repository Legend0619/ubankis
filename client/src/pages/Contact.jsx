import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import LeadForm from "../components/LeadForm.jsx";
import { PageHero } from "../components/Sections.jsx";
import { COMPANY } from "../data/site.js";

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's start a conversation">
        Tell us about your business and goals. Our team replies within one business day.
      </PageHero>
      <section className="section tight">
        <div className="container split top">
          <div className="contact-info">
            <div>
              <h4><Icon name="mail" size={18} /> Email</h4>
              <p><a href={`mailto:${COMPANY.email}`} className="gold">{COMPANY.email}</a></p>
            </div>
            <div>
              <h4><Icon name="phone" size={18} /> Phone</h4>
              <p><a href={`tel:${COMPANY.phone.replace(/\D/g, "")}`}>{COMPANY.phone}</a> · {COMPANY.hours}</p>
            </div>
            <div>
              <h4><Icon name="pin" size={18} /> Address</h4>
              <address>{COMPANY.legalName}<br />{COMPANY.address[0]}<br />{COMPANY.address[1]}</address>
            </div>
            <div>
              <h4><Icon name="spark" size={18} /> Not sure where to start?</h4>
              <p>Request a <Link to="/free-analysis" className="gold">free business analysis</Link> and we'll show you the biggest opportunities first.</p>
            </div>
          </div>
          <LeadForm source="contact" />
        </div>
      </section>
    </>
  );
}
