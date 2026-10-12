import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";
import { db, parseJson } from "./db.js";
import { HttpError } from "./utils.js";

export const signToken = (user) => jwt.sign({ sub: String(user.id) }, JWT_SECRET, { expiresIn: "7d" });

export function optionalAuth(req, _res, next) {
  req.user = null;
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    try {
      const { sub } = jwt.verify(header.slice(7), JWT_SECRET);
      req.user = db.prepare("SELECT * FROM users WHERE id = ?").get(Number(sub)) || null;
    } catch {
      // Invalid or expired token: treat as signed out.
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => next(req.user ? undefined : new HttpError(401, "Please sign in to continue")));
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    next(req.user.role === "admin" ? undefined : new HttpError(403, "Admins only"));
  });
}

export function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    phone: u.phone || "",
    role: u.role,
    membership: u.membership,
    address: parseJson(u.address, null),
    createdAt: u.created_at,
  };
}
