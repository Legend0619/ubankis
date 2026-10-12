export default function Stars({ rating, count }) {
  const full = Math.round(rating);
  return (
    <div className="rating" aria-label={`Rated ${rating} out of 5`}>
      <span className="stars">{"★".repeat(full)}<span className="dim">{"★".repeat(5 - full)}</span></span>
      {" "}{rating.toFixed(1)}
      {count != null && <span className="muted"> ({count.toLocaleString()})</span>}
    </div>
  );
}
