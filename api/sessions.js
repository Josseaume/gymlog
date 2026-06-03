import { sql } from "@vercel/postgres";
import { requireAuth, requireUser, ensureSchema, seedIfEmpty, readBody } from "./_lib.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  try {
    await ensureSchema();
    const uid = requireUser(req, res);
    if (!uid) return;
    if (req.method === "GET") {
      await seedIfEmpty();
      const { rows } = await sql`SELECT id, label, date, duration, notes, exercises
        FROM sessions WHERE user_id=${uid} ORDER BY date DESC NULLS LAST, id DESC`;
      return res.status(200).json(rows);
    }
    if (req.method === "POST") {
      const b = readBody(req);
      const { rows } = await sql`INSERT INTO sessions (user_id, label, date, duration, notes, exercises)
        VALUES (${uid}, ${b.label || "Séance"}, ${b.date || null}, ${b.duration ?? null},
                ${b.notes || ""}, ${JSON.stringify(b.exercises || [])}::jsonb)
        RETURNING id, label, date, duration, notes, exercises`;
      return res.status(201).json(rows[0]);
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
