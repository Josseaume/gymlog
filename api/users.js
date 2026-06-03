import { sql } from "@vercel/postgres";
import { requireAuth, ensureSchema, seedIfEmpty, readBody } from "./_lib.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  try {
    await ensureSchema();
    if (req.method === "GET") {
      await seedIfEmpty(); // garantit au moins le profil par défaut
      const { rows } = await sql`SELECT id, name, emoji, height_cm, level,
        rest_seconds, reps_threshold FROM users ORDER BY id ASC`;
      return res.status(200).json(rows);
    }
    if (req.method === "POST") {
      const b = readBody(req);
      if (!b.name || !String(b.name).trim())
        return res.status(400).json({ error: "Nom requis" });
      const { rows } = await sql`INSERT INTO users (name, emoji)
        VALUES (${String(b.name).trim()}, ${b.emoji || "🦾"})
        RETURNING id, name, emoji, height_cm, level, rest_seconds, reps_threshold`;
      return res.status(201).json(rows[0]);
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
