import { sql } from "@vercel/postgres";
import { del } from "@vercel/blob";
import { requireAuth, requireUser, ensureSchema } from "../_lib.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  const id = req.query.id;
  try {
    await ensureSchema();
    const uid = requireUser(req, res);
    if (!uid) return;
    if (req.method === "DELETE") {
      const { rows } = await sql`SELECT url FROM photos WHERE id=${id} AND user_id=${uid}`;
      if (rows.length) {
        try { await del(rows[0].url); } catch { /* blob déjà supprimé */ }
      }
      await sql`DELETE FROM photos WHERE id=${id} AND user_id=${uid}`;
      return res.status(204).end();
    }
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
