import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_lib/cors.js";
import { sql } from "./_lib/db.js";

// AI Roadmap Engine — patent Claim 5.
// Rule-based priority = expectedUplift / (costScore × durationScore).
// Port of server.ts:685-740.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { assessmentId } = req.body ?? {};
  if (!assessmentId) return res.status(400).json({ error: "assessmentId required" });

  const scores = await sql<{ pillarId: string; pillarScore: number }[]>`
    SELECT "pillarId", "pillarScore" FROM maturity_vectors
    WHERE "assessmentId" = ${assessmentId} AND "dimensionId" = 'AGGREGATE'
  `;
  const benchmarks = await sql<{ pillarId: string; score: number }[]>`
    SELECT "pillarId", score FROM benchmarks WHERE type = 'target'
  `;
  const bMap = new Map(benchmarks.map(b => [b.pillarId, b.score]));

  const gaps = scores
    .filter(s => {
      const target = bMap.get(s.pillarId) ?? 4.0;
      return s.pillarScore < target;
    })
    .map(s => s.pillarId);

  if (!gaps.length) {
    await sql`DELETE FROM roadmap_for_assessment WHERE "assessmentId" = ${assessmentId}`;
    return res.json({ assigned: [] });
  }

  const actions = await sql<{
    id: string;
    pillarId: string;
    dimensionId: string;
    description: string;
    expectedUplift: number;
    costScore: number;
    durationScore: number;
  }[]>`SELECT * FROM roadmap_actions WHERE "pillarId" = ANY(${gaps as any})`;

  const scored = actions
    .map(a => ({ ...a, priorityScore: a.expectedUplift / (a.costScore * a.durationScore) }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const assigned = await sql.begin(async tx => {
    await tx`DELETE FROM roadmap_for_assessment WHERE "assessmentId" = ${assessmentId}`;
    const rows: any[] = [];
    for (let idx = 0; idx < scored.length; idx++) {
      const a = scored[idx];
      const phase = idx < 3 ? "Phase 1" : idx < 6 ? "Phase 2" : "Phase 3";
      await tx`
        INSERT INTO roadmap_for_assessment ("assessmentId", "actionId", "priorityScore", phase)
        VALUES (${assessmentId}, ${a.id}, ${a.priorityScore}, ${phase})
      `;
      rows.push({ ...a, phase });
    }
    return rows;
  });

  return res.json({ assigned });
}
