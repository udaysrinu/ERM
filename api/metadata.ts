import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_lib/cors.js";
import { sql } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const [pillars, dimensions, questions, weights] = await Promise.all([
    sql`SELECT id, name FROM pillars`,
    sql`SELECT id, name FROM dimensions`,
    sql`SELECT id, text, "pillarId", "dimensionId", "maxScore", weight FROM questions ORDER BY id`,
    sql`SELECT id, "pillarId", "dimensionId", weight FROM weights ORDER BY "pillarId", "dimensionId"`,
  ]);

  return res.json({ pillars, dimensions, questions, weights });
}
