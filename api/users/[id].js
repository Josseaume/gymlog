import { sql } from "@vercel/postgres";
import { requireAuth, ensureSchema, readBody } from "../_lib.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  const id = req.query.id;
  try {
    await ensureSchema();
    if (req.method === "GET") {
      const { rows } = await sql`SELECT id, name, emoji, height_cm, level,
        rest_seconds, reps_threshold FROM users WHERE id=${id}`;
      if (rows.length === 0) return res.status(404).json({ error: "Introuvable" });
      return res.status(200).json(rows[0]);
    }
    if (req.method === "PUT") {
      const b = readBody(req);
      const { rows } = await sql`UPDATE users SET
        name=COALESCE(${b.name ?? null}, name),
        emoji=COALESCE(${b.emoji ?? null}, emoji),
        height_cm=${b.height_cm ?? null},
        level=${b.level ?? null},
        rest_seconds=COALESCE(${b.rest_seconds ?? null}, rest_seconds),
        reps_threshold=COALESCE(${b.reps_threshold ?? null}, reps_threshold)
        WHERE id=${id}
        RETURNING id, name, emoji, height_cm, level, rest_seconds, reps_threshold`;
      if (rows.length === 0) return res.status(404).json({ error: "Introuvable" });
      return res.status(200).json(rows[0]);
    }
    if (req.method === "DELETE") {
      // cascade manuelle des données du profil
      await sql`DELETE FROM sessions WHERE user_id=${id}`;
      await sql`DELETE FROM goals WHERE user_id=${id}`;
      await sql`DELETE FROM body_metrics WHERE user_id=${id}`;
      await sql`DELETE FROM analyses WHERE user_id=${id}`;
      await sql`DELETE FROM photos WHERE user_id=${id}`;
      await sql`DELETE FROM users WHERE id=${id}`;
      return res.status(204).end();
    }
    res.setHeader("Allow", "GET, PUT, DELETE");
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
