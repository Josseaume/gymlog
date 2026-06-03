import { sql } from "@vercel/postgres";
import { requireAuth, requireUser, ensureSchema, readBody } from "../_lib.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  const id = req.query.id;
  try {
    await ensureSchema();
    const uid = requireUser(req, res);
    if (!uid) return;
    if (req.method === "PUT") {
      const b = readBody(req);
      if (b.pinned) await sql`UPDATE goals SET pinned=false WHERE user_id=${uid}`;
      const { rows } = await sql`UPDATE goals SET
        type=${b.type}, label=${b.label || null}, exercise=${b.exercise || null},
        kind=${b.kind || null}, target=${b.target ?? null},
        target_distance=${b.target_distance ?? null}, target_seconds=${b.target_seconds ?? null},
        baseline=${b.baseline ?? null}, pinned=${!!b.pinned}
        WHERE id=${id} AND user_id=${uid}
        RETURNING id, type, label, exercise, kind, target, target_distance, target_seconds, baseline, pinned`;
      if (rows.length === 0) return res.status(404).json({ error: "Introuvable" });
      return res.status(200).json(rows[0]);
    }
    if (req.method === "DELETE") {
      await sql`DELETE FROM goals WHERE id=${id} AND user_id=${uid}`;
      return res.status(204).end();
    }
    res.setHeader("Allow", "PUT, DELETE");
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
