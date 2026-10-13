import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { publicUser, requireAuth, signToken } from "../auth.js";
import { badRequest, email, HttpError, str } from "../utils.js";

const router = Router();

router.post("/login", (req, res) => {
  const addr = email(req.body.email);
  const password = str(req.body.password, "Password", { max: 128 });
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(addr);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new HttpError(401, "Incorrect email or password");
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post("/password", requireAuth, (req, res) => {
  const current = str(req.body.currentPassword, "Current password", { max: 128 });
  const next = str(req.body.newPassword, "New password", { min: 8, max: 128 });
  if (!bcrypt.compareSync(current, req.user.password_hash)) throw badRequest("Current password is incorrect");
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(bcrypt.hashSync(next, 10), req.user.id);
  res.json({ ok: true });
});

export default router;
