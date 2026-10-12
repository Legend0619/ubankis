import { Router } from "express";
import { db } from "../db.js";
import { optionalAuth, requireAuth } from "../auth.js";
import { PRODUCT_SELECT, toCategory, toProduct } from "../mappers.js";
import { quote } from "../pricing.js";
import { badRequest, HttpError, str } from "../utils.js";

const router = Router();

const SORTS = {
  popular: "p.best_seller DESC, p.review_count DESC",
  rating: "p.rating DESC, p.review_count DESC",
  "price-asc": "p.price_cents ASC",
  "price-desc": "p.price_cents DESC",
  name: "p.name COLLATE NOCASE ASC",
};

router.get("/categories", (_req, res) => {
  const rows = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_slug = c.slug AND p.active = 1) AS product_count
    FROM categories c ORDER BY c.sort`).all();
  res.json({ categories: rows.map((c) => ({ ...toCategory(c), productCount: c.product_count })) });
});

router.get("/categories/:slug", (req, res) => {
  const c = db.prepare("SELECT * FROM categories WHERE slug = ?").get(req.params.slug);
  if (!c) throw new HttpError(404, "Treatment not found");
  const products = db.prepare(`${PRODUCT_SELECT} WHERE p.category_slug = ? AND p.active = 1 ORDER BY ${SORTS.popular}`).all(c.slug);
  res.json({ category: toCategory(c), products: products.map(toProduct) });
});

router.get("/products", (req, res) => {
  const where = ["p.active = 1", "p.kind = 'product'"];
  const params = [];
  if (req.query.category) {
    where.push("p.category_slug = ?");
    params.push(String(req.query.category));
  }
  if (req.query.q) {
    where.push("(p.name LIKE ? OR p.short_desc LIKE ? OR c.name LIKE ?)");
    const like = `%${String(req.query.q).slice(0, 80)}%`;
    params.push(like, like, like);
  }
  if (req.query.rx === "1" || req.query.rx === "0") {
    where.push("p.rx = ?");
    params.push(Number(req.query.rx));
  }
  const order = SORTS[req.query.sort] || SORTS.popular;
  const rows = db.prepare(`${PRODUCT_SELECT} WHERE ${where.join(" AND ")} ORDER BY ${order}`).all(...params);
  res.json({ products: rows.map(toProduct) });
});

router.get("/products/:slug", (req, res) => {
  const row = db.prepare(`${PRODUCT_SELECT} WHERE p.slug = ? AND p.active = 1`).get(req.params.slug);
  if (!row) throw new HttpError(404, "Product not found");
  const reviews = db.prepare(`SELECT id, author, rating, title, body, created_at FROM reviews WHERE product_id = ? ORDER BY id DESC LIMIT 20`).all(row.id);
  const related = db.prepare(`${PRODUCT_SELECT} WHERE p.category_slug = ? AND p.id != ? AND p.active = 1 ORDER BY ${SORTS.popular} LIMIT 4`)
    .all(row.category_slug, row.id);
  res.json({
    product: toProduct(row),
    reviews: reviews.map((r) => ({ id: r.id, author: r.author, rating: r.rating, title: r.title, body: r.body, createdAt: r.created_at })),
    related: related.map(toProduct),
  });
});

router.post("/products/:slug/reviews", requireAuth, (req, res) => {
  const p = db.prepare("SELECT * FROM products WHERE slug = ? AND active = 1 AND kind = 'product'").get(req.params.slug);
  if (!p) throw new HttpError(404, "Product not found");
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw badRequest("Rating must be 1–5 stars");
  const title = str(req.body.title, "Title", { max: 100 });
  const body = str(req.body.body, "Review", { min: 10, max: 2000 });
  const author = `${req.user.first_name} ${req.user.last_name.charAt(0)}.`;

  db.prepare("INSERT INTO reviews (product_id, user_id, author, rating, title, body) VALUES (?, ?, ?, ?, ?, ?)")
    .run(p.id, req.user.id, author, rating, title, body);
  db.prepare("UPDATE products SET rating = (rating * review_count + ?) / (review_count + 1), review_count = review_count + 1 WHERE id = ?")
    .run(rating, p.id);
  res.status(201).json({ ok: true });
});

router.get("/plans", (_req, res) => {
  const rows = db.prepare(`${PRODUCT_SELECT} WHERE p.kind = 'membership' AND p.active = 1 ORDER BY p.sort, p.unit`).all();
  const plans = new Map();
  for (const row of rows.map(toProduct)) {
    const plan = plans.get(row.planKey) || {
      key: row.planKey,
      name: row.name.replace(/ Membership.*$/, ""),
      description: row.shortDesc,
      perks: row.benefits,
      featured: row.bestSeller,
    };
    plan[row.unit === "yr" ? "annual" : "monthly"] = { productId: row.id, slug: row.slug, name: row.name, priceCents: row.priceCents, unit: row.unit };
    plans.set(row.planKey, plan);
  }
  res.json({ plans: [...plans.values()] });
});

router.post("/cart/quote", optionalAuth, (req, res) => {
  res.json(quote(req.body.items, { user: req.user, promoCode: req.body.promoCode }));
});

export default router;
