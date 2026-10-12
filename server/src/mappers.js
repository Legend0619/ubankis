import { db, parseJson } from "./db.js";

export function toCategory(c) {
  return {
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    tint: c.tint,
    tagline: c.tagline,
    description: c.description,
    benefits: parseJson(c.benefits, []),
    faqs: parseJson(c.faqs, []),
  };
}

export function toProduct(p) {
  return {
    id: p.id,
    slug: p.slug,
    kind: p.kind,
    categorySlug: p.category_slug,
    categoryName: p.category_name ?? null,
    tint: p.tint ?? "#c9a45c",
    name: p.name,
    shortDesc: p.short_desc,
    description: p.description,
    priceCents: p.price_cents,
    unit: p.unit,
    planKey: p.plan_key,
    rx: !!p.rx,
    bestSeller: !!p.best_seller,
    rating: Math.round(p.rating * 10) / 10,
    reviewCount: p.review_count,
    form: p.form,
    imageUrl: p.image_url,
    benefits: parseJson(p.benefits, []),
    usage: p.usage,
    active: !!p.active,
  };
}

export const PRODUCT_SELECT = `
  SELECT p.*, c.name AS category_name, c.tint AS tint
  FROM products p LEFT JOIN categories c ON c.slug = p.category_slug`;

export function getOrder(id) {
  const o = db.prepare(`SELECT o.*, u.email, u.first_name, u.last_name FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?`).get(id);
  if (!o) return null;
  const items = db.prepare(`SELECT * FROM order_items WHERE order_id = ? ORDER BY id`).all(id);
  const events = db.prepare(`SELECT status, note, created_at FROM order_events WHERE order_id = ? ORDER BY id`).all(id);
  return {
    id: o.id,
    number: `UB-${String(o.id).padStart(6, "0")}`,
    userId: o.user_id,
    customer: { email: o.email, name: `${o.first_name} ${o.last_name}` },
    status: o.status,
    subtotalCents: o.subtotal_cents,
    memberDiscountCents: o.member_discount_cents,
    promoDiscountCents: o.promo_discount_cents,
    shippingCents: o.shipping_cents,
    totalCents: o.total_cents,
    promoCode: o.promo_code,
    shippingAddress: parseJson(o.shipping_address, null),
    requiresReview: !!o.requires_review,
    paymentProvider: o.payment_provider,
    paidAt: o.paid_at,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    items: items.map((i) => ({
      productId: i.product_id,
      slug: i.slug,
      name: i.name,
      kind: i.kind,
      rx: !!i.rx,
      unit: i.unit,
      unitPriceCents: i.unit_price_cents,
      qty: i.qty,
    })),
    events: events.map((e) => ({ status: e.status, note: e.note, at: e.created_at })),
  };
}
