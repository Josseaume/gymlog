import { sql } from "@vercel/postgres";
import { requireAuth, ensureSchema, readBody } from "../_lib.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  const id = req.query.id;
  try {
    await ensureSchema();
    if (req.method === "PUT") {
      const b = readBody(req);
      const { rows } = await sql`UPDATE sessions SET
        label=${b.label || "Séance"}, date=${b.date || null}, duration=${b.duration ?? null},
        notes=${b.notes || ""}, exercises=${JSON.stringify(b.exercises || [])}::jsonb
        WHERE id=${id}
        RETURNING id, label, date, duration, notes, exercises`;
      if (rows.length === 0) return res.status(404).json({ error: "Introuvable" });
      return res.status(200).json(rows[0]);
    }
    if (req.method === "DELETE") {
      await sql`DELETE FROM sessions WHERE id=${id}`;
      return res.status(204).end();
    }
    res.setHeader("Allow", "PUT, DELETE");
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
