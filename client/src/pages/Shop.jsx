import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApi } from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import { PageHero } from "../components/Sections.jsx";
import { ErrorState, Loading } from "../components/States.jsx";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const sort = params.get("sort") || "popular";
  const q = params.get("q") || "";
  const [search, setSearch] = useState(q);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  // Debounce search box → URL.
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => update({ q: search }), 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  function update(changes) {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) v ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  }

  const cats = useApi("/categories");
  const query = new URLSearchParams({ sort, ...(category && { category }), ...(q && { q }) }).toString();
  const { data, loading, error, reload } = useApi(`/products?${query}`);

  return (
    <>
      <PageHero eyebrow="Shop" title="All treatments">
        Prescription treatments and supplements, prescribed online and delivered.
      </PageHero>
      <section className="section tight">
        <div className="container">
          <div className="toolbar">
            <div className="filters" role="tablist">
              <button className={!category ? "active" : ""} onClick={() => update({ category: "" })}>All</button>
              {cats.data?.categories.map((c) => (
                <button key={c.slug} className={category === c.slug ? "active" : ""} onClick={() => update({ category: c.slug })}>
                  {c.name}
                </button>
              ))}
            </div>
            <div className="toolbar-right">
              <input className="input" type="search" placeholder="Search treatments…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search" />
              <select className="input" value={sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort by">
                <option value="popular">Most popular</option>
                <option value="rating">Top rated</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {loading && !data ? <Loading /> : error ? <ErrorState error={error} onRetry={reload} /> : (
            <>
              <p className="muted small result-count">{data.products.length} {data.products.length === 1 ? "treatment" : "treatments"}</p>
              {data.products.length ? (
                <div className="product-grid">
                  {data.products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div className="state"><p>No treatments match your search.</p></div>
              )}
            </>
          )}
          <p className="fineprint">Prescription (Rx) products require an online consultation with a licensed provider and ship only after approval.</p>
        </div>
      </section>
    </>
  );
}
