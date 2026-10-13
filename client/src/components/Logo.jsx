import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Ubenkis home">
      <img src="/logo-mark.svg" alt="" width="34" height="34" />
      <span className="logo-text">
        UBENKIS
        <small>Digital &amp; AI</small>
      </span>
    </Link>
  );
}
