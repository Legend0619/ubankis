import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";
import { CLIENT_DIST, CLIENT_URL, PORT } from "./config.js";
import { db } from "./db.js";
import { seed } from "./seed.js";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import adminRoutes from "./routes/admin.js";

if (!db.prepare("SELECT COUNT(*) AS n FROM users").get().n) {
  seed(db);
  console.log("Seeded database with an admin account and sample leads.");
}

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", leadRoutes);
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// In production, serve the built React app with SPA fallback.
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.use((req, res, next) => (req.method === "GET" ? res.sendFile(path.join(CLIENT_DIST, "index.html")) : next()));
}

app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? "Something went wrong. Please try again." : err.message });
});

app.listen(PORT, () => {
  console.log(`Ubenkis API on http://localhost:${PORT}`);
});
