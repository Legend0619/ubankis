import { Router } from "express";
import { db, parseJson } from "../db.js";
import { requireAdmin } from "../auth.js";
import { badRequest, HttpError, intParam } from "../utils.js";

const router = Router();
router.use(requireAdmin);

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"];

const toLead = (l) => ({
  id: l.id,
  source: l.source,
  name: l.name,
  email: l.email,
  phone: l.phone,
  company: l.company,
  website: l.website,
  services: parseJson(l.services, []),
  budget: l.budget,
  message: l.message,
  status: l.status,
  createdAt: l.created_at,
  updatedAt: l.updated_at,
});

router.get("/stats", (_req, res) => {
  const count = (where = "1 = 1", ...params) => db.prepare(`SELECT COUNT(*) AS n FROM leads WHERE ${where}`).get(...params).n;
  const byService = {};
  for (const { services } of db.prepare("SELECT services FROM leads").all()) {
    for (const s of parseJson(services, [])) byService[s] = (byService[s] || 0) + 1;
  }
  res.json({
    total: count(),
    new: count("status = 'new'"),
    lastWeek: count("created_at >= datetime('now', '-7 days')"),
    won: count("status = 'won'"),
    bySource: { contact: count("source = 'contact'"), analysis: count("source = 'analysis'") },
    byService,
    subscribers: db.prepare("SELECT COUNT(*) AS n FROM subscribers").get().n,
  });
});

router.get("/leads", (req, res) => {
  const { status } = req.query;
  const rows = LEAD_STATUSES.includes(status)
    ? db.prepare("SELECT * FROM leads WHERE status = ? ORDER BY id DESC").all(status)
    : db.prepare("SELECT * FROM leads ORDER BY id DESC").all();
  res.json({ leads: rows.map(toLead), statuses: LEAD_STATUSES });
});

router.patch("/leads/:id", (req, res) => {
  const id = intParam(req.params.id);
  if (!LEAD_STATUSES.includes(req.body.status)) throw badRequest("Invalid status");
  const { changes } = db.prepare("UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.body.status, id);
  if (!changes) throw new HttpError(404, "Lead not found");
  res.json({ lead: toLead(db.prepare("SELECT * FROM leads WHERE id = ?").get(id)) });
});

router.get("/subscribers", (_req, res) => {
  res.json({ subscribers: db.prepare("SELECT email, created_at FROM subscribers ORDER BY created_at DESC").all() });
});

export default router;
