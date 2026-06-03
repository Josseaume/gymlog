import { sql } from "@vercel/postgres";
import { requireAuth, requireUser, ensureSchema, readBody } from "./_lib.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  try {
    await ensureSchema();
    const uid = requireUser(req, res);
    if (!uid) return;
    if (req.method === "GET") {
      const { rows } = await sql`SELECT id, date, kind, value FROM body_metrics
        WHERE user_id=${uid} ORDER BY date ASC, id ASC`;
      return res.status(200).json(rows);
    }
    if (req.method === "POST") {
      const b = readBody(req);
      if (!b.kind) return res.status(400).json({ error: "kind requis" });
      const { rows } = await sql`INSERT INTO body_metrics (user_id, date, kind, value)
        VALUES (${uid}, ${b.date || null}, ${b.kind}, ${b.value ?? null})
        RETURNING id, date, kind, value`;
      return res.status(201).json(rows[0]);
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
