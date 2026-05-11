import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../_lib/cors.js";
import { sql } from "../_lib/db.js";
import { BUSINESS_UNIT_NAMES } from "../_lib/static.js";

/*
 * GET /api/assessments?operatorEmail=foo@gmail.com
 *
 * Returns the list of past completed assessments stamped with this operator,
 * newest first. Intentionally returns only the minimum the scope screen needs
 * to render the history panel — id, entity, timestamp, score. Detail comes
 * from GET /api/assessments/:id/analysis when the user clicks a row.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const rawEmail = req.query.operatorEmail;
  const email = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "operatorEmail query parameter is required" });
  }
  const normalized = email.trim().toLowerCase();

  try {
    const rows = await sql<{
      id: string;
      entityId: string;
      createdAt: string;
      overallScore: number | null;
      status: string;
    }[]>`
      SELECT id, "entityId", "createdAt", "overallScore", status
      FROM assessments
      WHERE "operatorEmail" = ${normalized}
        AND status = 'completed'
      ORDER BY "createdAt" DESC
      LIMIT 50
    `;

    return res.json({
      assessments: rows.map(r => ({
        id: r.id,
        entityId: r.entityId,
        entityName: BUSINESS_UNIT_NAMES[r.entityId] ?? r.entityId,
        createdAt: r.createdAt,
        overallScore: r.overallScore,
      })),
    });
  } catch (error) {
    console.error("assessments/list failed:", error);
    return res.status(500).json({ error: "Query failure", details: String(error) });
  }
}
