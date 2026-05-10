import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../_lib/cors.js";
import { sql } from "../_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { entityId } = req.body ?? {};
  if (!entityId) return res.status(400).json({ error: "entityId required" });

  const id = "TX" + Math.random().toString(36).substring(2, 11).toUpperCase();
  const createdAt = new Date().toISOString();

  await sql`
    INSERT INTO assessments (id, "entityId", "createdAt")
    VALUES (${id}, ${entityId}, ${createdAt})
  `;

  return res.json({ id, entityId, createdAt });
}
