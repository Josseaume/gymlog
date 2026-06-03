import { sql } from "@vercel/postgres";
import { requireAuth, requireUser, ensureSchema, readBody } from "./_lib.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  try {
    await ensureSchema();
    const uid = requireUser(req, res);
    if (!uid) return;
    if (req.method === "GET") {
      const { rows } = await sql`SELECT id, date, text, focus FROM analyses
        WHERE user_id=${uid} ORDER BY date DESC, id DESC`;
      return res.status(200).json(rows);
    }
    if (req.method === "POST") {
      const b = readBody(req);
      const { rows } = await sql`INSERT INTO analyses (user_id, date, text, focus)
        VALUES (${uid}, ${b.date || null}, ${b.text || ""}, ${JSON.stringify(b.focus || [])}::jsonb)
        RETURNING id, date, text, focus`;
      return res.status(201).json(rows[0]);
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
