import { sql } from "@vercel/postgres";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { requireAuth, requireUser, ensureSchema, readBody } from "./_lib.js";

// Décode une data URL "data:image/jpeg;base64,...." → { buffer, contentType }
function decodeDataUrl(dataUrl) {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl || "");
  if (!m) return null;
  return { contentType: m[1], buffer: Buffer.from(m[2], "base64") };
}

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  try {
    await ensureSchema();
    const uid = requireUser(req, res);
    if (!uid) return;
    if (req.method === "GET") {
      const { rows } = await sql`SELECT id, date, label, url FROM photos
        WHERE user_id=${uid} ORDER BY date DESC, id DESC`;
      return res.status(200).json(rows);
    }
    if (req.method === "POST") {
      const b = readBody(req);
      const dec = decodeDataUrl(b.dataUrl);
      if (!dec) return res.status(400).json({ error: "Image manquante ou invalide" });
      const ext = dec.contentType.includes("png") ? "png" : "jpg";
      const blob = await put(`u${uid}/${randomUUID()}.${ext}`, dec.buffer, {
        access: "public", contentType: dec.contentType,
      });
      const { rows } = await sql`INSERT INTO photos (user_id, date, label, url, pathname)
        VALUES (${uid}, ${b.date || null}, ${b.label || ""}, ${blob.url}, ${blob.pathname})
        RETURNING id, date, label, url`;
      return res.status(201).json(rows[0]);
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
