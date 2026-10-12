import { Router } from "express";
import { db } from "../db.js";
import { optionalAuth } from "../auth.js";
import { PRODUCT_SELECT, toProduct } from "../mappers.js";
import { badRequest, email, str } from "../utils.js";

const router = Router();

const GOALS = {
  energy: "testosterone",
  weight: "weight-loss",
  recovery: "peptides",
  performance: "sexual-health",
  hair: "hair",
  aging: "longevity",
};

router.post("/assessments", optionalAuth, (req, res) => {
  const answers = req.body.answers || {};
  const category = GOALS[answers.goal];
  if (!category) throw badRequest("Please choose a goal");
  const contact = req.user?.email || (req.body.email ? email(req.body.email) : null);

  const clean = {};
  for (const [k, v] of Object.entries(answers).slice(0, 20)) {
    clean[String(k).slice(0, 40)] = Array.isArray(v) ? v.slice(0, 20).map((x) => String(x).slice(0, 100)) : String(v).slice(0, 200);
  }
  db.prepare("INSERT INTO consultations (type, user_id, email, answers, recommended_category) VALUES ('assessment', ?, ?, ?, ?)")
    .run(req.user?.id ?? null, contact, JSON.stringify(clean), category);

  // Recommend a lab panel when there's no recent bloodwork.
  const products = db.prepare(`${PRODUCT_SELECT} WHERE p.category_slug = ? AND p.active = 1 ORDER BY p.best_seller DESC, p.review_count DESC LIMIT 3`)
    .all(category).map(toProduct);
  const labs = answers.labs !== "yes"
    ? db.prepare(`${PRODUCT_SELECT} WHERE p.slug = 'at-home-lab-panel' AND p.active = 1`).get()
    : null;
  const recommended = db.prepare("SELECT slug, name, tagline FROM categories WHERE slug = ?").get(category);

  res.status(201).json({ category: recommended, products, labPanel: labs ? toProduct(labs) : null });
});

router.post("/newsletter", (req, res) => {
  db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(email(req.body.email));
  res.status(201).json({ ok: true });
});

router.post("/contact", (req, res) => {
  db.prepare("INSERT INTO messages (name, email, subject, body) VALUES (?, ?, ?, ?)").run(
    str(req.body.name, "Name", { max: 100 }),
    email(req.body.email),
    str(req.body.subject, "Subject", { max: 150 }),
    str(req.body.message, "Message", { min: 10, max: 5000 }),
  );
  res.status(201).json({ ok: true });
});

export default router;
