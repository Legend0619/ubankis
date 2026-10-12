import { Router } from "express";
import { db, parseJson, tx } from "../db.js";
import { publicUser, requireAdmin } from "../auth.js";
import { getOrder, PRODUCT_SELECT, toProduct } from "../mappers.js";
import { badRequest, HttpError, intParam, str } from "../utils.js";
import { cancelOrder, ORDER_STATUSES } from "./orders.js";

const router = Router();
router.use(requireAdmin);

router.get("/stats", (_req, res) => {
  const one = (sql) => db.prepare(sql).get();
  const revenue = one("SELECT COALESCE(SUM(total_cents), 0) AS v FROM orders WHERE paid_at IS NOT NULL AND status != 'cancelled'").v;
  const orders = one("SELECT COUNT(*) AS v FROM orders WHERE status != 'pending_payment'").v;
  const customers = one("SELECT COUNT(*) AS v FROM users WHERE role = 'customer'").v;
  const inReview = one("SELECT COUNT(*) AS v FROM orders WHERE status = 'in_review'").v;
  const members = one("SELECT COUNT(*) AS v FROM users WHERE membership IS NOT NULL").v;
  const topProducts = db.prepare(`
    SELECT i.name, SUM(i.qty) AS units, SUM(i.qty * i.unit_price_cents) AS revenue_cents
    FROM order_items i JOIN orders o ON o.id = i.order_id
    WHERE o.paid_at IS NOT NULL AND o.status != 'cancelled'
    GROUP BY i.name ORDER BY revenue_cents DESC LIMIT 5`).all()
    .map((r) => ({ name: r.name, units: r.units, revenueCents: r.revenue_cents }));
  const recent = db.prepare("SELECT id FROM orders ORDER BY id DESC LIMIT 6").all().map((r) => getOrder(r.id));
  res.json({ revenueCents: revenue, orders, customers, inReview, members, topProducts, recent });
});

router.get("/orders", (req, res) => {
  const status = req.query.status;
  const rows = status && ORDER_STATUSES.includes(status)
    ? db.prepare("SELECT id FROM orders WHERE status = ? ORDER BY id DESC").all(status)
    : db.prepare("SELECT id FROM orders ORDER BY id DESC").all();
  res.json({ orders: rows.map((r) => getOrder(r.id)), statuses: ORDER_STATUSES });
});

router.get("/orders/:id", (req, res) => {
  const order = getOrder(intParam(req.params.id));
  if (!order) throw new HttpError(404, "Order not found");
  const intake = db.prepare("SELECT answers, created_at FROM consultations WHERE order_id = ? AND type = 'intake'").get(order.id);
  res.json({ order, intake: intake ? { ...parseJson(intake.answers, {}), submittedAt: intake.created_at } : null });
});

router.patch("/orders/:id", (req, res) => {
  const order = getOrder(intParam(req.params.id));
  if (!order) throw new HttpError(404, "Order not found");
  const status = req.body.status;
  if (!ORDER_STATUSES.includes(status) || status === "pending_payment") throw badRequest("Invalid status");
  if (order.status === "pending_payment") throw badRequest("Order has not been paid yet");
  const note = str(req.body.note, "Note", { required: false, max: 300 }) || null;
  if (order.status === "cancelled") throw badRequest("Cancelled orders can't be reopened");
  if (status === "cancelled") {
    tx(() => cancelOrder(order, note || "Cancelled by Ubankis — refund issued"));
    return res.json({ order: getOrder(order.id) });
  }
  tx(() => {
    db.prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, order.id);
    db.prepare("INSERT INTO order_events (order_id, status, note) VALUES (?, ?, ?)").run(order.id, status, note);
    if (order.requiresReview && order.status === "in_review" && status === "processing") {
      db.prepare("UPDATE consultations SET status = 'reviewed' WHERE order_id = ?").run(order.id);
    }
  });
  res.json({ order: getOrder(order.id) });
});

router.get("/products", (_req, res) => {
  const rows = db.prepare(`${PRODUCT_SELECT} ORDER BY p.kind, p.category_slug, p.sort`).all();
  res.json({ products: rows.map(toProduct) });
});

function parseProduct(body, existing = {}) {
  const priceCents = Math.round(Number(body.priceCents ?? existing.price_cents));
  if (!Number.isInteger(priceCents) || priceCents < 0) throw badRequest("Price must be a positive amount");
  const slug = str(body.slug ?? existing.slug, "Slug", { max: 80 }).toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) throw badRequest("Slug may only contain lowercase letters, numbers and dashes");
  const category = body.categorySlug ?? existing.category_slug;
  if (category && !db.prepare("SELECT 1 FROM categories WHERE slug = ?").get(category)) throw badRequest("Unknown category");
  const benefits = Array.isArray(body.benefits) ? body.benefits.map((b) => String(b).trim()).filter(Boolean).slice(0, 8) : parseJson(existing.benefits, []);
  return {
    slug,
    category_slug: category || null,
    name: str(body.name ?? existing.name, "Name", { max: 120 }),
    short_desc: str(body.shortDesc ?? existing.short_desc, "Short description", { max: 200 }),
    description: str(body.description ?? existing.description, "Description", { required: false, max: 5000 }),
    price_cents: priceCents,
    unit: ["mo", "one-time", "yr"].includes(body.unit) ? body.unit : existing.unit || "mo",
    rx: body.rx === undefined ? existing.rx ?? 0 : body.rx ? 1 : 0,
    best_seller: body.bestSeller === undefined ? existing.best_seller ?? 0 : body.bestSeller ? 1 : 0,
    form: ["vial", "bottle", "box", "kit"].includes(body.form) ? body.form : existing.form || "bottle",
    image_url: str(body.imageUrl ?? existing.image_url ?? "", "Image URL", { required: false, max: 500 }) || null,
    benefits: JSON.stringify(benefits),
    usage: str(body.usage ?? existing.usage ?? "", "Usage", { required: false, max: 1000 }),
    active: body.active === undefined ? existing.active ?? 1 : body.active ? 1 : 0,
  };
}

router.post("/products", (req, res) => {
  const p = parseProduct(req.body);
  if (db.prepare("SELECT 1 FROM products WHERE slug = ?").get(p.slug)) throw new HttpError(409, "Slug is already in use");
  const cols = Object.keys(p);
  const { lastInsertRowid } = db.prepare(`INSERT INTO products (${cols.join(", ")}, rating, review_count) VALUES (${cols.map(() => "?").join(", ")}, 5, 0)`)
    .run(...Object.values(p));
  res.status(201).json({ product: toProduct(db.prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(lastInsertRowid)) });
});

router.patch("/products/:id", (req, res) => {
  const id = intParam(req.params.id);
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  if (!existing) throw new HttpError(404, "Product not found");
  const p = parseProduct(req.body, existing);
  if (p.slug !== existing.slug && db.prepare("SELECT 1 FROM products WHERE slug = ?").get(p.slug)) throw new HttpError(409, "Slug is already in use");
  if (existing.kind === "membership") p.category_slug = null;
  db.prepare(`UPDATE products SET ${Object.keys(p).map((k) => `${k} = ?`).join(", ")} WHERE id = ?`).run(...Object.values(p), id);
  res.json({ product: toProduct(db.prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id)) });
});

router.get("/customers", (_req, res) => {
  const rows = db.prepare(`
    SELECT u.*, COUNT(o.id) AS order_count, COALESCE(SUM(CASE WHEN o.paid_at IS NOT NULL AND o.status != 'cancelled' THEN o.total_cents END), 0) AS spent
    FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id ORDER BY u.id DESC`).all();
  res.json({ customers: rows.map((u) => ({ ...publicUser(u), orderCount: u.order_count, spentCents: u.spent })) });
});

router.get("/consultations", (_req, res) => {
  const rows = db.prepare("SELECT * FROM consultations ORDER BY id DESC LIMIT 200").all();
  res.json({
    consultations: rows.map((c) => ({
      id: c.id, type: c.type, email: c.email, orderId: c.order_id, status: c.status,
      recommendedCategory: c.recommended_category, answers: parseJson(c.answers, {}), createdAt: c.created_at,
    })),
  });
});

router.get("/messages", (_req, res) => {
  const messages = db.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 200").all();
  const subscribers = db.prepare("SELECT email, created_at FROM subscribers ORDER BY created_at DESC LIMIT 500").all();
  res.json({ messages, subscribers });
});

export default router;
