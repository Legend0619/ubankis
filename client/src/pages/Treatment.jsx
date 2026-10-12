import { Link, useParams } from "react-router-dom";
import { useApi } from "../api.js";
import FaqList from "../components/FaqList.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { CtaBand, Steps } from "../components/Sections.jsx";
import { ErrorState, Loading } from "../components/States.jsx";
import { money } from "../format.js";

export default function Treatment() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useApi(`/categories/${slug}`);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const { category: c, products } = data;
  const from = Math.min(...products.map((p) => p.priceCents));

  return (
    <>
      <section className="hero treatment-hero" style={{ "--tint": c.tint }}>
        <div className="container">
          <p className="eyebrow">{c.icon} {c.name}</p>
          <h1>{c.tagline}</h1>
          <p className="lead">{c.description}</p>
          <div className="hero-cta">
            <Link to="/assessment" className="btn btn-gold">See If I Qualify</Link>
            <a href="#products" className="btn btn-ghost">Treatments from {money(from)}/mo</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow center">Benefits</p>
          <h2 className="center">What patients notice</h2>
          <div className="benefit-grid">
            {c.benefits.map((b) => (
              <div className="benefit" key={b.title} style={{ "--tint": c.tint }}>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt" id="products">
        <div className="container">
          <p className="eyebrow">Treatments</p>
          <h2>{c.name} options</h2>
          <div className="product-grid">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow center">How it works</p>
          <h2 className="center">Getting started is simple</h2>
          <Steps />
        </div>
      </section>

      <section className="section alt">
        <div className="container narrow">
          <p className="eyebrow center">FAQ</p>
          <h2 className="center">{c.name} questions</h2>
          <FaqList items={c.faqs} />
        </div>
      </section>

      <CtaBand title={`Start your ${c.name.toLowerCase()} plan`} />
    </>
  );
}
