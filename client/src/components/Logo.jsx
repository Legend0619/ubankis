import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Ubankis home">
      <img src="/logo-mark.svg" alt="" width="34" height="34" />
      <span className="logo-text">
        UBANKIS
        <small>Health</small>
      </span>
    </Link>
  );
}
