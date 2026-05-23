import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../_lib/cors.js";
import { sql } from "../_lib/db.js";
import { shortPublic } from "../_lib/cache.js";
import { computeAnalytics, computeVectors, type RawResponse } from "../_lib/engines.js";
import { PILLAR_IDS, PILLAR_NAMES } from "../_lib/static.js";

/*
 * GET /api/assessments/trend?entityId=gen&operatorEmail=foo@gmail.com
 *
 * Returns the last 12 completed assessments for this operator+entity in
 * chronological order, with overall and per-pillar scores computed fresh.
 * Powers the "Pillar evolution" trend chart on the dashboard.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const rawEntity = req.query.entityId;
  const rawEmail = req.query.operatorEmail;
  const entityId = Array.isArray(rawEntity) ? rawEntity[0] : rawEntity;
  const email = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail;
  const benchmarkType =
    typeof req.query.benchmarkType === "string" ? req.query.benchmarkType : "target";

  if (!entityId || typeof entityId !== "string") {
    return res.status(400).json({ error: "entityId query parameter is required" });
  }
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "operatorEmail query parameter is required" });
  }
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const assessments = await sql<{ id: string; createdAt: string }[]>`
      SELECT id, "createdAt"
      FROM assessments
      WHERE "operatorEmail" = ${normalizedEmail}
        AND "entityId" = ${entityId}
        AND status = 'completed'
      ORDER BY "createdAt" ASC
      LIMIT 12
    `;

    if (assessments.length === 0) {
      return shortPublic(res).json({ sessions: [] });
    }

    const sessions = await Promise.all(
      assessments.map(async row => {
        const responses = await sql<{ questionId: number; score: number }[]>`
          SELECT "questionId", score FROM responses WHERE "assessmentId" = ${row.id}
        `;
        const raw: RawResponse[] = responses.map(r => ({
          questionId: r.questionId,
          score: r.score,
        }));
        const { pillarScores, overallScore } = computeVectors(raw);
        const { analytics } = computeAnalytics(pillarScores, benchmarkType);
        return {
          id: row.id,
          createdAt: row.createdAt,
          overallScore: Number(overallScore.toFixed(2)),
          pillars: PILLAR_IDS.map(pid => {
            const a = analytics.find(x => x.pillarId === pid);
            return {
              pillarId: pid,
              pillarName: PILLAR_NAMES[pid],
              score: a ? a.score : Number((pillarScores.get(pid) ?? 0).toFixed(2)),
            };
          }),
        };
      }),
    );

    return shortPublic(res).json({ sessions });
  } catch (error) {
    console.error("assessments/trend failed:", error);
    return res.status(500).json({ error: "Query failure", details: String(error) });
  }
}
