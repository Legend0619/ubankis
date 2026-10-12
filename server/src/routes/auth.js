import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { publicUser, requireAuth, signToken } from "../auth.js";
import { badRequest, email, HttpError, str, US_STATES } from "../utils.js";

const router = Router();

router.post("/register", (req, res) => {
  const addr = email(req.body.email);
  const password = str(req.body.password, "Password", { min: 8, max: 128 });
  const firstName = str(req.body.firstName, "First name", { max: 60 });
  const lastName = str(req.body.lastName, "Last name", { max: 60 });

  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(addr)) {
    throw new HttpError(409, "An account with that email already exists");
  }
  const { lastInsertRowid } = db
    .prepare("INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)")
    .run(addr, bcrypt.hashSync(password, 10), firstName, lastName);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(lastInsertRowid);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

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

router.patch("/me", requireAuth, (req, res) => {
  const firstName = str(req.body.firstName, "First name", { max: 60 });
  const lastName = str(req.body.lastName, "Last name", { max: 60 });
  const phone = str(req.body.phone, "Phone", { required: false, max: 30 });
  let address = null;
  if (req.body.address && Object.values(req.body.address).some(Boolean)) address = parseAddress(req.body.address);

  db.prepare("UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ? WHERE id = ?")
    .run(firstName, lastName, phone || null, address ? JSON.stringify(address) : null, req.user.id);
  res.json({ user: publicUser(db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id)) });
});

router.post("/password", requireAuth, (req, res) => {
  const current = str(req.body.currentPassword, "Current password", { max: 128 });
  const next = str(req.body.newPassword, "New password", { min: 8, max: 128 });
  if (!bcrypt.compareSync(current, req.user.password_hash)) throw badRequest("Current password is incorrect");
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(bcrypt.hashSync(next, 10), req.user.id);
  res.json({ ok: true });
});

export function parseAddress(a = {}) {
  const address = {
    firstName: str(a.firstName, "First name", { max: 60 }),
    lastName: str(a.lastName, "Last name", { max: 60 }),
    line1: str(a.line1, "Street address", { max: 120 }),
    line2: str(a.line2, "Apartment / suite", { required: false, max: 120 }),
    city: str(a.city, "City", { max: 80 }),
    state: str(a.state, "State", { max: 2 }).toUpperCase(),
    zip: str(a.zip, "ZIP code", { max: 10 }),
    phone: str(a.phone, "Phone", { max: 30 }),
  };
  if (!US_STATES.includes(address.state)) throw badRequest("Please choose a valid U.S. state");
  if (!/^\d{5}(-\d{4})?$/.test(address.zip)) throw badRequest("Please enter a valid ZIP code");
  if (address.phone.replace(/\D/g, "").length < 10) throw badRequest("Please enter a valid phone number");
  return address;
}

export default router;
