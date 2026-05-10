import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_lib/cors.js";
import { sql, PILLAR_IDS } from "./_lib/db.js";

// Drift Detection Engine — patent Claim 4.
// Port of server.ts:643-683. Compares current assessment against the prior
// completed assessment for the same entity.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { assessmentId } = req.body ?? {};
  if (!assessmentId) return res.status(400).json({ error: "assessmentId required" });

  const [current] = await sql<{ id: string; entityId: string; createdAt: string }[]>`
    SELECT id, "entityId", "createdAt" FROM assessments WHERE id = ${assessmentId}
  `;
  if (!current) return res.status(404).json({ error: "Not found" });

  const [previous] = await sql<{ id: string }[]>`
    SELECT id FROM assessments
    WHERE "entityId" = ${current.entityId}
      AND status = 'completed'
      AND id != ${assessmentId}
      AND "createdAt" < ${current.createdAt}
    ORDER BY "createdAt" DESC LIMIT 1
  `;

  if (!previous) {
    return res.json({ drifts: [], message: "No prior baseline detected." });
  }

  const currScores = await sql<{ pillarId: string; pillarScore: number }[]>`
    SELECT "pillarId", "pillarScore" FROM maturity_vectors
    WHERE "assessmentId" = ${assessmentId} AND "dimensionId" = 'AGGREGATE'
  `;
  const prevScores = await sql<{ pillarId: string; pillarScore: number }[]>`
    SELECT "pillarId", "pillarScore" FROM maturity_vectors
    WHERE "assessmentId" = ${previous.id} AND "dimensionId" = 'AGGREGATE'
  `;
  const currMap = new Map(currScores.map(s => [s.pillarId, s.pillarScore]));
  const prevMap = new Map(prevScores.map(s => [s.pillarId, s.pillarScore]));

  const drifts: { pillarId: string; deltaScore: number }[] = [];

  await sql.begin(async tx => {
    await tx`DELETE FROM drift_records WHERE "assessmentId" = ${assessmentId}`;
    for (const pillarId of PILLAR_IDS) {
      const curr = currMap.get(pillarId) || 0;
      const prev = prevMap.get(pillarId) || 0;
      const delta = curr - prev;
      await tx`
        INSERT INTO drift_records ("assessmentId", "entityId", "pillarId", "deltaScore")
        VALUES (${assessmentId}, ${current.entityId}, ${pillarId}, ${delta})
      `;
      drifts.push({ pillarId, deltaScore: delta });
    }
  });

  return res.json({ drifts });
}
