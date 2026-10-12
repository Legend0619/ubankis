import { useId } from "react";

// Generated packaging art used when a product has no imageUrl.
export default function ProductArt({ product, className = "" }) {
  const uid = useId().replace(/:/g, "");
  const tint = product.tint || "#c9a45c";
  if (product.imageUrl) {
    return (
      <div className={`product-art ${className}`} style={{ "--tint": tint }}>
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
      </div>
    );
  }
  const label = product.name.replace(/\s*\(.*\)/, "").replace(" Membership", "").split(" ").slice(0, 2).join(" ").toUpperCase();
  const draw = Shapes[product.form] || Shapes.bottle;
  return (
    <div className={`product-art ${className}`} style={{ "--tint": tint }}>
      <svg viewBox="0 0 200 200" role="img" aria-label={product.name}>
        <ellipse cx="100" cy="178" rx="52" ry="7" fill="#000" opacity=".45" />
        {draw(tint, label, uid)}
      </svg>
    </div>
  );
}

const Shapes = {
  vial: (tint, label, uid) => (
    <g>
      <defs>
        <linearGradient id={`glass${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor="#2a2f37" />
          <stop offset=".5" stopColor="#3a414b" />
          <stop offset="1" stopColor="#23272e" />
        </linearGradient>
      </defs>
      <rect x="78" y="40" width="44" height="22" rx="4" fill={tint} />
      <rect x="82" y="60" width="36" height="8" fill="#5a606a" />
      <rect x="70" y="66" width="60" height="110" rx="10" fill={`url(#glass${uid})`} stroke="#6a717c" />
      <rect x="74" y="132" width="52" height="40" rx="6" fill={tint} opacity=".35" />
      <rect x="74" y="88" width="52" height="40" fill="#f4f1ea" />
      <text x="100" y="104" textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize="10" fill="#111">UBANKIS</text>
      <text x="100" y="119" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="5.5" fill="#444">{label.split(" ").find((w) => w.length > 3)?.slice(0, 11) ?? label.slice(0, 11)}</text>
    </g>
  ),
  bottle: (tint, label) => (
    <g>
      <rect x="66" y="34" width="68" height="26" rx="5" fill="#22262d" />
      <rect x="66" y="56" width="68" height="6" fill={tint} />
      <rect x="58" y="62" width="84" height="114" rx="14" fill="#eef0f2" />
      <rect x="58" y="92" width="84" height="56" fill="#15181d" />
      <text x="100" y="114" textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize="13" fill={tint}>UBANKIS</text>
      <text x="100" y="132" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7" fill="#d9dce1">{label.slice(0, 20)}</text>
    </g>
  ),
  box: (tint, label) => (
    <g>
      <path d="M52 56 L68 42 H160 L144 56 Z" fill="#2b3038" />
      <path d="M144 56 L160 42 V160 L144 174 Z" fill="#15181d" />
      <rect x="52" y="56" width="92" height="118" fill="#1f2329" />
      <rect x="52" y="56" width="92" height="30" fill={tint} />
      <text x="98" y="76" textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize="13" fill="#111">UBANKIS</text>
      <text x="98" y="122" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7" fill="#d9dce1">{label.slice(0, 18)}</text>
      <rect x="66" y="132" width="64" height="2" fill={tint} opacity=".6" />
    </g>
  ),
  kit: (tint, label) => (
    <g>
      <rect x="40" y="70" width="120" height="100" rx="10" fill="#1c2026" stroke="#3a404a" />
      <path d="M40 80 a10 10 0 0 1 10 -10 h100 a10 10 0 0 1 10 10 v16 h-120 z" fill={tint} />
      <text x="100" y="88" textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize="12" fill="#111">UBANKIS</text>
      <rect x="56" y="108" width="18" height="48" rx="4" fill="#e9ecef" />
      <rect x="82" y="114" width="14" height="42" rx="3" fill="#cfd3d8" />
      <rect x="104" y="108" width="40" height="48" rx="5" fill="#2b3038" />
      <text x="124" y="135" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="6" fill="#ccc">{label.split(" ")[0].slice(0, 9)}</text>
    </g>
  ),
  card: (tint, label, uid) => (
    <g>
      <defs>
        <linearGradient id={`card${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d79c" />
          <stop offset="1" stopColor={tint} />
        </linearGradient>
      </defs>
      <rect x="30" y="58" width="140" height="90" rx="12" fill={`url(#card${uid})`} stroke="#5c4a28" />
      <text x="46" y="84" fontFamily="Oswald, sans-serif" fontSize="14" fill="#15110a" letterSpacing="2">UBANKIS</text>
      <text x="46" y="134" fontFamily="Inter, sans-serif" fontSize="9" fill="#2a2210" fontWeight="700">{label} MEMBER</text>
      <rect x="132" y="70" width="24" height="18" rx="3" fill="#15110a" opacity=".25" />
    </g>
  ),
};
