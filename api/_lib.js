import { sql } from "@vercel/postgres";
import { SEED_SESSIONS } from "../data/seed.js";

// ─── Auth (mot de passe partagé) ──────────────────────────────────────────
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

// ─── Profil courant (X-User-Id) ───────────────────────────────────────────
export function getUserId(headers = {}) {
  const raw = headers["x-user-id"];
  const id = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function requireUser(req, res) {
  const id = getUserId(req.headers);
  if (!id) { res.status(400).json({ error: "Profil manquant (X-User-Id)" }); return null; }
  return id;
}

// ─── Schéma + migration ───────────────────────────────────────────────────
export async function ensureSchema() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '🦾',
    height_cm INTEGER,
    level TEXT,
    rest_seconds INTEGER DEFAULT 120,
    reps_threshold INTEGER DEFAULT 13,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    date TEXT,
    duration INTEGER,
    notes TEXT DEFAULT '',
    exercises JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type TEXT NOT NULL,
    label TEXT,
    exercise TEXT,
    kind TEXT,
    target DOUBLE PRECISION,
    target_distance DOUBLE PRECISION,
    target_seconds INTEGER,
    baseline DOUBLE PRECISION,
    pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS body_metrics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date TEXT,
    kind TEXT NOT NULL,
    value DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS analyses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date TEXT,
    text TEXT,
    focus JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS photos (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    date TEXT,
    label TEXT,
    url TEXT NOT NULL,
    pathname TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
  // Migration : ajoute user_id à sessions (table historique) si absent.
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id BIGINT`;
}

// Renvoie l'id du profil par défaut, en le créant si aucun profil n'existe.
export async function ensureDefaultUser() {
  const { rows } = await sql`SELECT id FROM users ORDER BY id ASC LIMIT 1`;
  if (rows.length) return rows[0].id;
  const ins = await sql`INSERT INTO users (name, emoji) VALUES ('Arthur', '🦾') RETURNING id`;
  return ins.rows[0].id;
}

export async function seedIfEmpty() {
  const uid = await ensureDefaultUser();
  // Rattache d'éventuelles séances héritées (sans profil) au profil par défaut.
  await sql`UPDATE sessions SET user_id=${uid} WHERE user_id IS NULL`;
  const { rows } = await sql`SELECT COUNT(*)::int AS n FROM sessions WHERE user_id=${uid}`;
  if (rows[0].n > 0) return;
  for (const s of SEED_SESSIONS) {
    await sql`INSERT INTO sessions (user_id, label, date, duration, notes, exercises)
      VALUES (${uid}, ${s.label}, ${s.date}, ${s.duration}, ${s.notes || ""},
              ${JSON.stringify(s.exercises)}::jsonb)`;
  }
}

export function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}
