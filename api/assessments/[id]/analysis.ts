import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../../_lib/cors.js";
import { sql } from "../../_lib/db.js";

// Unified analysis endpoint — powers the RNOS Command Center dashboard.
// Port of server.ts:751-875.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const id = req.query.id as string;
  const benchmarkType =
    typeof req.query.benchmarkType === "string" ? req.query.benchmarkType : "target";

  const [assessment] = await sql<{
    id: string;
    entityId: string;
    createdAt: string;
    status: string;
    overallScore: number;
  }[]>`SELECT id, "entityId", "createdAt", status, "overallScore" FROM assessments WHERE id = ${id}`;

  if (!assessment) return res.status(404).json({ error: "Assessment not found" });

  const [pillars, vectors, dimensions, benchmarks, driftRecords, responseSummary, roadmap, entity] =
    await Promise.all([
      sql<{ id: string; name: string }[]>`SELECT id, name FROM pillars`,
      sql<{ pillarId: string; pillarScore: number }[]>`
        SELECT "pillarId", "pillarScore" FROM maturity_vectors
        WHERE "assessmentId" = ${id} AND "dimensionId" = 'AGGREGATE'
      `,
      sql<{ dimensionId: string; score: number }[]>`
        SELECT "dimensionId", "pillarScore" AS score FROM maturity_vectors
        WHERE "assessmentId" = ${id} AND "pillarId" IS NULL
      `,
      sql<{ id: number; pillarId: string; score: number }[]>`
        SELECT id, "pillarId", score FROM benchmarks WHERE type = ${benchmarkType}
      `,
      sql<{ pillarId: string; deltaScore: number; pillarName: string }[]>`
        SELECT dr."pillarId", dr."deltaScore", p.name AS "pillarName"
        FROM drift_records dr LEFT JOIN pillars p ON dr."pillarId" = p.id
        WHERE dr."assessmentId" = ${id}
      `,
      sql<{
        totalResponses: number;
        evidenceCount: number;
        noteCount: number;
        lastAnsweredAt: string | null;
      }[]>`
        SELECT
          COUNT(*)::int AS "totalResponses",
          SUM(CASE WHEN "evidenceName" IS NOT NULL AND "evidenceName" != '' THEN 1 ELSE 0 END)::int AS "evidenceCount",
          SUM(CASE WHEN note IS NOT NULL AND note != '' THEN 1 ELSE 0 END)::int AS "noteCount",
          MAX("answeredAt") AS "lastAnsweredAt"
        FROM responses WHERE "assessmentId" = ${id}
      `,
      sql<{
        id: string;
        pillarId: string;
        dimensionId: string;
        description: string;
        expectedUplift: number;
        costScore: number;
        durationScore: number;
        priorityScore: number;
        phase: string;
      }[]>`
        SELECT ra.*, rfa."priorityScore", rfa.phase
        FROM roadmap_for_assessment rfa
        JOIN roadmap_actions ra ON rfa."actionId" = ra.id
        WHERE rfa."assessmentId" = ${id}
        ORDER BY rfa."priorityScore" DESC
      `,
      sql<{ name: string }[]>`SELECT name FROM business_units WHERE id = ${assessment.entityId}`,
    ]);

  const bMap = new Map(benchmarks.map(b => [b.pillarId, b.score]));
  const summary = responseSummary[0];

  const analytics = pillars.map(p => {
    const v = vectors.find(x => x.pillarId === p.id);
    const score = v ? v.pillarScore : 0;
    const target = bMap.get(p.id) ?? 4.0;
    const gap = Number(Math.max(0, target - score).toFixed(2));
    return {
      pillarId: p.id,
      pillarName: p.name,
      score: Number(score.toFixed(2)),
      target,
      gap,
      status: score >= target ? "OPTIMIZED" : score >= target * 0.8 ? "ALIGNED" : "DEFICIENT",
      percentOfTarget: Number(((score / target) * 100).toFixed(1)),
    };
  });

  const regressions = driftRecords
    .filter(d => d.deltaScore < 0)
    .map(r => ({
      pillarId: r.pillarId,
      pillarName: r.pillarName || r.pillarId,
      delta: Number(r.deltaScore.toFixed(3)),
      severity: Math.abs(r.deltaScore) > 0.5 ? "CRITICAL" : "NOTICE",
    }));

  const totalAchieved = analytics.reduce((acc, curr) => acc + (curr.score >= curr.target ? 1 : 0), 0);
  const systemIntegrity = Number(((totalAchieved / Math.max(1, pillars.length)) * 100).toFixed(0));
  const benchmarkAverage = Number(
    (
      benchmarks.reduce((sum, b) => sum + b.score, 0) / Math.max(1, benchmarks.length)
    ).toFixed(2),
  );
  const averageGap = Number(
    (analytics.reduce((sum, a) => sum + a.gap, 0) / Math.max(1, analytics.length)).toFixed(2),
  );

  const criticalRegressionsCount = regressions.filter(r => r.severity === "CRITICAL").length;
  const maturityScore = Number((assessment.overallScore ?? 0).toFixed(2));
  const targetBaseline = benchmarkAverage;
  const isSynced = systemIntegrity >= 80 && criticalRegressionsCount === 0;

  let missionStatus = "NOMINAL_SYNC";
  if (criticalRegressionsCount > 0) missionStatus = "CRITICAL_GAP";
  else if (maturityScore < targetBaseline * 0.75) missionStatus = "STRUCTURAL_WEAKNESS";
  else if (regressions.length > 0) missionStatus = "VECTOR_DRIFT";

  return res.json({
    assessmentId: id,
    entityId: assessment.entityId,
    entityName: entity[0]?.name,
    overallScore: maturityScore,
    systemIntegrity,
    status: assessment.status,
    benchmarkType,
    benchmarkAverage,
    averageGap,
    timestamp: assessment.createdAt,
    criticalRegressionsCount,
    activeRoadmapCount: roadmap.length,
    targetBaseline,
    missionStatus,
    isSynced,
    responseSummary: {
      totalResponses: summary?.totalResponses ?? 0,
      evidenceCount: summary?.evidenceCount ?? 0,
      noteCount: summary?.noteCount ?? 0,
      lastAnsweredAt: summary?.lastAnsweredAt ?? assessment.createdAt,
    },
    benchmarkProfile: benchmarks.map(b => ({
      pillarId: b.pillarId,
      score: Number(b.score.toFixed(2)),
    })),
    analytics,
    dimensions: dimensions.map(d => ({
      id: d.dimensionId,
      name: d.dimensionId,
      score: Number(d.score.toFixed(2)),
    })),
    driftProfile: driftRecords.map(d => ({ pillar: d.pillarName || d.pillarId, delta: d.deltaScore })),
    regressions,
    roadmap,
  });
}
