import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_lib/cors.js";
import { sql } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const type = typeof req.query.type === "string" ? req.query.type : null;

  const rows = type
    ? await sql`SELECT * FROM benchmarks WHERE type = ${type}`
    : await sql`SELECT * FROM benchmarks ORDER BY type, "pillarId"`;

  return res.json(rows);
}
