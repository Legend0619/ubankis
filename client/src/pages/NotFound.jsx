import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container center">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="lead" style={{ margin: "1rem auto 2rem" }}>The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="btn btn-gold">Back to home</Link>
      </div>
    </section>
  );
}
