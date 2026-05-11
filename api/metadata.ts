import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_lib/cors.js";
import { sql } from "./_lib/db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    // Single round-trip via json_agg — avoids 4 parallel connections on cold start.
    // This reduces cold-start time from ~20-30s to ~1-2s on Supabase transaction pooler.
    const [row] = await sql<
      {
        pillars: any;
        dimensions: any;
        questions: any;
        weights: any;
      }[]
    >`
      SELECT
        (SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json)
           FROM (SELECT id, name FROM pillars) p) AS pillars,
        (SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json)
           FROM (SELECT id, name FROM dimensions) d) AS dimensions,
        (SELECT COALESCE(json_agg(row_to_json(q)), '[]'::json)
           FROM (SELECT id, text, "pillarId", "dimensionId", "maxScore", weight
                 FROM questions ORDER BY id) q) AS questions,
        (SELECT COALESCE(json_agg(row_to_json(w)), '[]'::json)
           FROM (SELECT id, "pillarId", "dimensionId", weight
                 FROM weights ORDER BY "pillarId", "dimensionId") w) AS weights
    `;

    // Cache the static reference data aggressively.
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    return res.json(row);
  } catch (error) {
    console.error("metadata endpoint failed:", error);
    return res.status(500).json({ error: "metadata failure", details: String(error) });
  }
}
