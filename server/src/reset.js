// Deletes the database and re-seeds it: `npm run seed`
import fs from "node:fs";
import { DB_PATH } from "./config.js";

for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(DB_PATH + suffix, { force: true });

const { db } = await import("./db.js");
const { seed } = await import("./seed.js");
seed(db);
console.log(`Database reset and seeded at ${DB_PATH}`);
