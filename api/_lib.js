import { sql } from "@vercel/postgres";
import { SEED_SESSIONS } from "../data/seed.js";

export function checkPassword(authHeader) {
  const expected = process.env.GYM_PASSWORD;
  if (!expected) return false;
  if (typeof authHeader !== "string") return false;
  const m = authHeader.match(/^Bearer\s+(.+)$/);
  return !!m && m[1] === expected;
}

export function requireAuth(req, res) {
  if (!checkPassword(req.headers.authorization)) {
    res.status(401).json({ error: "Non autorisé" });
    return false;
  }
  return true;
}

export async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    date TEXT,
    duration INTEGER,
    notes TEXT DEFAULT '',
    exercises JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
}

export async function seedIfEmpty() {
  const { rows } = await sql`SELECT COUNT(*)::int AS n FROM sessions`;
  if (rows[0].n > 0) return;
  for (const s of SEED_SESSIONS) {
    await sql`INSERT INTO sessions (label, date, duration, notes, exercises)
      VALUES (${s.label}, ${s.date}, ${s.duration}, ${s.notes || ""},
              ${JSON.stringify(s.exercises)}::jsonb)`;
  }
}

export function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}
