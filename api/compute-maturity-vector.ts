import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_lib/cors.js";
import { sql, PILLAR_WEIGHTS, PILLAR_IDS } from "./_lib/db.js";

// Weighted Scoring Engine — patent Claim 2.
// Port of server.ts:561-641. Runs entirely in one SQL transaction.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { assessmentId } = req.body ?? {};
  if (!assessmentId) return res.status(400).json({ error: "assessmentId required" });

  try {
    await sql.begin(async tx => {
      // 1. Clear prior vectors for idempotency.
      await tx`DELETE FROM maturity_vectors WHERE "assessmentId" = ${assessmentId}`;

      // 2. Dimension-level averages (People/Process/Technology/Governance).
      const dimScores = await tx<{ dimensionId: string; score: number }[]>`
        SELECT q."dimensionId", AVG(r.score)::float AS score
        FROM responses r
        JOIN questions q ON r."questionId" = q.id
        WHERE r."assessmentId" = ${assessmentId}
        GROUP BY q."dimensionId"
      `;
      for (const d of dimScores) {
        await tx`
          INSERT INTO maturity_vectors ("assessmentId", "pillarId", "dimensionId", "weightedScore", "pillarScore")
          VALUES (${assessmentId}, NULL, ${d.dimensionId}, ${d.score}, ${d.score})
        `;
      }

      // 3. Pillar × dimension cells with weighted sums.
      const cells = await tx<
        { pillarId: string; dimensionId: string; weightedScore: number; matrixWeight: number }[]
      >`
        SELECT
          q."pillarId",
          q."dimensionId",
          SUM(r."weightedScore")::float AS "weightedScore",
          MAX(w.weight)::float AS "matrixWeight"
        FROM responses r
        JOIN questions q ON r."questionId" = q.id
        LEFT JOIN weights w ON w."pillarId" = q."pillarId" AND w."dimensionId" = q."dimensionId"
        WHERE r."assessmentId" = ${assessmentId}
        GROUP BY q."pillarId", q."dimensionId"
      `;

      // 4. Pillar rollup: pillarScore = Σ(cell weightedScore) / Σ(matrixWeight).
      const pillarScores = new Map<string, number>();
      for (const pillarId of PILLAR_IDS) {
        const pillarCells = cells.filter(c => c.pillarId === pillarId);
        const totalMatrixWeight = pillarCells.reduce((s, c) => s + (c.matrixWeight || 0), 0);
        const weightedSum = pillarCells.reduce((s, c) => s + (c.weightedScore || 0), 0);
        const pillarScore = totalMatrixWeight > 0 ? weightedSum / totalMatrixWeight : 0;
        pillarScores.set(pillarId, pillarScore);

        for (const cell of pillarCells) {
          await tx`
            INSERT INTO maturity_vectors ("assessmentId", "pillarId", "dimensionId", "weightedScore", "pillarScore")
            VALUES (${assessmentId}, ${cell.pillarId}, ${cell.dimensionId}, ${cell.weightedScore}, ${pillarScore})
          `;
        }

        await tx`
          INSERT INTO maturity_vectors ("assessmentId", "pillarId", "dimensionId", "weightedScore", "pillarScore")
          VALUES (${assessmentId}, ${pillarId}, 'AGGREGATE', ${weightedSum}, ${pillarScore})
        `;
      }

      // 5. Overall score using workbook pillar weights.
      const overall = PILLAR_IDS.reduce(
        (sum, id) => sum + (pillarScores.get(id) || 0) * PILLAR_WEIGHTS[id],
        0,
      );
      await tx`
        UPDATE assessments SET "overallScore" = ${overall}, status = 'completed' WHERE id = ${assessmentId}
      `;
    });

    const [row] = await sql<{ overallScore: number }[]>`
      SELECT "overallScore" FROM assessments WHERE id = ${assessmentId}
    `;
    return res.json({ overallScore: row?.overallScore ?? 0 });
  } catch (error) {
    console.error("Maturity vector compute failed:", error);
    return res.status(500).json({ error: "Compute failure", details: String(error) });
  }
}
