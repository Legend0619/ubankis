import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT) || 4000;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
export const DB_PATH = process.env.DB_PATH || path.join(here, "..", "data", "ubenkis.db");
export const CLIENT_DIST = path.join(here, "..", "..", "client", "dist");

export const JWT_SECRET = process.env.JWT_SECRET || "ubenkis-dev-secret";
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") throw new Error("JWT_SECRET must be set in production");
  console.warn("JWT_SECRET not set; using an insecure development secret.");
}
