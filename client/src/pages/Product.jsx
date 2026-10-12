import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, useApi } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import ProductArt from "../components/ProductArt.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Stars from "../components/Stars.jsx";
import { ErrorState, Loading } from "../components/States.jsx";
import { formatDate, money, unitLabel } from "../format.js";

export default function Product() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useApi(`/products/${slug}`);
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const { product: p, reviews, related } = data;

  return (
    <>
      <section className="section tight">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/shop">Shop</Link> / <Link to={`/treatments/${p.categorySlug}`}>{p.categoryName}</Link> / <span>{p.name}</span>
          </nav>
          <div className="pdp">
            <div className="pdp-media" style={{ "--tint": p.tint }}>
              {p.bestSeller && <span className="tag best">Best seller</span>}
              <ProductArt product={p} className="large" />
            </div>
            <div className="pdp-info">
              <span className="cat-name">{p.categoryName} {p.rx && <span className="pill rx">Prescription</span>}</span>
              <h1>{p.name}</h1>
              <Stars rating={p.rating} count={p.reviewCount} />
              <p className="lead">{p.shortDesc}</p>
              <div className="pdp-price">{money(p.priceCents)} <small>{unitLabel(p.unit)}</small></div>
              <ul className="check-list">
                {p.benefits.map((b) => <li key={b}>{b}</li>)}
              </ul>
              <div className="pdp-buy">
                <div className="qty large">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase quantity">+</button>
                </div>
                <button className="btn btn-gold grow" onClick={() => add(p, qty)}>Add to Cart — {money(p.priceCents * qty)}</button>
              </div>
              {p.rx ? (
                <p className="note">🩺 Requires a short online medical intake. A licensed provider reviews it before your order ships, and if you're not approved, you're refunded in full.</p>
              ) : (
                <p className="note">📦 Ships within 1–2 business days. Free shipping on orders over $75.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section alt tight">
        <div className="container pdp-details">
          <div>
            <h2>About this treatment</h2>
            <p>{p.description}</p>
          </div>
          {p.usage && (
            <div>
              <h2>How to use</h2>
              <p>{p.usage}</p>
              <p className="muted small">Always follow the directions from your provider and pharmacy label.</p>
            </div>
          )}
        </div>
      </section>

      <Reviews product={p} reviews={reviews} onPosted={reload} />

      {related.length > 0 && (
        <section className="section alt">
          <div className="container">
            <h2>You may also like</h2>
            <div className="product-grid">
              {related.map((r) => <ProductCard key={r.id} product={r} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Reviews({ product, reviews, onPosted }) {
  const { user } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", body: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api(`/products/${product.slug}/reviews`, { method: "POST", body: form });
      toast("Thanks for your review!");
      setForm({ rating: 5, title: "", body: "" });
      setOpen(false);
      onPosted();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section tight">
      <div className="container narrow">
        <div className="reviews-head">
          <div>
            <h2>Reviews</h2>
            <Stars rating={product.rating} count={product.reviewCount} />
          </div>
          {user ? (
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)}>{open ? "Cancel" : "Write a review"}</button>
          ) : (
            <Link to={`/login?next=/products/${product.slug}`} className="btn btn-ghost btn-sm">Sign in to review</Link>
          )}
        </div>

        {open && (
          <form className="card form" onSubmit={submit}>
            <div className="star-input" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} className={n <= form.rating ? "on" : ""} onClick={() => setForm({ ...form, rating: n })} aria-label={`${n} stars`}>★</button>
              ))}
            </div>
            <label>Title<input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={100} /></label>
            <label>Review<textarea className="input" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required minLength={10} /></label>
            {err && <p className="form-error">{err}</p>}
            <button className="btn btn-gold" disabled={busy}>{busy ? "Posting…" : "Post review"}</button>
          </form>
        )}

        {reviews.length ? reviews.map((r) => (
          <article className="review-row" key={r.id}>
            <div className="stars">{"★".repeat(r.rating)}<span className="dim">{"★".repeat(5 - r.rating)}</span></div>
            <h4>{r.title}</h4>
            <p>{r.body}</p>
            <span className="muted small">{r.author} · Verified patient · {formatDate(r.createdAt)}</span>
          </article>
        )) : <p className="muted">No written reviews yet.</p>}
      </div>
    </section>
  );
}
