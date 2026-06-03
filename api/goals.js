import { sql } from "@vercel/postgres";
import { requireAuth, requireUser, ensureSchema, readBody } from "./_lib.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  try {
    await ensureSchema();
    const uid = requireUser(req, res);
    if (!uid) return;
    if (req.method === "GET") {
      const { rows } = await sql`SELECT id, type, label, exercise, kind, target,
        target_distance, target_seconds, baseline, pinned
        FROM goals WHERE user_id=${uid} ORDER BY pinned DESC, id ASC`;
      return res.status(200).json(rows);
    }
    if (req.method === "POST") {
      const b = readBody(req);
      if (b.pinned) await sql`UPDATE goals SET pinned=false WHERE user_id=${uid}`;
      const { rows } = await sql`INSERT INTO goals
        (user_id, type, label, exercise, kind, target, target_distance, target_seconds, baseline, pinned)
        VALUES (${uid}, ${b.type}, ${b.label || null}, ${b.exercise || null}, ${b.kind || null},
                ${b.target ?? null}, ${b.target_distance ?? null}, ${b.target_seconds ?? null},
                ${b.baseline ?? null}, ${!!b.pinned})
        RETURNING id, type, label, exercise, kind, target, target_distance, target_seconds, baseline, pinned`;
      return res.status(201).json(rows[0]);
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
