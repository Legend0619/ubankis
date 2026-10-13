import { Router } from "express";
import { db } from "../db.js";
import { badRequest, email, str } from "../utils.js";

const router = Router();

export const SERVICE_SLUGS = ["web-design-development", "digital-marketing", "influencer-marketing", "ai-workforce", "software-development"];
export const BUDGETS = ["Under $2,500/mo", "$2,500–$5,000/mo", "$5,000–$10,000/mo", "$10,000+/mo", "Not sure yet"];
const SOURCES = ["contact", "analysis"];

function parseWebsite(value, required) {
  const raw = str(value, "Website", { required, max: 300 });
  if (!raw) return "";
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const { hostname } = new URL(url);
    if (!hostname.includes(".")) throw new Error();
  } catch {
    throw badRequest("Please enter a valid website address");
  }
  return url;
}

router.post("/leads", (req, res) => {
  const source = SOURCES.includes(req.body.source) ? req.body.source : "contact";
  const isAnalysis = source === "analysis";
  const services = (Array.isArray(req.body.services) ? req.body.services : [])
    .filter((s) => SERVICE_SLUGS.includes(s));
  if (isAnalysis && !services.length) throw badRequest("Please choose at least one service");
  const budget = req.body.budget ? String(req.body.budget) : "";
  if (budget && !BUDGETS.includes(budget)) throw badRequest("Please choose a budget range");

  db.prepare(`INSERT INTO leads (source, name, email, phone, company, website, services, budget, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    source,
    str(req.body.name, "Name", { max: 100 }),
    email(req.body.email),
    str(req.body.phone, "Phone", { required: false, max: 30 }) || null,
    str(req.body.company, "Company", { required: isAnalysis, max: 120 }) || null,
    parseWebsite(req.body.website, isAnalysis) || null,
    JSON.stringify([...new Set(services)]),
    budget || null,
    str(req.body.message, "Message", { required: !isAnalysis, min: isAnalysis ? 0 : 10, max: 5000 }),
  );
  res.status(201).json({ ok: true });
});

router.post("/newsletter", (req, res) => {
  db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(email(req.body.email));
  res.status(201).json({ ok: true });
});

export default router;
