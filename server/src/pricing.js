import { db } from "./db.js";

export const PROMOS = {
  START20: { pct: 20, label: "20% off your first order" },
  WELCOME10: { pct: 10, label: "10% off your order" },
};

// Membership tier → % off non-membership items.
const MEMBER_PERKS = { optimize: 10, elite: 20 };
const FREE_SHIPPING_TIERS = new Set(["optimize", "elite"]);
export const SHIPPING_CENTS = 995;
export const FREE_SHIPPING_MIN_CENTS = 7500;
const MAX_QTY = 10;

/**
 * Prices a cart server-side. Unknown/inactive products are dropped, quantities clamped,
 * and only one membership is kept (the last one added).
 */
export function quote(rawItems, { user = null, promoCode = "" } = {}) {
  const qtyById = new Map();
  for (const item of Array.isArray(rawItems) ? rawItems : []) {
    const id = Number(item?.productId);
    const qty = Math.floor(Number(item?.qty));
    if (!Number.isInteger(id) || !(qty > 0)) continue;
    qtyById.set(id, Math.min((qtyById.get(id) || 0) + qty, MAX_QTY));
  }

  const getProduct = db.prepare("SELECT * FROM products WHERE id = ? AND active = 1");
  const lines = [];
  let membership = null;
  for (const [id, qty] of qtyById) {
    const p = getProduct.get(id);
    if (!p) continue;
    const line = {
      productId: p.id,
      slug: p.slug,
      name: p.name,
      kind: p.kind,
      planKey: p.plan_key,
      rx: !!p.rx,
      unit: p.unit,
      unitPriceCents: p.price_cents,
      qty: p.kind === "membership" ? 1 : qty,
    };
    line.lineTotalCents = line.unitPriceCents * line.qty;
    if (p.kind === "membership") membership = line;
    else lines.push(line);
  }
  if (membership) lines.push(membership);

  const subtotalCents = lines.reduce((s, l) => s + l.lineTotalCents, 0);
  const productsCents = lines.filter((l) => l.kind !== "membership").reduce((s, l) => s + l.lineTotalCents, 0);
  const tier = membership?.planKey || user?.membership || null;

  const memberPct = MEMBER_PERKS[tier] || 0;
  const memberDiscountCents = Math.round((productsCents * memberPct) / 100);

  const code = String(promoCode || "").trim().toUpperCase();
  const promo = code ? PROMOS[code] : null;
  const promoError = code && !promo ? "That promo code isn't valid" : null;
  const promoDiscountCents = promo ? Math.round(((subtotalCents - memberDiscountCents) * promo.pct) / 100) : 0;

  const afterDiscounts = subtotalCents - memberDiscountCents - promoDiscountCents;
  const hasPhysical = productsCents > 0;
  const freeShipping = !hasPhysical || FREE_SHIPPING_TIERS.has(tier) || afterDiscounts >= FREE_SHIPPING_MIN_CENTS;
  const shippingCents = freeShipping ? 0 : SHIPPING_CENTS;

  return {
    lines,
    subtotalCents,
    memberTier: tier,
    memberDiscountCents,
    promo: promo ? { code, label: promo.label } : null,
    promoError,
    promoDiscountCents,
    shippingCents,
    totalCents: afterDiscounts + shippingCents,
    hasPhysical,
    requiresReview: lines.some((l) => l.rx),
    freeShippingMinCents: FREE_SHIPPING_MIN_CENTS,
  };
}
